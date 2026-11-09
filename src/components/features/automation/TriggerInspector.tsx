import { useState } from 'react'
import { workflowsApi, type WebhookTestResult, type WorkflowDraft } from '@/api/endpoints/automation.api'
import { AppError } from '@/api/errors'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { FormField } from '@/components/common/FormField'
import { CopyButton } from '@/components/common/Misc'
import { CodeSnippet, type Snippet } from '@/components/ui/CodeSnippet'
import { Switch } from '@/components/ui/Controls'
import { Segmented } from '@/components/ui/Segmented'
import { env } from '@/config/env.config'
import { TRIGGER_GROUPS, TRIGGERS } from '@/constants/automation.constants'
import { useTenantQuery } from '@/hooks/queries/resource.queries'
import type { TriggerType } from '@/types/automation.types'
import { formatRelativeTime } from '@/utils/formatters/date.formatter'
import { defaultTriggerConfig, flattenPayload, newWebhookSecret, newWebhookToken, parseSample, webhookUrl, type VariableOption } from '@/utils/helpers/workflow'
import { ConfigInput, Section } from './InspectorParts'

/** Mirrors `POST /events` in the API contract. */
const eventsUrl = () => `${env.apiBaseUrl.replace(/\/$/, '')}/events`

const SIGNATURE_HEADER = 'X-BirdCRM-Signature'
const SECRET_HEADER = 'X-Webhook-Secret'

type Auth = 'signature' | 'secret' | 'none'

const compactJson = (json: string | undefined, fallback: object) => {
  const v = parseSample(json).value
  return JSON.stringify(v ?? fallback)
}

function webhookSnippets(url: string, auth: Auth, body: string): Snippet[] {
  const curl =
    auth === 'signature'
      ? `BODY='${body}'\nSIG=$(printf '%s' "$BODY" | openssl dgst -sha256 -hmac "$BIRDCRM_WEBHOOK_SECRET" | cut -d' ' -f2)\n\ncurl -X POST '${url}' \\\n  -H 'Content-Type: application/json' \\\n  -H "${SIGNATURE_HEADER}: sha256=$SIG" \\\n  -d "$BODY"`
      : `curl -X POST '${url}' \\\n  -H 'Content-Type: application/json' \\\n${auth === 'secret' ? `  -H "${SECRET_HEADER}: $BIRDCRM_WEBHOOK_SECRET" \\\n` : ''}  -d '${body}'`
  const nodeHeaders = auth === 'signature' ? `,\n    '${SIGNATURE_HEADER}': \`sha256=\${signature}\`` : auth === 'secret' ? `,\n    '${SECRET_HEADER}': process.env.BIRDCRM_WEBHOOK_SECRET` : ''
  const node = `${auth === 'signature' ? "import crypto from 'node:crypto'\n\n" : ''}const body = JSON.stringify(${body})\n${auth === 'signature' ? "const signature = crypto.createHmac('sha256', process.env.BIRDCRM_WEBHOOK_SECRET).update(body).digest('hex')\n" : ''}\nawait fetch('${url}', {\n  method: 'POST',\n  headers: {\n    'Content-Type': 'application/json'${nodeHeaders}\n  },\n  body,\n})`
  const pyHeaders = auth === 'signature' ? `, "${SIGNATURE_HEADER}": f"sha256={signature}"` : auth === 'secret' ? `, "${SECRET_HEADER}": os.environ["BIRDCRM_WEBHOOK_SECRET"]` : ''
  const python = `import json, os${auth === 'signature' ? ', hmac, hashlib' : ''}\nimport requests\n\nbody = json.dumps(${body})\n${auth === 'signature' ? 'signature = hmac.new(os.environ["BIRDCRM_WEBHOOK_SECRET"].encode(), body.encode(), hashlib.sha256).hexdigest()\n' : ''}\nrequests.post(\n    "${url}",\n    data=body,\n    headers={"Content-Type": "application/json"${pyHeaders}},\n)`
  return [
    { key: 'curl', label: 'cURL', code: curl },
    { key: 'node', label: 'Node.js', code: node },
    { key: 'python', label: 'Python', code: python },
  ]
}

function eventSnippets(event: string, properties: string): Snippet[] {
  const url = eventsUrl()
  const body = `{"event":"${event || 'cart.abandoned'}","contact":{"email":"olivia@example.com"},"properties":${properties}}`
  return [
    { key: 'curl', label: 'cURL', code: `curl -X POST '${url}' \\\n  -H "Authorization: Bearer $BIRDCRM_API_KEY" \\\n  -H 'Content-Type: application/json' \\\n  -d '${body}'` },
    { key: 'node', label: 'Node.js', code: `await fetch('${url}', {\n  method: 'POST',\n  headers: {\n    Authorization: \`Bearer \${process.env.BIRDCRM_API_KEY}\`,\n    'Content-Type': 'application/json',\n  },\n  body: JSON.stringify(${body}),\n})` },
    { key: 'python', label: 'Python', code: `import os, requests\n\nrequests.post(\n    "${url}",\n    headers={"Authorization": f"Bearer {os.environ['BIRDCRM_API_KEY']}"},\n    json=${body.replace(/true/g, 'True').replace(/false/g, 'False').replace(/null/g, 'None')},\n)` },
  ]
}

/** Grouped grid of every trigger, used to pick or change what starts the automation. */
export function TriggerPicker({ value, onPick }: { value: TriggerType; onPick: (type: TriggerType) => void }) {
  return (
    <div className="trigger-picker">
      {TRIGGER_GROUPS.map((g) => (
        <section key={g.key}>
          <h6 className="wf-library-group mb-2">{g.label}</h6>
          <div className="trigger-picker-grid">
            {(Object.entries(TRIGGERS) as [TriggerType, (typeof TRIGGERS)[TriggerType]][])
              .filter(([, t]) => t.group === g.key)
              .map(([key, t]) => (
                <button key={key} type="button" className={`trigger-option${value === key ? ' selected' : ''}`} aria-pressed={value === key} onClick={() => onPick(key)}>
                  <span className={`icon-tile icon-tile-sm ${g.key === 'Developers' ? 'bg-dark-subtle text-body' : 'bg-primary-subtle text-primary'}`}><i className={t.icon} /></span>
                  <span className="min-w-0">
                    <strong>{t.label}</strong>
                    <span className="text-muted">{t.description}</span>
                  </span>
                </button>
              ))}
          </div>
        </section>
      ))}
    </div>
  )
}

/** JSON body editor with a Format button and inline parse errors. */
function SampleEditor({ id, label, hint, value, onChange }: { id: string; label: string; hint: string; value: string; onChange: (v: string) => void }) {
  const { value: parsed, error } = parseSample(value)
  const fields = parsed ? flattenPayload(parsed).length : 0
  return (
    <FormField id={id} label={label} error={error ?? undefined} hint={error ? undefined : parsed ? `${fields} field${fields === 1 ? '' : 's'} detected · ${hint}` : hint} className="mb-3">
      <div className="json-editor">
        <textarea id={id} rows={8} spellCheck={false} className={`form-control font-monospace${error ? ' is-invalid' : ''}`} value={value} onChange={(e) => onChange(e.target.value)} />
        <button type="button" className="btn btn-sm btn-light json-format" disabled={!parsed} onClick={() => parsed && onChange(JSON.stringify(parsed, null, 2))}>
          <i className="ri-code-line" /> Format
        </button>
      </div>
    </FormField>
  )
}

function WebhookTrigger({ workflowId, config, set, setMany }: { workflowId?: string; config: Record<string, string>; set: (k: string, v: string) => void; setMany: (patch: Record<string, string>) => void }) {
  const [reveal, setReveal] = useState(false)
  const [confirm, setConfirm] = useState<'url' | 'secret' | null>(null)
  const [testing, setTesting] = useState(false)
  const [result, setResult] = useState<WebhookTestResult | { error: string } | null>(null)
  const requests = useTenantQuery('executions', ['webhook-requests', workflowId], () => workflowsApi.webhookRequests(workflowId!), { enabled: !!workflowId, refetchInterval: 15_000 })

  const auth = (config.auth as Auth) || 'signature'
  const url = config.token ? webhookUrl(config.token) : ''
  const sample = parseSample(config.samplePayload).value
  const paths = sample ? flattenPayload(sample).map(([p]) => p) : []
  const body = compactJson(config.samplePayload, { email: 'olivia@example.com' })

  const sendTest = async () => {
    if (!workflowId) return
    setTesting(true)
    setResult(null)
    try {
      setResult(await workflowsApi.testWebhook(workflowId, config))
    } catch (e) {
      setResult({ error: e instanceof AppError || e instanceof Error ? e.message : 'The test request failed.' })
    } finally {
      setTesting(false)
    }
  }

  return (
    <>
      <Section title="Endpoint">
        <div className="endpoint-box mb-2">
          <span className="http-method">POST</span>
          <code className="text-truncate" title={url}>{url || 'No URL yet'}</code>
          {url && <CopyButton value={url} label="" className="btn btn-sm btn-icon btn-light" />}
        </div>
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
          <span className="form-text m-0">Accepts JSON up to 256 KB. Answers <code>202</code> right away and runs the flow in the background.</span>
          <button type="button" className="btn btn-link btn-sm p-0" onClick={() => setConfirm('url')}><i className="ri-refresh-line me-1" />New URL</button>
        </div>
      </Section>

      <Section title="Security">
        <Segmented<Auth>
          block
          ariaLabel="Request verification"
          value={auth}
          onChange={(v) => setMany({ auth: v, secret: v !== 'none' && !config.secret ? newWebhookSecret() : config.secret ?? '' })}
          options={[
            { value: 'signature', label: 'HMAC', icon: 'ri-shield-keyhole-line', title: 'HMAC signature (recommended)' },
            { value: 'secret', label: 'Secret', icon: 'ri-key-2-line', title: 'Secret header' },
            { value: 'none', label: 'None', icon: 'ri-lock-unlock-line', title: 'No verification' },
          ]}
        />
        <p className="form-text mb-2 mt-2">
          {auth === 'signature' && <>Send <code>{SIGNATURE_HEADER}: sha256=&lt;hex HMAC of the raw body&gt;</code>. Requests with a wrong signature get <code>401</code>.</>}
          {auth === 'secret' && <>Send the secret in a <code>{SECRET_HEADER}</code> header. Simpler, but anyone who sees a request can replay it.</>}
          {auth === 'none' && <span className="text-warning-emphasis"><i className="ri-alert-line me-1" />Anyone with the URL can start this automation. Only use this for testing.</span>}
        </p>
        {auth !== 'none' && (
          <div className="endpoint-box mb-3">
            <i className="ri-key-line text-muted" />
            <code className="text-truncate">{reveal ? config.secret : `whsec_${'•'.repeat(18)}`}</code>
            <button type="button" className="btn btn-sm btn-icon btn-light" title={reveal ? 'Hide' : 'Reveal'} aria-label={reveal ? 'Hide secret' : 'Reveal secret'} onClick={() => setReveal((r) => !r)}><i className={reveal ? 'ri-eye-off-line' : 'ri-eye-line'} /></button>
            <CopyButton value={config.secret ?? ''} label="" className="btn btn-sm btn-icon btn-light" />
            <button type="button" className="btn btn-sm btn-icon btn-light" title="Rotate secret" aria-label="Rotate secret" onClick={() => setConfirm('secret')}><i className="ri-refresh-line" /></button>
          </div>
        )}
      </Section>

      <Section title="Request body">
        <SampleEditor id="wh-sample" label="Sample body" hint="every field becomes a {{trigger.body.*}} variable" value={config.samplePayload ?? ''} onChange={(v) => set('samplePayload', v)} />
        <div className="row g-2 mb-2">
          <div className="col-7">
            <FormField id="wh-contact" label="Contact field" error={!config.contactPath ? 'Required' : undefined}>
              {paths.length ? (
                <select id="wh-contact" className="form-select" value={config.contactPath ?? ''} onChange={(e) => set('contactPath', e.target.value)}>
                  <option value="">Choose a field…</option>
                  {paths.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              ) : (
                <input id="wh-contact" className="form-control font-monospace" placeholder="customer.email" value={config.contactPath ?? ''} onChange={(e) => set('contactPath', e.target.value)} />
              )}
            </FormField>
          </div>
          <div className="col-5">
            <FormField id="wh-match" label="Matches">
              <select id="wh-match" className="form-select" value={config.matchBy ?? 'email'} onChange={(e) => set('matchBy', e.target.value)}>
                <option value="email">Email</option>
                <option value="phone">Phone</option>
                <option value="id">Contact ID</option>
              </select>
            </FormField>
          </div>
        </div>
        <div className="mb-3">
          <Switch id="wh-create" checked={config.createContact === 'true'} onChange={(on) => set('createContact', String(on))} label="Create the contact if it does not exist" description="Otherwise the request is accepted but nobody is enrolled." />
        </div>
      </Section>

      <Section title="Try it">
        <div className="d-flex align-items-center gap-2 mb-2">
          <button type="button" className="btn btn-primary btn-sm text-nowrap" disabled={!workflowId || testing} onClick={sendTest}>
            {testing ? <><span className="spinner-border spinner-border-sm me-1" />Sending…</> : <><i className="ri-send-plane-line me-1" />Send test request</>}
          </button>
          <span className="text-muted fs-xs">Uses the sample body. Nobody is enrolled.</span>
        </div>
        {result && ('error' in result ? (
          <div className="webhook-result is-error"><span className="http-status">4xx</span><span>{result.error}</span></div>
        ) : (
          <div className="webhook-result">
            <span className="http-status">{result.status} Accepted</span>
            <span>
              {result.contact ? <>Matched <strong>{result.contact.name}</strong> by {config.matchBy ?? 'email'} </> : result.wouldCreate ? <>No contact with <code>{result.identifier}</code>, so one would be created </> : <>No contact with <code>{result.identifier}</code>; nobody would be enrolled </>}
              · {result.fields} fields · {result.live ? 'live requests enrol right away' : 'publish to start enrolling'}
            </span>
          </div>
        ))}
        <div className="mt-3">
          <CodeSnippet snippets={webhookSnippets(url, auth, body)} />
        </div>
      </Section>

      {(requests.data?.length ?? 0) > 0 && (
        <Section title="Recent requests">
          <ul className="req-list">
            {requests.data!.map((r) => (
              <li key={r.id}>
                <span className="http-status sm">{r.status}</span>
                <code className="text-truncate">{r.id}</code>
                <span className="text-truncate flex-1">{r.contactName}</span>
                <span className="text-muted text-nowrap">{formatRelativeTime(r.receivedAt)}</span>
              </li>
            ))}
          </ul>
        </Section>
      )}

      <ConfirmDialog
        open={confirm !== null}
        title={confirm === 'url' ? 'Generate a new URL?' : 'Rotate the signing secret?'}
        message={confirm === 'url' ? 'Systems still calling the old URL get 404 once you publish this change.' : 'Requests signed with the old secret are rejected once you publish this change. Update your sender first.'}
        confirmLabel={confirm === 'url' ? 'New URL' : 'Rotate secret'}
        danger
        onClose={() => setConfirm(null)}
        onConfirm={() => {
          if (confirm === 'url') set('token', newWebhookToken())
          else setMany({ secret: newWebhookSecret() })
          setResult(null)
          setConfirm(null)
        }}
      />
    </>
  )
}

interface TriggerInspectorProps {
  workflowId?: string
  draft: WorkflowDraft
  variableOptions: VariableOption[]
  onChange: (patch: Partial<WorkflowDraft>) => void
  missing: (key: string) => boolean
  startPicking?: boolean
}

/** Inspector for the trigger node: pick what starts the flow, then configure it. */
export function TriggerInspector({ workflowId, draft, variableOptions, onChange, missing, startPicking = false }: TriggerInspectorProps) {
  const [picking, setPicking] = useState(startPicking)
  const trigger = TRIGGERS[draft.trigger.type]
  const config = draft.trigger.config
  const setMany = (patch: Record<string, string>) => onChange({ trigger: { ...draft.trigger, config: { ...config, ...patch } } })
  const set = (k: string, v: string) => setMany({ [k]: v })
  const pick = (type: TriggerType) => {
    if (type !== draft.trigger.type) onChange({ trigger: { type, config: defaultTriggerConfig(type) } })
    setPicking(false)
  }
  const triggerVars = variableOptions.filter((o) => o.group === 'Trigger')

  return (
    <div className="wf-inspector-body">
      <header className="wf-inspector-head">
        <span className="icon-tile bg-primary text-white"><i className={trigger.icon} /></span>
        <div className="min-w-0 flex-1">
          <div className="flow-node-kind text-primary">Trigger</div>
          <h6 className="mb-0">{trigger.label}</h6>
        </div>
        <button type="button" className={`btn btn-sm ${picking ? 'btn-primary' : 'btn-light'}`} aria-expanded={picking} onClick={() => setPicking((p) => !p)}>
          <i className={`${picking ? 'ri-close-line' : 'ri-arrow-left-right-line'} me-1`} />{picking ? 'Cancel' : 'Change'}
        </button>
      </header>

      {picking ? (
        <TriggerPicker value={draft.trigger.type} onPick={pick} />
      ) : (
        <>
          <p className="text-muted fs-sm">{trigger.description}</p>
          {trigger.field && <ConfigInput field={trigger.field} options={variableOptions} value={config[trigger.field.key] ?? ''} invalid={missing(config[trigger.field.key])} onChange={(v) => set(trigger.field!.key, trigger.field!.key === 'event' ? v.toLowerCase().replace(/\s+/g, '_') : v)} />}

          {draft.trigger.type === 'incoming_webhook' && <WebhookTrigger workflowId={workflowId} config={config} set={set} setMany={setMany} />}

          {draft.trigger.type === 'webhook' && (
            <>
              <SampleEditor id="ev-sample" label="Event properties (sample)" hint="each one becomes a {{trigger.properties.*}} variable" value={config.samplePayload ?? ''} onChange={(v) => set('samplePayload', v)} />
              <Section title="Send this event">
                <p className="form-text mt-0">Call the Events API with an API key from <strong>Developers → API keys</strong>. The contact is matched by email, phone or <code>contact.id</code>.</p>
                <CodeSnippet snippets={eventSnippets(config.event ?? '', compactJson(config.samplePayload, {}))} />
              </Section>
            </>
          )}

          <Section title="Data from this trigger">
            {triggerVars.length ? (
              <div className="d-flex flex-wrap gap-1">
                {triggerVars.map((o) => <code key={o.ref} className="var-chip" title={o.label}>{`{{${o.ref}}}`}</code>)}
              </div>
            ) : (
              <p className="text-muted fs-sm mb-0">This trigger adds no extra data. Use contact fields like <code className="var-chip">{'{{contact.first_name}}'}</code>.</p>
            )}
          </Section>
        </>
      )}
    </div>
  )
}
