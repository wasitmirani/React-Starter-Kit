import { useCallback, useEffect, useMemo, useState } from 'react'
import { Guard } from '@/components/common/Guard'
import { Link, useBlocker, useParams } from 'react-router-dom'
import { brandKitApi, extractVariables, templatesApi } from '@/api/endpoints/messaging.api'
import { errorMessage } from '@/api/errors'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { FormField } from '@/components/common/FormField'
import { QueryError } from '@/components/common/Misc'
import { Modal } from '@/components/common/Modal'
import { TemplatePreview } from '@/components/features/messaging/TemplatePreview'
import { PushEditor, SmsEditor, WhatsAppEditor } from '@/components/features/templates/ChannelEditors'
import { ChecksList, EditorSection, ScoreRing } from '@/components/features/templates/EditorParts'
import { EmailBuilder } from '@/components/features/templates/EmailBuilder'
import { HtmlEditor } from '@/components/features/templates/HtmlEditor'
import { Drawer } from '@/components/ui/Drawer'
import { SkeletonLines } from '@/components/ui/EmptyState'
import { Segmented } from '@/components/ui/Segmented'
import { ChannelBadge, StatusBadge } from '@/components/ui/StatusBadge'
import { HTML_STARTER } from '@/constants/email-builder.constants'
import { ROUTES } from '@/constants/routes.constants'
import { useAction, useOne, useTenantQuery } from '@/hooks/queries/resource.queries'
import { useHistory } from '@/hooks/useHistory'
import { useNow } from '@/hooks/useNow'
import type { Template } from '@/types/messaging.types'
import { formatRelativeTime } from '@/utils/formatters/date.formatter'
import { plural } from '@/utils/formatters/number.formatter'
import { blocksToHtml } from '@/utils/helpers/email-html'
import { composeEmail, emailText, htmlToText } from '@/utils/helpers/template'
import { checkScore, templateChecks } from '@/utils/helpers/template-checks'

type Editable = Pick<Template, 'name' | 'subject' | 'body' | 'blocks' | 'language' | 'category' | 'examples' | 'previewText' | 'design' | 'whatsapp' | 'push' | 'editor' | 'html' | 'brandHeader' | 'brandFooter'>
const KEYS: (keyof Editable)[] = ['name', 'subject', 'body', 'blocks', 'language', 'category', 'examples', 'previewText', 'design', 'whatsapp', 'push', 'editor', 'html', 'brandHeader', 'brandFooter']
const pick = (t: Template): Editable => Object.fromEntries(KEYS.map((k) => [k, t[k]])) as Editable
const keyOf = (d: Editable) => JSON.stringify(KEYS.map((k) => d[k] ?? null))

const LANGUAGES = [['en', 'English'], ['de', 'German'], ['fr', 'French'], ['es', 'Spanish'], ['ar', 'Arabic'], ['pt_BR', 'Portuguese (BR)'], ['ur', 'Urdu']]
const CATEGORIES = ['marketing', 'transactional', 'utility', 'authentication'] as const

/** Template editor shell: toolbar, channel builder, preview, checks, test send. */
export function TemplateEditorPage() {
  const { id } = useParams<{ id: string }>()
  const template = useOne('templates', templatesApi.get, id)
  const kit = useTenantQuery('brand-kit', 'kit', brandKitApi.get, { staleTime: 60_000 })
  if (template.isError) return <QueryError message={errorMessage(template.error)} onRetry={() => template.refetch()} />
  if (!template.data) return <SkeletonLines lines={10} />
  return <Editor key={template.data.id} template={template.data} kit={kit.data ?? null} />
}

function Editor({ template: t, kit }: { template: Template; kit: Awaited<ReturnType<typeof brandKitApi.get>> | null }) {
  const history = useHistory<Editable>(pick(t))
  const draft = history.value
  const [savedKey, setSavedKey] = useState(() => keyOf(pick(t)))
  const [savedAt, setSavedAt] = useState<string>(t.updatedAt)
  const [selected, setSelected] = useState<string | null>(null)
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop')
  const [checksOpen, setChecksOpen] = useState(false)
  const [testing, setTesting] = useState(false)
  const [testTo, setTestTo] = useState('')
  const [toHtml, setToHtml] = useState(false)
  const now = useNow(30_000)
  const dirty = keyOf(draft) !== savedKey
  const edit = useCallback((patch: Partial<Editable>) => history.set((d) => ({ ...d, ...patch })), [history])
  const isEmail = t.channel === 'email'
  const htmlMode = isEmail && draft.editor === 'html'

  const composed = useMemo(() => (isEmail ? composeEmail(draft, kit) : []), [isEmail, draft, kit])
  const checks = useMemo(() => templateChecks({ ...draft, channel: t.channel, blocks: composed, body: draft.body }), [draft, composed, t.channel])
  const score = checkScore(checks)
  const errors = checks.filter((c) => c.level === 'error').length
  const flagged = useMemo(() => new Set(checks.map((c) => c.target).filter((x): x is string => !!x)), [checks])

  const save = useAction(
    'templates',
    () => {
      const body = isEmail ? (htmlMode ? htmlToText(draft.html ?? '') : emailText(composed)) : draft.body
      // Editing an approved WhatsApp template sends it back for review.
      const status = t.channel === 'whatsapp' && t.status !== 'draft' ? 'draft' : t.status === 'draft' && t.channel !== 'whatsapp' ? 'active' : t.status
      const variables = extractVariables(draft.subject, body, draft.html, draft.whatsapp?.header)
      return templatesApi.update(t.id, { ...draft, body, status, variables })
    },
    {
      success: 'Template saved',
      onSuccess: (next) => {
        setSavedKey(keyOf(draft))
        setSavedAt(next.updatedAt)
      },
    },
  )
  const submit = useAction('templates', () => templatesApi.submitForApproval(t.id), { success: 'Submitted to Meta for review' })
  const sendTest = useAction('templates', () => templatesApi.sendTest(t.id, testTo), { success: (r) => `Test sent to ${r.to}`, onSuccess: () => setTesting(false) })

  // Ctrl+S save, Ctrl+Z / Ctrl+Shift+Z (or Ctrl+Y) undo / redo outside text fields.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.ctrlKey || e.metaKey
      if (!mod) return
      const key = e.key.toLowerCase()
      if (key === 's') {
        e.preventDefault()
        if (dirty && !save.isPending) save.mutate(undefined)
        return
      }
      if ((e.target as HTMLElement).closest('input, textarea')) return
      if (key === 'z' && !e.shiftKey) { e.preventDefault(); history.undo() }
      else if ((key === 'z' && e.shiftKey) || key === 'y') { e.preventDefault(); history.redo() }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [dirty, save, history])

  const blocker = useBlocker(({ currentLocation, nextLocation }) => dirty && currentLocation.pathname !== nextLocation.pathname)
  useEffect(() => {
    if (!dirty) return
    const onUnload = (e: BeforeUnloadEvent) => e.preventDefault()
    window.addEventListener('beforeunload', onUnload)
    return () => window.removeEventListener('beforeunload', onUnload)
  }, [dirty])

  /** Jump from a check to the block or field it is about. */
  const focusTarget = (target: string) => {
    setChecksOpen(false)
    if (draft.blocks.some((b) => b.id === target)) setSelected(target)
    requestAnimationFrame(() => {
      const el = document.getElementById(target) ?? document.querySelector<HTMLElement>(`[data-block-id="${target}"]`)
      el?.scrollIntoView({ block: 'center', behavior: 'smooth' })
      if (el && 'focus' in el) (el.querySelector('input, textarea') as HTMLElement | null ?? el).focus?.()
    })
  }

  const switchMode = (mode: 'blocks' | 'html') => {
    if (mode === (draft.editor ?? 'blocks')) return
    if (mode === 'html') return setToHtml(true)
    edit({ editor: 'blocks' })
  }

  const saveState = save.isPending ? 'Saving…' : dirty ? 'Unsaved changes' : `Saved ${formatRelativeTime(new Date(Math.min(Date.parse(savedAt), now)))}`

  return (
    <div className="tpl-editor-page">
      <div className="tpl-topbar">
        <Link to={ROUTES.TEMPLATES} className="btn btn-sm btn-icon btn-light" aria-label="Back to templates" title="Templates"><i className="ri-arrow-left-line" /></Link>
        <input className="tpl-name" value={draft.name} onChange={(e) => edit({ name: e.target.value })} aria-label="Template name" size={Math.min(28, Math.max(12, draft.name.length))} />
        <ChannelBadge channel={t.channel} />
        <StatusBadge status={t.status} label={t.status === 'pending' ? 'In review' : undefined} />
        <span className={`save-state${dirty ? ' dirty' : ''}`}>{saveState}</span>
        <span className="flex-1" />
        <div className="btn-group btn-group-sm" role="group" aria-label="History">
          <button type="button" className="btn btn-light" disabled={!history.canUndo} onClick={history.undo} title="Undo (Ctrl+Z)" aria-label="Undo"><i className="ri-arrow-go-back-line" /></button>
          <button type="button" className="btn btn-light" disabled={!history.canRedo} onClick={history.redo} title="Redo (Ctrl+Shift+Z)" aria-label="Redo"><i className="ri-arrow-go-forward-line" /></button>
        </div>
        {isEmail && <Segmented<'blocks' | 'html'> ariaLabel="Editor" value={draft.editor ?? 'blocks'} onChange={switchMode} options={[{ value: 'blocks', label: 'Builder', icon: 'ri-drag-drop-line' }, { value: 'html', label: 'HTML', icon: 'ri-code-s-slash-line' }]} />}
        {(isEmail || t.channel === 'whatsapp') && <Segmented<'desktop' | 'mobile'> ariaLabel="Preview device" value={device} onChange={setDevice} options={[{ value: 'desktop', label: '', icon: 'ri-computer-line', title: 'Desktop' }, { value: 'mobile', label: '', icon: 'ri-smartphone-line', title: 'Mobile' }]} />}
        <button type="button" className={`btn btn-sm btn-light checks-btn${errors ? ' has-errors' : ''}`} onClick={() => setChecksOpen(true)} title="Checks before sending">
          <ScoreRing score={score} size={26} />
          <span>{errors ? `${errors} to fix` : checks.length ? plural(checks.length, 'tip') : 'Ready'}</span>
        </button>
        <button type="button" className="btn btn-sm btn-light" onClick={() => setTesting(true)}><i className="ri-send-plane-line me-1" />Test</button>
        {t.channel === 'whatsapp' && ['draft', 'rejected'].includes(t.status) && (
          <button type="button" className="btn btn-sm btn-light" disabled={dirty || errors > 0 || submit.isPending} title={dirty ? 'Save first' : errors ? 'Fix the errors first' : 'Send to Meta for review'} onClick={() => submit.mutate(undefined)}>
            <i className="ri-shield-check-line me-1" />Submit to Meta
          </button>
        )}
        <Guard permission="templates.manage">
          <button type="button" className="btn btn-sm btn-primary" disabled={!dirty || save.isPending} onClick={() => save.mutate(undefined)} title="Save (Ctrl+S)">
            {save.isPending ? 'Saving…' : dirty ? 'Save •' : 'Save'}
          </button>
        </Guard>
      </div>

      {t.rejectionReason && t.status === 'rejected' && <div className="alert alert-danger py-2 mb-3"><i className="ri-close-circle-line me-1" /><strong>Rejected by Meta:</strong> {t.rejectionReason} Fix the content, save, then submit again.</div>}
      {t.channel === 'whatsapp' && t.status === 'approved' && <div className="alert alert-info py-2 mb-3"><i className="ri-information-line me-1" />Approved by Meta. Saving changes sends it back to draft and it must be approved again.</div>}

      {isEmail ? (
        htmlMode ? (
          <HtmlEditor subject={draft.subject ?? ''} previewText={draft.previewText ?? ''} html={draft.html ?? ''} examples={draft.examples} device={device} onChange={edit} />
        ) : (
          <EmailBuilder value={draft} onChange={edit} selected={selected} onSelect={setSelected} device={device} flagged={flagged} kit={kit} />
        )
      ) : (
        <div className="tpl-message-layout">
          <div className="tpl-message-form card">
            <div className="card-body">
              {t.channel === 'whatsapp' && <WhatsAppEditor value={{ ...draft, category: draft.category }} onChange={edit} />}
              {t.channel === 'sms' && <SmsEditor value={draft} onChange={edit} />}
              {t.channel === 'push' && <PushEditor value={draft} onChange={edit} />}
              <EditorSection title="Details">
                <div className="row g-3">
                  <div className="col-sm-6">
                    <FormField id="tpl-lang" label="Language">
                      <select id="tpl-lang" className="form-select" value={draft.language} onChange={(e) => edit({ language: e.target.value })}>
                        {LANGUAGES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                      </select>
                    </FormField>
                  </div>
                  <div className="col-sm-6">
                    <FormField id="tpl-cat" label="Category" hint={t.channel === 'whatsapp' ? 'Meta prices and reviews by category.' : undefined}>
                      <select id="tpl-cat" className="form-select text-capitalize" value={draft.category} onChange={(e) => edit({ category: e.target.value as Template['category'] })}>
                        {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </FormField>
                  </div>
                </div>
              </EditorSection>
            </div>
          </div>
          <aside className="tpl-message-preview">
            <div className="card">
              <div className="card-body">
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <h6 className="tpl-section-title mb-0">Live preview</h6>
                  <span className="text-muted fs-xs">Sample values from examples</span>
                </div>
                <div className={`preview-device ${device}`}>
                  <TemplatePreview template={{ ...draft, channel: t.channel }} size="full" />
                </div>
              </div>
            </div>
            <div className="card mt-3">
              <div className="card-body">
                <div className="d-flex align-items-center gap-3 mb-3">
                  <ScoreRing score={score} />
                  <div>
                    <strong className="d-block">{errors ? `${errors} thing${errors === 1 ? '' : 's'} to fix` : 'Ready to send'}</strong>
                    <span className="text-muted fs-sm">{t.channel === 'whatsapp' ? 'Checked against Meta’s template rules' : 'Checked for delivery and compliance'}</span>
                  </div>
                </div>
                <ChecksList checks={checks} onFocus={focusTarget} />
              </div>
            </div>
          </aside>
        </div>
      )}

      <Drawer open={checksOpen} onClose={() => setChecksOpen(false)} title="Checks before sending" subtitle={`${score}/100 · ${errors} to fix, ${checks.length - errors} suggestions`}>
        <div className="d-flex align-items-center gap-3 mb-3">
          <ScoreRing score={score} size={56} />
          <p className="text-muted fs-sm mb-0">Fix the red items before sending. Click an item to jump to it.</p>
        </div>
        <ChecksList checks={checks} onFocus={focusTarget} />
      </Drawer>

      <Modal
        open={testing}
        onClose={() => setTesting(false)}
        title="Send a test"
        footer={
          <>
            <button type="button" className="btn btn-light" onClick={() => setTesting(false)}>Cancel</button>
            <button type="button" className="btn btn-primary" disabled={!testTo.trim() || sendTest.isPending} onClick={() => sendTest.mutate(undefined)}>{sendTest.isPending ? 'Sending…' : 'Send test'}</button>
          </>
        }
      >
        <FormField id="tpl-test" label={isEmail ? 'Email address' : 'Phone number'} hint={dirty ? 'Tests use the last saved version. Save first to test your latest changes.' : 'Variables are filled with the example values.'}>
          <input id="tpl-test" className="form-control" autoFocus value={testTo} placeholder={isEmail ? 'you@company.com' : '+14155550123'} onChange={(e) => setTestTo(e.target.value)} />
        </FormField>
      </Modal>

      <ConfirmDialog
        open={toHtml}
        title="Switch to HTML?"
        message={draft.html?.trim() ? 'Your saved HTML opens. The block design stays here; switch back anytime.' : 'The current blocks, with the brand header and footer, are converted to HTML you can edit freely.'}
        confirmLabel="Switch to HTML"
        onClose={() => setToHtml(false)}
        onConfirm={() => {
          edit({ editor: 'html', html: draft.html?.trim() ? draft.html : composed.length ? blocksToHtml(composed, draft.design ?? kit?.design, draft.subject ?? '') : HTML_STARTER })
          setToHtml(false)
        }}
      />
      <ConfirmDialog open={blocker.state === 'blocked'} title="Leave without saving?" message="Your changes to this template will be lost." confirmLabel="Leave" danger onClose={() => blocker.reset?.()} onConfirm={() => blocker.proceed?.()} />
    </div>
  )
}
