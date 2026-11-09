import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { listsApi } from '@/api/endpoints/crm.api'
import { formsApi } from '@/api/endpoints/platform.api'
import { FormField } from '@/components/common/FormField'
import { CopyButton } from '@/components/common/Misc'
import { PageHeader } from '@/components/common/PageHeader'
import { Panel } from '@/components/common/Panel'
import { OptionCard, Switch } from '@/components/ui/Controls'
import { SkeletonLines } from '@/components/ui/EmptyState'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { Tabs } from '@/components/ui/Tabs'
import { ROUTES } from '@/constants/routes.constants'
import { useAction, useAll, useOne } from '@/hooks/queries/resource.queries'
import type { FormFieldType, SignupForm, SignupFormField } from '@/types/platform.types'

type Editable = Omit<SignupForm, 'id' | 'createdAt' | 'updatedAt' | 'views' | 'submissions' | 'status'>
type Tab = 'design' | 'settings' | 'share'

const FIELD_TYPES: { type: FormFieldType; label: string; attribute: string }[] = [
  { type: 'text', label: 'First name', attribute: 'first_name' },
  { type: 'text', label: 'Last name', attribute: 'last_name' },
  { type: 'phone', label: 'Phone', attribute: 'phone' },
  { type: 'text', label: 'Company', attribute: 'company' },
  { type: 'date', label: 'Birthday', attribute: 'birthday' },
  { type: 'select', label: 'Dropdown', attribute: 'custom' },
  { type: 'checkbox', label: 'Checkbox', attribute: 'accepts_marketing' },
]

export function FormBuilderPage() {
  const { id } = useParams<{ id: string }>()
  const form = useOne('forms', formsApi.get, id)
  const lists = useAll('lists', listsApi.list)
  const [draft, setDraft] = useState<Editable | null>(null)
  const [dirty, setDirty] = useState(false)
  const [tab, setTab] = useState<Tab>('design')

  useEffect(() => {
    if (form.data && !dirty) {
      const { id: _i, createdAt: _c, updatedAt: _u, views: _v, submissions: _s, status: _st, ...rest } = form.data
      setDraft(rest)
    }
  }, [form.data, dirty])

  const save = useAction('forms', () => formsApi.update(id!, draft!), { success: 'Form saved', onSuccess: () => setDirty(false) })
  const publish = useAction('forms', async () => {
    if (dirty) await formsApi.update(id!, draft!)
    return formsApi.update(id!, { status: form.data!.status === 'published' ? 'draft' : 'published' })
  }, { success: (f) => (f.status === 'published' ? 'Form is live' : 'Form unpublished'), onSuccess: () => setDirty(false) })

  if (!form.data || !draft) return <SkeletonLines lines={10} />
  const f = form.data
  const edit = (patch: Partial<Editable>) => {
    setDraft({ ...draft, ...patch })
    setDirty(true)
  }
  const updateField = (fid: string, patch: Partial<SignupFormField>) => edit({ fields: draft.fields.map((x) => (x.id === fid ? { ...x, ...patch } : x)) })
  const hostedUrl = `https://forms.birdcrm.app/f/${f.id}`
  const embed = `<script src="https://forms.birdcrm.app/embed.js" data-form="${f.id}" async></script>`

  return (
    <>
      <PageHeader
        back={{ label: 'Forms', to: ROUTES.FORMS }}
        title={<input className="form-control form-control-lg border-0 px-0 fw-semibold bg-transparent" style={{ fontSize: 'inherit' }} value={draft.name} onChange={(e) => edit({ name: e.target.value })} aria-label="Form name" />}
        meta={<StatusBadge status={f.status} />}
        actions={
          <>
            <button type="button" className="btn btn-light" disabled={!dirty || save.isPending} onClick={() => save.mutate(undefined)}>Save</button>
            <button type="button" className={`btn ${f.status === 'published' ? 'btn-warning' : 'btn-success'}`} disabled={publish.isPending} onClick={() => publish.mutate(undefined)}>
              {f.status === 'published' ? 'Unpublish' : 'Publish'}
            </button>
          </>
        }
      />
      <Tabs<Tab> className="mb-4" value={tab} onChange={setTab} items={[{ value: 'design', label: 'Design' }, { value: 'settings', label: 'Settings' }, { value: 'share', label: 'Share & embed' }]} />

      <div className="row g-4">
        <div className="col-xl-6">
          {tab === 'design' && (
            <>
              <Panel title="Content" className="mb-4">
                <FormField id="f-title" label="Headline" className="mb-3"><input id="f-title" className="form-control" value={draft.title} onChange={(e) => edit({ title: e.target.value })} /></FormField>
                <FormField id="f-desc" label="Description" className="mb-3"><textarea id="f-desc" rows={2} className="form-control" value={draft.description} onChange={(e) => edit({ description: e.target.value })} /></FormField>
                <FormField id="f-submit" label="Button label"><input id="f-submit" className="form-control" value={draft.submitLabel} onChange={(e) => edit({ submitLabel: e.target.value })} /></FormField>
              </Panel>
              <Panel title="Fields">
                <div className="d-flex flex-column gap-2 mb-3">
                  {draft.fields.map((field, i) => (
                    <div key={field.id} className="d-flex align-items-center gap-2 border rounded-3 p-2">
                      <div className="d-flex flex-column">
                        <button type="button" className="btn btn-sm btn-link p-0 lh-1" disabled={i === 0} aria-label="Move up" onClick={() => { const n = [...draft.fields]; [n[i - 1], n[i]] = [n[i], n[i - 1]]; edit({ fields: n }) }}><i className="ri-arrow-up-s-line" /></button>
                        <button type="button" className="btn btn-sm btn-link p-0 lh-1" disabled={i === draft.fields.length - 1} aria-label="Move down" onClick={() => { const n = [...draft.fields]; [n[i + 1], n[i]] = [n[i], n[i + 1]]; edit({ fields: n }) }}><i className="ri-arrow-down-s-line" /></button>
                      </div>
                      <input className="form-control form-control-sm" value={field.label} onChange={(e) => updateField(field.id, { label: e.target.value })} aria-label="Field label" />
                      <code className="fs-xs text-muted text-nowrap">{field.attribute}</code>
                      <div className="form-check mb-0 text-nowrap">
                        <input id={`req-${field.id}`} type="checkbox" className="form-check-input" checked={field.required} disabled={field.attribute === 'email'} onChange={(e) => updateField(field.id, { required: e.target.checked })} />
                        <label htmlFor={`req-${field.id}`} className="form-check-label fs-sm">Required</label>
                      </div>
                      <button type="button" className="btn btn-sm btn-light text-danger" disabled={field.attribute === 'email'} aria-label="Remove field" onClick={() => edit({ fields: draft.fields.filter((x) => x.id !== field.id) })}><i className="ri-close-line" /></button>
                    </div>
                  ))}
                </div>
                <div className="d-flex flex-wrap gap-2">
                  {FIELD_TYPES.filter((t) => !draft.fields.some((x) => x.attribute === t.attribute && t.attribute !== 'custom')).map((t) => (
                    <button key={t.label} type="button" className="btn btn-sm btn-light" onClick={() => edit({ fields: [...draft.fields, { id: crypto.randomUUID(), type: t.type, label: t.label, attribute: t.attribute, required: false, options: t.type === 'select' ? ['Option 1', 'Option 2'] : [] }] })}>
                      <i className="ri-add-line me-1" />{t.label}
                    </button>
                  ))}
                </div>
              </Panel>
            </>
          )}
          {tab === 'settings' && (
            <Panel title="Settings">
              <div className="row g-3 mb-4">
                {(['embedded', 'popup', 'landing_page'] as const).map((t) => (
                  <div key={t} className="col-md-4">
                    <OptionCard selected={draft.type === t} onSelect={() => edit({ type: t })} icon={{ embedded: 'ri-code-box-line', popup: 'ri-window-line', landing_page: 'ri-pages-line' }[t]} title={{ embedded: 'Embedded', popup: 'Popup', landing_page: 'Landing page' }[t]} />
                  </div>
                ))}
              </div>
              <FormField id="f-list" label="Add signups to list" className="mb-4">
                <select id="f-list" className="form-select" value={draft.listId ?? ''} onChange={(e) => edit({ listId: e.target.value || null })}>
                  <option value="">Don’t add to a list</option>
                  {(lists.data?.data ?? []).map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
                </select>
              </FormField>
              <Switch id="f-doi" checked={draft.doubleOptIn} onChange={(doubleOptIn) => edit({ doubleOptIn })} label="Double opt-in" description="Send a confirmation email; the contact is subscribed only after clicking it. Recommended for GDPR." />
              <FormField id="f-success" label="Success message" className="mt-4"><textarea id="f-success" rows={2} className="form-control" value={draft.successMessage} onChange={(e) => edit({ successMessage: e.target.value })} /></FormField>
            </Panel>
          )}
          {tab === 'share' && (
            <Panel title="Share & embed">
              {f.status !== 'published' && <div className="alert alert-warning py-2">Publish the form to make these links work.</div>}
              <FormField id="f-url" label="Hosted page" className="mb-4">
                <div className="input-group"><input id="f-url" className="form-control" readOnly value={hostedUrl} /><CopyButton value={hostedUrl} className="btn btn-light" /></div>
              </FormField>
              <label className="form-label">Embed code</label>
              <pre className="code-block mb-2">{embed}</pre>
              <CopyButton value={embed} label="Copy embed code" />
            </Panel>
          )}
        </div>
        <div className="col-xl-6">
          <Panel title="Live preview" bodyClassName="email-canvas rounded-0">
            <div className="form-preview">
              <h4 style={{ fontWeight: 700 }}>{draft.title}</h4>
              <p style={{ color: '#6b7280' }}>{draft.description}</p>
              {draft.fields.map((field) => (
                <div key={field.id} className="mb-3">
                  {field.type === 'checkbox' ? (
                    <label className="d-flex gap-2 align-items-center"><input type="checkbox" disabled /> {field.label}</label>
                  ) : (
                    <>
                      <label className="form-label mb-1" style={{ color: '#374151' }}>{field.label}{field.required && ' *'}</label>
                      {field.type === 'select' ? (
                        <select className="form-select" disabled style={{ background: '#fff', color: '#111' }}>{field.options.map((o) => <option key={o}>{o}</option>)}</select>
                      ) : (
                        <input className="form-control" disabled style={{ background: '#fff' }} type={field.type === 'phone' ? 'tel' : field.type} />
                      )}
                    </>
                  )}
                </div>
              ))}
              <button type="button" className="btn btn-primary w-100" disabled>{draft.submitLabel}</button>
              <p className="mt-3 mb-0" style={{ fontSize: 11, color: '#9ca3af' }}>We use your data as described in our privacy policy. Unsubscribe anytime.</p>
            </div>
          </Panel>
        </div>
      </div>
    </>
  )
}
