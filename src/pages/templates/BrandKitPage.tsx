import { useEffect, useState } from 'react'
import { Guard } from '@/components/common/Guard'
import { Link, useBlocker } from 'react-router-dom'
import { brandKitApi, templatesApi } from '@/api/endpoints/messaging.api'
import { errorMessage } from '@/api/errors'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { FormField } from '@/components/common/FormField'
import { QueryError } from '@/components/common/Misc'
import { TemplatePreview } from '@/components/features/messaging/TemplatePreview'
import { EmailBuilder } from '@/components/features/templates/EmailBuilder'
import { SkeletonLines } from '@/components/ui/EmptyState'
import { Segmented } from '@/components/ui/Segmented'
import { ROUTES } from '@/constants/routes.constants'
import { useAction, useAll, useTenantQuery } from '@/hooks/queries/resource.queries'
import type { BrandKit } from '@/types/messaging.types'
import { plural } from '@/utils/formatters/number.formatter'

type Tab = 'header' | 'footer' | 'defaults'
type KitDraft = Omit<BrandKit, 'id' | 'createdAt' | 'updatedAt'>

/** Shared email header and footer plus channel defaults, used across the template catalogue. */
const toDraft = ({ id: _id, createdAt: _c, updatedAt: _u, ...rest }: BrandKit): KitDraft => rest

export function BrandKitPage() {
  const kit = useTenantQuery('brand-kit', 'kit', brandKitApi.get)
  if (kit.isError) return <QueryError message={errorMessage(kit.error)} onRetry={() => kit.refetch()} />
  if (!kit.data) return <SkeletonLines lines={10} />
  return <KitEditor kit={kit.data} />
}

function KitEditor({ kit }: { kit: BrandKit }) {
  const templates = useAll('templates', templatesApi.list)
  const [draft, setDraft] = useState<KitDraft>(() => toDraft(kit))
  const [savedKey, setSavedKey] = useState(() => JSON.stringify(toDraft(kit)))
  const [tab, setTab] = useState<Tab>('header')
  const [selected, setSelected] = useState<string | null>(null)
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop')

  const save = useAction('brand-kit', () => brandKitApi.update(draft!), { success: 'Brand kit saved — every template using it is updated', onSuccess: (k) => setSavedKey(JSON.stringify(toDraft(k))) })
  const dirty = JSON.stringify(draft) !== savedKey
  const blocker = useBlocker(({ currentLocation, nextLocation }) => dirty && currentLocation.pathname !== nextLocation.pathname)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault()
        if (dirty && !save.isPending) save.mutate(undefined)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [dirty, save])

  const emails = (templates.data?.data ?? []).filter((t) => t.channel === 'email')
  const users = emails.filter((t) => t.brandHeader || t.brandFooter)
  const sample = emails.find((t) => t.brandHeader || t.brandFooter) ?? emails[0]

  return (
    <div className="tpl-editor-page">
      <div className="tpl-topbar">
        <Link to={ROUTES.TEMPLATES} className="btn btn-sm btn-icon btn-light" aria-label="Back to templates"><i className="ri-arrow-left-line" /></Link>
        <div className="min-w-0">
          <div className="fw-semibold">Brand kit</div>
          <div className="text-muted fs-xs">Shared header &amp; footer · used by {plural(users.length, 'email template')}</div>
        </div>
        <Segmented<Tab> ariaLabel="Section" value={tab} onChange={(t) => { setTab(t); setSelected(null) }} options={[{ value: 'header', label: 'Header', icon: 'ri-layout-top-line' }, { value: 'footer', label: 'Footer', icon: 'ri-layout-bottom-line' }, { value: 'defaults', label: 'Channel defaults', icon: 'ri-settings-4-line' }]} />
        <span className="flex-1" />
        {tab !== 'defaults' && <Segmented<'desktop' | 'mobile'> ariaLabel="Device" value={device} onChange={setDevice} options={[{ value: 'desktop', label: '', icon: 'ri-computer-line', title: 'Desktop' }, { value: 'mobile', label: '', icon: 'ri-smartphone-line', title: 'Mobile' }]} />}
        <span className={`save-state${dirty ? ' dirty' : ''}`}>{dirty ? 'Unsaved changes' : 'All changes saved'}</span>
        <Guard permission="templates.manage">
  <button type="button" className="btn btn-primary" disabled={!dirty || save.isPending} onClick={() => save.mutate(undefined)}>{save.isPending ? 'Saving…' : 'Save kit'}</button>
</Guard>
      </div>

      {tab === 'defaults' ? (
        <div className="row g-4">
          <div className="col-lg-6">
            <div className="card">
              <div className="card-body">
                <h6 className="tpl-section-title mb-3">Applied to new templates</h6>
                <FormField id="wa-footer" label="WhatsApp footer" hint="Pre-filled in new WhatsApp templates. Up to 60 characters, no variables." className="mb-3">
                  <input id="wa-footer" className="form-control" maxLength={60} value={draft.whatsappFooter} onChange={(e) => setDraft({ ...draft, whatsappFooter: e.target.value })} />
                </FormField>
                <FormField id="sms-prefix" label="SMS sender prefix" hint="Suggested at the start of every SMS so people know who is texting." className="mb-0">
                  <input id="sms-prefix" className="form-control" maxLength={24} value={draft.smsPrefix} onChange={(e) => setDraft({ ...draft, smsPrefix: e.target.value })} />
                </FormField>
              </div>
            </div>
          </div>
          <div className="col-lg-6">
            <div className="card">
              <div className="card-body">
                <h6 className="tpl-section-title mb-3">Where the kit is used</h6>
                {users.length ? (
                  <ul className="list-unstyled mb-0 d-flex flex-column gap-2">
                    {users.map((t) => (
                      <li key={t.id} className="d-flex align-items-center gap-2">
                        <i className="ri-mail-line text-muted" />
                        <Link to={`/templates/${t.id}`} className="text-reset flex-1 text-truncate">{t.name}</Link>
                        <span className="text-muted fs-xs">{[t.brandHeader && 'header', t.brandFooter && 'footer'].filter(Boolean).join(' + ')}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted fs-sm mb-0">No template uses the shared header or footer yet. Turn them on in a template’s <strong>Style</strong> tab.</p>
                )}
              </div>
            </div>
            {sample && (
              <div className="card mt-4">
                <div className="card-body">
                  <h6 className="tpl-section-title mb-3">Preview with “{sample.name}”</h6>
                  <TemplatePreview template={{ ...sample, brandHeader: true, brandFooter: true, design: sample.design }} size="full" />
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <EmailBuilder
          bare
          value={{ subject: '', previewText: '', blocks: draft[tab], design: draft.design, examples: {} }}
          onChange={(patch) => setDraft({ ...draft, ...(patch.blocks ? { [tab]: patch.blocks } : {}), ...(patch.design ? { design: patch.design } : {}) })}
          selected={selected}
          onSelect={setSelected}
          device={device}
          flagged={new Set()}
        />
      )}

      <ConfirmDialog open={blocker.state === 'blocked'} title="Leave without saving?" message="Your changes to the brand kit will be lost." confirmLabel="Leave" danger onClose={() => blocker.reset?.()} onConfirm={() => blocker.proceed?.()} />
    </div>
  )
}
