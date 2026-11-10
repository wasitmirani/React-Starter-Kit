import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useToast } from '@/hooks/useToast'
import { domainsApi, sendersApi } from '@/api/endpoints/channels.api'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { FormField } from '@/components/common/FormField'
import { CopyButton } from '@/components/common/Misc'
import { Modal } from '@/components/common/Modal'
import { PageHeader } from '@/components/common/PageHeader'
import { Panel } from '@/components/common/Panel'
import { ChannelAccountsPanel } from '@/components/features/channels/ChannelAccounts'
import { MoreMenu } from '@/components/ui/Dropdown'
import { EmptyState, SkeletonLines } from '@/components/ui/EmptyState'
import { StatusBadge, ToneBadge } from '@/components/ui/StatusBadge'
import { Tabs } from '@/components/ui/Tabs'
import { useAction, useAll } from '@/hooks/queries/resource.queries'
import type { DnsRecord, EmailSender, SenderDomain } from '@/types/channel.types'
import { formatRelativeTime } from '@/utils/formatters/date.formatter'

type Tab = 'domains' | 'senders' | 'accounts'

const PURPOSE: Record<DnsRecord['purpose'], string> = { spf: 'SPF', dkim: 'DKIM', dmarc: 'DMARC', tracking: 'Link tracking', return_path: 'Return path' }

function DomainCard({ domain }: { domain: SenderDomain }) {
  const [open, setOpen] = useState(domain.status !== 'verified')
  const [removing, setRemoving] = useState(false)
  const verify = useAction('domains', domainsApi.verify, { success: (d) => (d.status === 'verified' ? 'Domain verified' : 'Some records are still missing') })
  const remove = useAction('domains', domainsApi.remove, { success: 'Domain removed' })
  return (
    <Panel
      className="mb-4"
      title={<span className="d-flex align-items-center gap-2"><i className="ri-global-line text-muted" />{domain.domain}</span>}
      description={domain.lastCheckedAt ? `Checked ${formatRelativeTime(domain.lastCheckedAt)}` : undefined}
      actions={
        <>
          <StatusBadge status={domain.status} />
          <button type="button" className="btn btn-sm btn-light" onClick={() => setOpen(!open)}>{open ? 'Hide records' : 'DNS records'}</button>
          <button type="button" className="btn btn-sm btn-primary" disabled={verify.isPending} onClick={() => verify.mutate(domain.id)}>{verify.isPending ? 'Checking…' : 'Verify'}</button>
          <MoreMenu items={[{ key: 'remove', label: 'Remove domain', icon: 'ri-delete-bin-line', danger: true, onSelect: () => setRemoving(true) }]} />
        </>
      }
      flush
    >
      {open && (
        <div className="table-responsive">
          <table className="table align-middle mb-0 fs-sm">
            <thead className="table-light"><tr><th>Purpose</th><th>Type</th><th>Host</th><th>Value</th><th>Status</th></tr></thead>
            <tbody>
              {domain.records.map((r) => (
                <tr key={r.host + r.purpose}>
                  <td className="fw-medium">{PURPOSE[r.purpose]}</td>
                  <td><code>{r.type}</code></td>
                  <td><div className="d-flex align-items-center gap-1"><code className="text-truncate d-inline-block" style={{ maxWidth: 220 }}>{r.host}</code><CopyButton value={r.host} label="" className="btn btn-sm btn-link p-0" /></div></td>
                  <td><div className="d-flex align-items-center gap-1"><code className="text-truncate d-inline-block" style={{ maxWidth: 260 }}>{r.value}</code><CopyButton value={r.value} label="" className="btn btn-sm btn-link p-0" /></div></td>
                  <td><StatusBadge status={r.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-muted fs-sm px-4 py-3 mb-0">Add these records at your DNS provider. Changes can take up to 48 hours to propagate. A DMARC policy is required by Gmail and Yahoo for bulk senders.</p>
        </div>
      )}
      <ConfirmDialog open={removing} title="Remove domain?" message={<>Senders on <strong>{domain.domain}</strong> can no longer send.</>} confirmLabel="Remove" danger busy={remove.isPending} onClose={() => setRemoving(false)} onConfirm={() => remove.mutate(domain.id)} />
    </Panel>
  )
}

function SenderModal({ open, onClose, sender }: { open: boolean; onClose: () => void; sender: EmailSender | null }) {
  const [name, setName] = useState(sender?.name ?? '')
  const [email, setEmail] = useState(sender?.email ?? '')
  const [replyTo, setReplyTo] = useState(sender?.replyTo ?? '')
  const valid = name.trim() && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)
  const save = useAction('senders', () => (sender ? sendersApi.update(sender.id, { name, email, replyTo: replyTo || null }) : sendersApi.create({ name, email, replyTo: replyTo || null, verified: false, isDefault: false })), {
    success: sender ? 'Sender updated' : 'Sender added. We sent a verification email to that address.',
    onSuccess: onClose,
  })
  return (
    <Modal open={open} onClose={onClose} title={sender ? 'Edit sender' : 'Add sender'} footer={<><button type="button" className="btn btn-light" onClick={onClose}>Cancel</button><button type="button" className="btn btn-primary" disabled={!valid || save.isPending} onClick={() => save.mutate(undefined)}>Save</button></>}>
      <FormField id="s-name" label="From name" className="mb-3"><input id="s-name" className="form-control" value={name} onChange={(e) => setName(e.target.value)} /></FormField>
      <FormField id="s-email" label="From email" hint="Must be on a verified domain, or verified by email." className="mb-3"><input id="s-email" type="email" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} /></FormField>
      <FormField id="s-reply" label="Reply-to (optional)"><input id="s-reply" type="email" className="form-control" value={replyTo} onChange={(e) => setReplyTo(e.target.value)} /></FormField>
    </Modal>
  )
}

export function EmailChannelPage() {
  const [params, setParams] = useSearchParams()
  const toast = useToast()
  const [tab, setTab] = useState<Tab>(params.has('connected') || params.has('oauth_error') ? 'accounts' : 'domains')
  // Back from Google / Microsoft sign-in: report the result once and clean the URL.
  useEffect(() => {
    const connected = params.get('connected')
    const error = params.get('oauth_error')
    if (!connected && !error) return
    if (connected) toast.success(`${connected === 'gmail' ? 'Gmail' : 'Outlook'} account ${params.get('account') ?? ''} is connected`)
    else toast.error(`Could not connect: ${error}`)
    setParams({}, { replace: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  const domains = useAll('domains', domainsApi.list)
  const senders = useAll('senders', sendersApi.list)
  const [adding, setAdding] = useState(false)
  const [newDomain, setNewDomain] = useState('')
  const [editingSender, setEditingSender] = useState<EmailSender | null | 'new'>(null)
  const addDomain = useAction(
    'domains',
    () => {
      const d = newDomain.trim().toLowerCase()
      return domainsApi.create({
        domain: d,
        status: 'pending',
        lastCheckedAt: null,
        records: [
          { type: 'TXT', purpose: 'spf', host: d, value: 'v=spf1 include:amazonses.com ~all', status: 'pending' },
          { type: 'CNAME', purpose: 'dkim', host: `bird1._domainkey.${d}`, value: 'bird1.dkim.amazonses.com', status: 'pending' },
          { type: 'TXT', purpose: 'dmarc', host: `_dmarc.${d}`, value: `v=DMARC1; p=none; rua=mailto:dmarc@${d}`, status: 'pending' },
          { type: 'CNAME', purpose: 'tracking', host: `link.${d}`, value: 'track.birdcrm.app', status: 'pending' },
        ],
      })
    },
    { success: 'Domain added. Add the DNS records, then verify.', onSuccess: () => { setAdding(false); setNewDomain('') } },
  )
  const setDefault = useAction('senders', (s: EmailSender) => sendersApi.update(s.id, { isDefault: true }), { success: 'Default sender updated' })
  const removeSender = useAction('senders', sendersApi.remove, { success: 'Sender removed' })

  return (
    <>
      <PageHeader title="Email" description="Sending domains, sender addresses and email providers." />
      <Tabs<Tab> className="mb-4" value={tab} onChange={setTab} items={[{ value: 'domains', label: 'Domains', count: domains.data?.total }, { value: 'senders', label: 'Senders', count: senders.data?.total }, { value: 'accounts', label: 'Providers' }]} />

      {tab === 'domains' && (
        <>
          <div className="d-flex justify-content-end mb-3"><button type="button" className="btn btn-primary" onClick={() => setAdding(true)}><i className="ri-add-line me-1" />Add domain</button></div>
          {domains.isLoading ? <SkeletonLines lines={5} /> : (domains.data?.data ?? []).map((d) => <DomainCard key={d.id} domain={d} />)}
          {domains.data?.total === 0 && <div className="card"><EmptyState icon="ri-global-line" title="No sending domain" description="Authenticate your domain with SPF, DKIM and DMARC to land in the inbox." /></div>}
        </>
      )}

      {tab === 'senders' && (
        <Panel title="Sender addresses" actions={<button type="button" className="btn btn-sm btn-primary" onClick={() => setEditingSender('new')}><i className="ri-add-line me-1" />Add sender</button>} flush>
          <ul className="list-group list-group-flush">
            {(senders.data?.data ?? []).map((s) => (
              <li key={s.id} className="list-group-item d-flex align-items-center gap-3 py-3">
                <span className="icon-tile icon-tile-sm bg-primary-subtle text-primary"><i className="ri-at-line" /></span>
                <div className="flex-1 min-w-0">
                  <div className="fw-medium d-flex gap-2 align-items-center">{s.name}{s.isDefault && <ToneBadge tone="primary">Default</ToneBadge>}</div>
                  <div className="text-muted fs-sm">{s.email}{s.replyTo && ` · reply to ${s.replyTo}`}</div>
                </div>
                <StatusBadge status={s.verified ? 'verified' : 'pending'} />
                <MoreMenu
                  items={[
                    { key: 'edit', label: 'Edit', icon: 'ri-edit-line', onSelect: () => setEditingSender(s) },
                    ...(!s.isDefault && s.verified ? [{ key: 'default', label: 'Make default', icon: 'ri-star-line', onSelect: () => setDefault.mutate(s) }] : []),
                    'divider',
                    { key: 'remove', label: 'Remove', icon: 'ri-delete-bin-line', danger: true, onSelect: () => removeSender.mutate(s.id) },
                  ]}
                />
              </li>
            ))}
          </ul>
        </Panel>
      )}

      {tab === 'accounts' && <ChannelAccountsPanel channel="email" title="Email providers" />}

      <Modal open={adding} onClose={() => setAdding(false)} title="Add sending domain" footer={<><button type="button" className="btn btn-light" onClick={() => setAdding(false)}>Cancel</button><button type="button" className="btn btn-primary" disabled={!/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(newDomain.trim()) || addDomain.isPending} onClick={() => addDomain.mutate(undefined)}>Add domain</button></>}>
        <FormField id="d-name" label="Domain" hint="Use a subdomain like mail.example.com to keep marketing reputation separate.">
          <input id="d-name" className="form-control" placeholder="mail.example.com" value={newDomain} onChange={(e) => setNewDomain(e.target.value)} autoFocus />
        </FormField>
      </Modal>
      {editingSender !== null && <SenderModal open onClose={() => setEditingSender(null)} sender={editingSender === 'new' ? null : editingSender} />}
    </>
  )
}
