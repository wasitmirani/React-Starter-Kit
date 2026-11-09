import { useMemo, useState } from 'react'
import { contactsApi } from '@/api/endpoints/crm.api'
import { workflowsApi, type WorkflowDraft } from '@/api/endpoints/automation.api'
import { FormField } from '@/components/common/FormField'
import { Modal } from '@/components/common/Modal'
import { EmptyState } from '@/components/ui/EmptyState'
import { StatusBadge, ToneBadge } from '@/components/ui/StatusBadge'
import { useAction, useList } from '@/hooks/queries/resource.queries'
import { useDebounce } from '@/hooks/useDebounce'
import type { Workflow, WorkflowDefinition, WorkflowExecution, WorkflowStep } from '@/types/automation.types'
import { formatDateTime, formatRelativeTime } from '@/utils/formatters/date.formatter'
import { fullName } from '@/utils/helpers/contact'
import { countSteps, type WorkflowIssue } from '@/utils/helpers/workflow'
import { RunLog } from './RunLog'

function flatten(steps: WorkflowStep[], out = new Map<string, string>()) {
  for (const s of steps) {
    const { paths, ...own } = s
    out.set(s.id, JSON.stringify({ ...own, paths: paths?.map((p) => ({ ...p, steps: p.steps.map((x) => x.id) })) }))
    paths?.forEach((p) => flatten(p.steps, out))
  }
  return out
}

/** What publishing would change compared with the live version. */
function diffDefinitions(live: WorkflowDefinition | undefined, draft: WorkflowDefinition) {
  if (!live) return { first: true, added: countSteps(draft.steps), removed: 0, changed: 0, trigger: false, variables: false, settings: false, any: true }
  const a = flatten(live.steps)
  const b = flatten(draft.steps)
  const added = [...b.keys()].filter((k) => !a.has(k)).length
  const removed = [...a.keys()].filter((k) => !b.has(k)).length
  const changed = [...b.keys()].filter((k) => a.has(k) && a.get(k) !== b.get(k)).length
  const trigger = JSON.stringify(live.trigger) !== JSON.stringify(draft.trigger)
  const variables = JSON.stringify(live.variables) !== JSON.stringify(draft.variables)
  const settings = live.allowReentry !== draft.allowReentry
  return { first: false, added, removed, changed, trigger, variables, settings, any: Boolean(added || removed || changed || trigger || variables || settings) }
}

interface PublishModalProps {
  open: boolean
  workflow: Workflow
  draft: WorkflowDraft
  issues: WorkflowIssue[]
  busy: boolean
  onClose: () => void
  onPublish: (note: string) => void
  onFixIssue: (target: string) => void
}

export function PublishModal({ open, workflow: w, draft, issues, busy, onClose, onPublish, onFixIssue }: PublishModalProps) {
  const [note, setNote] = useState('')
  const live = w.versions[w.versions.length - 1]
  const diff = diffDefinitions(live?.definition, draft)
  const next = w.version + 1
  const lines = [
    diff.added && `${diff.added} step${diff.added > 1 ? 's' : ''} added`,
    diff.removed && `${diff.removed} step${diff.removed > 1 ? 's' : ''} removed`,
    diff.changed && `${diff.changed} step${diff.changed > 1 ? 's' : ''} changed`,
    diff.trigger && 'Trigger changed',
    diff.variables && 'Variables changed',
    diff.settings && 'Re-entry setting changed',
  ].filter(Boolean) as string[]

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Publish version ${next}`}
      footer={
        <>
          <button type="button" className="btn btn-light" onClick={onClose}>Cancel</button>
          <button type="button" className="btn btn-primary" disabled={busy || issues.length > 0 || !diff.any} onClick={() => onPublish(note)}>
            <i className="ri-rocket-2-line me-1" />{busy ? 'Publishing…' : w.status === 'draft' ? 'Publish and go live' : `Publish v${next}`}
          </button>
        </>
      }
    >
      {issues.length > 0 ? (
        <div className="alert alert-warning">
          <strong>Fix these before publishing:</strong>
          <ul className="list-unstyled mb-0 mt-2">
            {issues.map((i, n) => (
              <li key={n}>
                <button type="button" className="btn btn-link btn-sm p-0 text-start" onClick={() => onFixIssue(i.target)}><i className="ri-arrow-right-line me-1" />{i.message}</button>
              </li>
            ))}
          </ul>
        </div>
      ) : !diff.any ? (
        <div className="alert alert-info py-2 mb-3">The draft is identical to live version {w.version}. There is nothing to publish.</div>
      ) : null}

      <div className="publish-summary mb-4">
        <div className="d-flex align-items-center gap-2 mb-2">
          <ToneBadge tone="primary">v{next}</ToneBadge>
          <span className="fw-medium">{diff.first ? 'First version' : `Changes since v${w.version}`}</span>
        </div>
        {diff.first ? <p className="mb-0 fs-sm text-muted">{diff.added} steps go live. Contacts start entering as soon as the trigger fires.</p> : lines.length ? (
          <ul className="mb-0 fs-sm">{lines.map((l) => <li key={l}>{l}</li>)}</ul>
        ) : <p className="mb-0 fs-sm text-muted">No changes.</p>}
      </div>

      <FormField id="publish-note" label="What changed? (optional)" hint="Shown in the version history so your team knows why." className="mb-4">
        <textarea id="publish-note" rows={2} className="form-control" value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Added an SMS reminder for high-value carts" />
      </FormField>

      <ul className="list-unstyled fs-sm text-muted mb-0 d-flex flex-column gap-1">
        <li><i className="ri-user-received-line me-2" />New contacts enter version {next}.</li>
        {!diff.first && <li><i className="ri-history-line me-2" />Contacts already in the flow finish on the version they started.</li>}
        <li><i className="ri-arrow-go-back-line me-2" />You can restore any earlier version into the draft later.</li>
      </ul>
    </Modal>
  )
}

interface VersionsPanelProps {
  workflow: Workflow
  draftDiffers: boolean
  onRestore: (version: number) => void
  onPreview: (version: number) => void
  busy: boolean
}

export function VersionsPanel({ workflow: w, draftDiffers, onRestore, onPreview, busy }: VersionsPanelProps) {
  const versions = [...w.versions].reverse()
  return (
    <div className="card m-0">
      <div className="card-header">
        <h6 className="card-title mb-0">Version history</h6>
        <p className="text-muted fs-sm mb-0 mt-1">Each publish creates an immutable version. The draft is where you edit.</p>
      </div>
      <ul className="list-group list-group-flush">
        <li className="list-group-item d-flex align-items-center gap-3 py-3">
          <span className="version-pill draft">Draft</span>
          <div className="flex-1">
            <div className="fw-medium">Working draft</div>
            <div className="text-muted fs-sm">{draftDiffers ? 'Has changes that are not live yet.' : w.version ? `Same as live version ${w.version}.` : 'Never published.'}</div>
          </div>
          {draftDiffers && <StatusBadge status="pending" label="Unpublished changes" />}
        </li>
        {versions.length === 0 && <li className="list-group-item"><EmptyState icon="ri-git-commit-line" title="No versions yet" description="Publish the workflow to create version 1." /></li>}
        {versions.map((v) => {
          const isLive = v.version === w.version
          return (
            <li key={v.version} className="list-group-item d-flex flex-wrap align-items-center gap-3 py-3">
              <span className={`version-pill${isLive ? ' live' : ''}`}>v{v.version}</span>
              <div className="flex-1 min-w-0">
                <div className="fw-medium d-flex align-items-center gap-2">
                  {v.note}
                  {isLive && <StatusBadge status={w.status === 'active' ? 'live' : 'paused'} label={w.status === 'active' ? 'Live' : 'Live · paused'} />}
                </div>
                <div className="text-muted fs-sm" title={formatDateTime(v.publishedAt)}>
                  Published {formatRelativeTime(v.publishedAt)} by {v.publishedBy} · {countSteps(v.definition.steps)} steps
                </div>
              </div>
              <button type="button" className="btn btn-sm btn-light" onClick={() => onPreview(v.version)}><i className="ri-eye-line me-1" />View</button>
              <button type="button" className="btn btn-sm btn-light" disabled={busy} onClick={() => onRestore(v.version)}><i className="ri-arrow-go-back-line me-1" />Restore to draft</button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

interface TestRunModalProps {
  open: boolean
  workflowId: string
  draft: WorkflowDraft
  onClose: () => void
  /** Called with the finished test run so the canvas can highlight its path. */
  onResult: (run: WorkflowExecution | null) => void
  onStepClick: (stepId: string) => void
}

/** Runs the draft for a chosen contact: nothing is sent and waits are skipped. */
export function TestRunModal({ open, workflowId, draft, onClose, onResult, onStepClick }: TestRunModalProps) {
  const [search, setSearch] = useState('')
  const [contactId, setContactId] = useState('')
  const [result, setResult] = useState<WorkflowExecution | null>(null)
  const debounced = useDebounce(search, 250)
  const contacts = useList('contacts', contactsApi.list, { search: debounced, perPage: 8 }, { enabled: open })
  const run = useAction('executions', () => workflowsApi.testRun(workflowId, contactId, draft), {
    onSuccess: (r) => {
      setResult(r)
      onResult(r)
    },
  })
  const picked = useMemo(() => contacts.data?.data.find((c) => c.id === contactId), [contacts.data, contactId])

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title="Test run"
      footer={
        <>
          {result && <button type="button" className="btn btn-light me-auto" onClick={() => { setResult(null); onResult(null) }}>Clear result</button>}
          <button type="button" className="btn btn-light" onClick={onClose}>{result ? 'Show path on canvas' : 'Close'}</button>
          <button type="button" className="btn btn-primary" disabled={!contactId || run.isPending} onClick={() => run.mutate(undefined)}>
            <i className="ri-play-line me-1" />{run.isPending ? 'Running…' : result ? 'Run again' : 'Run test'}
          </button>
        </>
      }
    >
      <p className="text-muted fs-sm">Runs the current draft for one contact. Nothing is sent, waits are skipped, and HTTP calls are simulated. The real engine makes them from the server.</p>
      <FormField id="test-contact" label="Contact" className="mb-3">
        <input id="test-contact" className="form-control" placeholder="Search name or email…" value={search} onChange={(e) => setSearch(e.target.value)} />
      </FormField>
      <div className="list-group mb-4" style={{ maxHeight: 220, overflowY: 'auto' }}>
        {(contacts.data?.data ?? []).map((c) => (
          <button key={c.id} type="button" className={`list-group-item list-group-item-action d-flex justify-content-between${c.id === contactId ? ' active' : ''}`} onClick={() => setContactId(c.id)}>
            <span>{fullName(c)}</span>
            <span className={`fs-sm ${c.id === contactId ? '' : 'text-muted'}`}>{c.email ?? c.phone} · {c.country}</span>
          </button>
        ))}
      </div>
      {result && (
        <>
          <div className="d-flex align-items-center gap-2 mb-2">
            <h6 className="mb-0">Result for {picked ? fullName(picked) : result.contactName}</h6>
            <StatusBadge status={result.status} />
          </div>
          <RunLog log={result.log} onStepClick={(id) => { onStepClick(id); onClose() }} />
        </>
      )}
    </Modal>
  )
}
