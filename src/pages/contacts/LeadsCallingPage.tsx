import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import BreadCrumb from '@/components/common/BreadCrumb'
import { contactsService } from '@/services/contacts.service'
import { agentsService } from '@/services/agents.service'
import { phoneNumbersService } from '@/services/phone-numbers.service'
import { callsService } from '@/services/calls.service'
import { CallLeadPanel } from '@/components/features/calls/CallLeadPanel'
import { Can } from '@/components/common/Can'
import { PERMISSIONS } from '@/config/permissions'
import { useToast } from '@/hooks/useToast'
import type { Contact } from '@/types/contact.types'
import { ROUTES, contactDetailPath, callDetailPath } from '@/constants/routes.constants'

export function ContactsLeadsPage() {
  const toast = useToast()
  const queryClient = useQueryClient()
  const [selectedLead, setSelectedLead] = useState<Contact | null>(null)
  const [agentId, setAgentId] = useState('')
  const [phoneNumberId, setPhoneNumberId] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['contacts', 'leads'],
    queryFn: () => contactsService.list({ page: 1, per_page: 100 }),
  })

  const agentsQuery = useQuery({
    queryKey: ['agents', 'leads-page'],
    queryFn: () => agentsService.list({ page: 1, per_page: 50 }),
  })
  const phonesQuery = useQuery({
    queryKey: ['phone-numbers', 'leads-page'],
    queryFn: () => phoneNumbersService.list({ page: 1, per_page: 50 }),
  })

  const leads = useMemo(
    () => (data?.data ?? []).filter((c) => c.tags.includes('lead')),
    [data],
  )

  const publishedAgents = (agentsQuery.data?.data ?? []).filter((a) => a.status === 'active')
  const activePhones = (phonesQuery.data?.data ?? []).filter(
    (p) => p.status === 'available' || p.status === 'assigned',
  )

  const bulkDial = useMutation({
    mutationFn: async () => {
      if (!phoneNumberId) throw new Error('Choose a caller ID number')
      const queue = selectedLead ? [selectedLead] : leads
      let lastCallId = ''
      for (const lead of queue) {
        const res = await callsService.dialLead({
          phoneNumberId,
          toNumber: lead.phone,
          agentId: agentId || undefined,
          contactName: `${lead.firstName} ${lead.lastName}`.trim(),
        })
        if (res.success && res.data) lastCallId = res.data.callId
        await new Promise((r) => setTimeout(r, 400))
      }
      return lastCallId
    },
    onSuccess: (callId) => {
      void queryClient.invalidateQueries({ queryKey: ['calls'] })
      toast.success('Lead calls started — open Live Calls to monitor')
      if (callId) window.location.href = callDetailPath(callId)
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Bulk dial failed')
    },
  })

  const quickDial = useMutation({
    mutationFn: (lead: Contact) =>
      callsService.dialLead({
        phoneNumberId,
        toNumber: lead.phone,
        agentId: agentId || undefined,
        contactName: `${lead.firstName} ${lead.lastName}`.trim(),
      }),
    onSuccess: (res, lead) => {
      if (!res.success || !res.data) {
        toast.error(res.message ?? 'Call failed')
        return
      }
      toast.success(`Calling ${lead.firstName}…`)
      void queryClient.invalidateQueries({ queryKey: ['calls'] })
      window.location.href = callDetailPath(res.data.callId)
    },
  })

  const setupReady = publishedAgents.length > 0 && activePhones.length > 0 && Boolean(phoneNumberId)

  return (
    <>
      <BreadCrumb
        activePage="Lead Calling"
        breadcrumbs={[{ label: 'Contacts', href: ROUTES.CONTACTS }]}
      />

      <div className="grid grid-cols-12 gap-4">
        <div className="xl:col-span-4 col-span-12">
          <div className="box">
            <div className="box-header">
              <div className="box-title">Quick setup</div>
            </div>
            <div className="box-body space-y-3">
              <p className="text-textmuted fs-13 mb-2">
                Pick your AI agent and caller ID once, then call any lead with one click.
              </p>
              <div>
                <label className="form-label fs-12">AI agent</label>
                <select
                  className="form-control form-control-sm"
                  value={agentId}
                  onChange={(e) => setAgentId(e.target.value)}
                >
                  <option value="">Auto (from phone)</option>
                  {publishedAgents.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="form-label fs-12">Caller ID</label>
                <select
                  className="form-control form-control-sm"
                  value={phoneNumberId}
                  onChange={(e) => setPhoneNumberId(e.target.value)}
                >
                  <option value="">Choose number…</option>
                  {activePhones.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.number}
                    </option>
                  ))}
                </select>
              </div>
              <SetupHint ok={publishedAgents.length > 0} label="Published AI agent" />
              <SetupHint ok={activePhones.length > 0} label="Phone number added" />
              <SetupHint ok={Boolean(phoneNumberId)} label="Caller ID selected" />
              <Can permission={PERMISSIONS.CAMPAIGNS_START}>
                <button
                  type="button"
                  className="ti-btn ti-btn-primary w-full"
                  disabled={!setupReady || bulkDial.isPending || leads.length === 0}
                  onClick={() => bulkDial.mutate()}
                >
                  <i className="ri-phone-forward-fill me-1" />
                  {bulkDial.isPending ? 'Dialing…' : `Call all ${leads.length} leads`}
                </button>
              </Can>
              <Link to={ROUTES.CAMPAIGN_CREATE} className="ti-btn ti-btn-outline-primary w-full">
                Or create a campaign
              </Link>
            </div>
          </div>

          {selectedLead && (
            <div className="box mt-4">
              <div className="box-body">
                <CallLeadPanel
                  target={{
                    name: `${selectedLead.firstName} ${selectedLead.lastName}`.trim(),
                    phone: selectedLead.phone,
                  }}
                  defaultAgentId={agentId}
                  defaultPhoneNumberId={phoneNumberId}
                  onDialed={() => setSelectedLead(null)}
                />
              </div>
            </div>
          )}
        </div>

        <div className="xl:col-span-8 col-span-12">
          <div className="box">
            <div className="box-header flex items-center justify-between flex-wrap gap-2">
              <div>
                <div className="box-title">Leads</div>
                <p className="text-textmuted mb-0 fs-12">{leads.length} contacts tagged as lead</p>
              </div>
              <Link to={ROUTES.CALLS_LIVE} className="ti-btn ti-btn-outline-light ti-btn-sm">
                Live Calls
              </Link>
            </div>
            <div className="box-body table-responsive">
              {isLoading ? (
                <p className="text-textmuted">Loading leads…</p>
              ) : leads.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-textmuted mb-2">No leads yet.</p>
                  <Link to={ROUTES.CONTACTS_IMPORT} className="ti-btn ti-btn-primary ti-btn-sm">
                    Import contacts
                  </Link>
                </div>
              ) : (
                <table className="table mb-0">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Phone</th>
                      <th>Company</th>
                      <th style={{ width: 160 }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leads.map((c) => (
                      <tr key={c.id}>
                        <td>
                          <Link to={contactDetailPath(c.id)} className="text-primary font-medium">
                            {c.firstName} {c.lastName}
                          </Link>
                        </td>
                        <td>{c.phone}</td>
                        <td>{c.company ?? '—'}</td>
                        <td>
                          <div className="flex gap-1">
                            <Can permission={PERMISSIONS.CAMPAIGNS_START}>
                              <button
                                type="button"
                                className="ti-btn ti-btn-success ti-btn-sm"
                                disabled={!setupReady || quickDial.isPending}
                                onClick={() => quickDial.mutate(c)}
                              >
                                <i className="ri-phone-fill me-1" />
                                Call
                              </button>
                            </Can>
                            <button
                              type="button"
                              className="ti-btn ti-btn-outline-primary ti-btn-sm"
                              onClick={() => setSelectedLead(c)}
                            >
                              Setup
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

function SetupHint({ ok, label }: { ok: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2 fs-12">
      <i className={`ri-${ok ? 'checkbox-circle-fill text-success' : 'close-circle-line text-textmuted'}`} />
      {label}
    </div>
  )
}
