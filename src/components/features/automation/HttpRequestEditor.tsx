import { useState } from 'react'
import { FormField } from '@/components/common/FormField'
import { HTTP_METHODS } from '@/constants/automation.constants'
import type { HttpRequestConfig, WorkflowVariable } from '@/types/automation.types'
import { isVariableKey, type VariableOption } from '@/utils/helpers/workflow'
import { VariableInput } from './VariableInput'

const uid = () => crypto.randomUUID()

/** Sample values used when testing, so `{{contact.email}}` becomes something realistic. */
const SAMPLE: Record<string, string> = {
  'contact.first_name': 'Olivia',
  'contact.last_name': 'Smith',
  'contact.email': 'olivia.smith@example.com',
  'contact.phone': '+14155550123',
  'contact.company': 'Northwind Traders',
  'contact.country': 'United States',
  'contact.city': 'New York',
  'contact.id': 'contact-0001',
}

function fill(text: string, variables: WorkflowVariable[]): string {
  return text.replace(/{{\s*([\w.]+)\s*}}/g, (_, ref: string) => {
    if (SAMPLE[ref]) return SAMPLE[ref]
    if (ref.startsWith('vars.')) return variables.find((v) => v.key === ref.slice(5))?.value ?? ''
    return ''
  })
}

/** Dotted paths to every leaf in a JSON value (first 40), for "save response" suggestions. */
function jsonPaths(value: unknown, prefix = '', out: string[] = []): string[] {
  if (out.length >= 40) return out
  if (value && typeof value === 'object') {
    const entries = Array.isArray(value) ? value.slice(0, 3).map((v, i) => [String(i), v] as const) : Object.entries(value)
    for (const [k, v] of entries) jsonPaths(v, prefix ? `${prefix}.${k}` : k, out)
  } else if (prefix) {
    out.push(prefix)
  }
  return out
}

interface TestResult {
  ok: boolean
  status: number | null
  ms: number
  body: string
  json: unknown
  error: string | null
}

interface HttpRequestEditorProps {
  value: HttpRequestConfig
  onChange: (value: HttpRequestConfig) => void
  options: VariableOption[]
  variables: WorkflowVariable[]
  stepRef: string
}

export function HttpRequestEditor({ value: http, onChange, options, variables, stepRef }: HttpRequestEditorProps) {
  const [result, setResult] = useState<TestResult | null>(null)
  const [testing, setTesting] = useState(false)
  const set = (patch: Partial<HttpRequestConfig>) => onChange({ ...http, ...patch })
  const hasBody = ['POST', 'PUT', 'PATCH'].includes(http.method)

  const test = async () => {
    setTesting(true)
    setResult(null)
    const started = performance.now()
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), http.timeoutSeconds * 1000)
    try {
      const res = await fetch(fill(http.url, variables), {
        method: http.method,
        headers: Object.fromEntries(http.headers.filter((h) => h.key.trim()).map((h) => [h.key.trim(), fill(h.value, variables)])),
        body: hasBody && http.body.trim() ? fill(http.body, variables) : undefined,
        signal: controller.signal,
      })
      const text = await res.text()
      let json: unknown = null
      try {
        json = JSON.parse(text)
      } catch {
        json = null
      }
      setResult({ ok: res.ok, status: res.status, ms: Math.round(performance.now() - started), body: text.slice(0, 4000), json, error: null })
    } catch (err) {
      const aborted = err instanceof DOMException && err.name === 'AbortError'
      setResult({
        ok: false,
        status: null,
        ms: Math.round(performance.now() - started),
        body: '',
        json: null,
        error: aborted
          ? `Timed out after ${http.timeoutSeconds}s.`
          : 'The browser could not reach this URL (offline, or the API does not allow browser requests via CORS). Live runs call it from the server, where CORS does not apply.',
      })
    } finally {
      clearTimeout(timer)
      setTesting(false)
    }
  }

  const saved = new Set(http.saveResponse.map((r) => r.path))
  const suggestions = result?.json ? jsonPaths(result.json).filter((p) => !saved.has(p)) : []

  return (
    <div>
      <FormField id="http-url" label="Request" className="mb-3">
        <div className="d-flex gap-2">
          <select className="form-select" style={{ width: 104 }} value={http.method} onChange={(e) => set({ method: e.target.value as HttpRequestConfig['method'] })} aria-label="Method">
            {HTTP_METHODS.map((m) => <option key={m}>{m}</option>)}
          </select>
          <div className="flex-1 min-w-0">
            <VariableInput id="http-url" value={http.url} onChange={(url) => set({ url })} options={options} placeholder="https://api.example.com/orders" monospace />
          </div>
        </div>
      </FormField>

      <div className="mb-3">
        <div className="d-flex justify-content-between align-items-center mb-1">
          <span className="form-label mb-0">Headers</span>
          <button type="button" className="btn btn-link btn-sm p-0" onClick={() => set({ headers: [...http.headers, { id: uid(), key: '', value: '' }] })}><i className="ri-add-line" /> Header</button>
        </div>
        {http.headers.length === 0 && <div className="text-muted fs-sm">No headers.</div>}
        {http.headers.map((h) => (
          <div key={h.id} className="d-flex gap-2 mb-2">
            <input className="form-control form-control-sm font-monospace" style={{ maxWidth: 130 }} placeholder="Header" value={h.key} onChange={(e) => set({ headers: http.headers.map((x) => (x.id === h.id ? { ...x, key: e.target.value } : x)) })} aria-label="Header name" />
            <div className="flex-1 min-w-0">
              <VariableInput id={`hv-${h.id}`} value={h.value} onChange={(v) => set({ headers: http.headers.map((x) => (x.id === h.id ? { ...x, value: v } : x)) })} options={options} placeholder="Value" monospace />
            </div>
            <button type="button" className="btn btn-sm btn-light btn-icon text-danger flex-shrink-0" onClick={() => set({ headers: http.headers.filter((x) => x.id !== h.id) })} aria-label="Remove header"><i className="ri-close-line" /></button>
          </div>
        ))}
        <div className="form-text">Keep secrets in workflow variables, e.g. <code>Bearer {'{{vars.api_token}}'}</code>.</div>
      </div>

      {hasBody && (
        <FormField id="http-body" label="JSON body" className="mb-3">
          <VariableInput id="http-body" value={http.body} onChange={(body) => set({ body })} options={options} multiline rows={6} monospace />
        </FormField>
      )}

      <div className="row g-2 mb-3">
        <FormField id="http-timeout" label="Timeout" className="col-5">
          <div className="input-group input-group-sm">
            <input id="http-timeout" type="number" min={1} max={30} className="form-control" value={http.timeoutSeconds} onChange={(e) => set({ timeoutSeconds: Math.max(1, Math.min(30, Number(e.target.value) || 10)) })} />
            <span className="input-group-text">sec</span>
          </div>
        </FormField>
        <FormField id="http-error" label="If it fails" className="col-7">
          <select id="http-error" className="form-select form-select-sm" value={http.onError} onChange={(e) => set({ onError: e.target.value as HttpRequestConfig['onError'] })}>
            <option value="continue">Continue the flow</option>
            <option value="stop">Stop for this contact</option>
          </select>
        </FormField>
      </div>

      <div className="mb-3">
        <div className="d-flex justify-content-between align-items-center mb-1">
          <span className="form-label mb-0">Save response to variables</span>
          <button type="button" className="btn btn-link btn-sm p-0" onClick={() => set({ saveResponse: [...http.saveResponse, { id: uid(), path: '', variable: '' }] })}><i className="ri-add-line" /> Field</button>
        </div>
        {http.saveResponse.length === 0 && <div className="text-muted fs-sm">Nothing saved. Test the request to pick fields from the response.</div>}
        {http.saveResponse.map((r) => (
          <div key={r.id} className="d-flex align-items-center gap-2 mb-2">
            <input className="form-control form-control-sm font-monospace" placeholder="data.status" value={r.path} onChange={(e) => set({ saveResponse: http.saveResponse.map((x) => (x.id === r.id ? { ...x, path: e.target.value } : x)) })} aria-label="Response field path" />
            <i className="ri-arrow-right-line text-muted flex-shrink-0" />
            <div className="input-group input-group-sm">
              <span className="input-group-text font-monospace">vars.</span>
              <input className={`form-control font-monospace${r.variable && !isVariableKey(r.variable) ? ' is-invalid' : ''}`} placeholder="order_status" value={r.variable} onChange={(e) => set({ saveResponse: http.saveResponse.map((x) => (x.id === r.id ? { ...x, variable: e.target.value.toLowerCase() } : x)) })} aria-label="Variable name" />
            </div>
            <button type="button" className="btn btn-sm btn-light btn-icon text-danger flex-shrink-0" onClick={() => set({ saveResponse: http.saveResponse.filter((x) => x.id !== r.id) })} aria-label="Remove field"><i className="ri-close-line" /></button>
          </div>
        ))}
        <div className="form-text">The status code is always available as <code>{`{{steps.${stepRef}.status}}`}</code>.</div>
      </div>

      <button type="button" className="btn btn-light w-100" disabled={testing || !http.url.trim()} onClick={test}>
        {testing ? <><span className="spinner-border spinner-border-sm me-1" />Sending…</> : <><i className="ri-send-plane-2-line me-1" />Send test request</>}
      </button>
      <div className="form-text">Uses sample contact data and your variables’ default values.</div>

      {result && (
        <div className={`http-result mt-3 ${result.ok ? 'ok' : 'fail'}`}>
          <div className="d-flex justify-content-between fs-sm mb-2">
            <strong>{result.status ? `HTTP ${result.status}` : 'No response'}</strong>
            <span className="text-muted">{result.ms} ms</span>
          </div>
          {result.error ? <p className="fs-sm mb-0">{result.error}</p> : <pre className="code-block mb-0" style={{ maxHeight: 220 }}>{result.json ? JSON.stringify(result.json, null, 2).slice(0, 4000) : result.body || '(empty body)'}</pre>}
          {suggestions.length > 0 && (
            <div className="mt-3">
              <div className="fs-xs text-muted mb-1">Save a field from this response:</div>
              <div className="d-flex flex-wrap gap-1">
                {suggestions.slice(0, 16).map((p) => (
                  <button
                    key={p}
                    type="button"
                    className="btn btn-sm btn-light py-0 font-monospace fs-xs"
                    onClick={() => set({ saveResponse: [...http.saveResponse, { id: uid(), path: p, variable: p.split('.').pop()!.toLowerCase().replace(/[^a-z0-9_]/g, '_').replace(/^(\d)/, 'v_$1') }] })}
                  >
                    + {p}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
