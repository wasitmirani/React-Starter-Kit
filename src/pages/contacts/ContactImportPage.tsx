import { useMemo, useState, type DragEvent } from 'react'
import { Link } from 'react-router-dom'
import { attributesApi, contactsApi, importsApi, listsApi } from '@/api/endpoints/crm.api'
import { FormField } from '@/components/common/FormField'
import { PageHeader } from '@/components/common/PageHeader'
import { Panel } from '@/components/common/Panel'
import { Stepper, Switch } from '@/components/ui/Controls'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { ROUTES } from '@/constants/routes.constants'
import { useAction, useAll, useList } from '@/hooks/queries/resource.queries'
import { useToast } from '@/hooks/useToast'
import type { ImportJob } from '@/types/crm.types'
import { formatDateTime } from '@/utils/formatters/date.formatter'
import { parseCsv } from '@/utils/helpers/csv'

const CORE_FIELDS = [
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Phone (E.164)' },
  { value: 'firstName', label: 'First name' },
  { value: 'lastName', label: 'Last name' },
  { value: 'companyName', label: 'Company' },
  { value: 'jobTitle', label: 'Job title' },
  { value: 'country', label: 'Country' },
  { value: 'city', label: 'City' },
]

const SAMPLE = 'email,first_name,last_name,phone,country,plan\nava.jones@example.com,Ava,Jones,+447700900123,United Kingdom,Starter\nleo.martin@example.com,Leo,Martin,,France,Business\n'

/** Best-guess mapping from a CSV header to a contact field. */
function guess(header: string, options: { value: string }[]): string {
  const h = header.toLowerCase().replace(/[^a-z]/g, '')
  const aliases: Record<string, string> = { email: 'email', emailaddress: 'email', mail: 'email', phone: 'phone', mobile: 'phone', phonenumber: 'phone', firstname: 'firstName', first: 'firstName', givenname: 'firstName', lastname: 'lastName', surname: 'lastName', last: 'lastName', company: 'companyName', organization: 'companyName', jobtitle: 'jobTitle', title: 'jobTitle', country: 'country', city: 'city' }
  if (aliases[h]) return aliases[h]
  return options.find((o) => o.value.startsWith('attributes.') && o.value.slice(11).replace(/_/g, '') === h)?.value ?? ''
}

export function ContactImportPage() {
  const toast = useToast()
  const lists = useAll('lists', listsApi.list)
  const attributes = useAll('attributes', attributesApi.list)
  const history = useList('imports', importsApi.list, { perPage: 5 })
  const [step, setStep] = useState(0)
  const [fileName, setFileName] = useState('')
  const [parsed, setParsed] = useState<ReturnType<typeof parseCsv> | null>(null)
  const [mapping, setMapping] = useState<Record<string, string>>({})
  const [listId, setListId] = useState('')
  const [updateExisting, setUpdateExisting] = useState(true)
  const [confirmed, setConfirmed] = useState(false)
  const [result, setResult] = useState<ImportJob | null>(null)
  const [dragging, setDragging] = useState(false)

  const fieldOptions = useMemo(
    () => [
      ...CORE_FIELDS,
      ...(attributes.data?.data ?? []).filter((a) => !a.system).map((a) => ({ value: `attributes.${a.key}`, label: `${a.label} (attribute)` })),
    ],
    [attributes.data],
  )

  const run = useAction('contacts', contactsApi.import, { invalidates: ['imports', 'lists'], onSuccess: (job) => { setResult(job); setStep(3) } })

  const load = (name: string, text: string) => {
    const data = parseCsv(text)
    if (data.headers.length === 0 || data.rows.length === 0) {
      toast.error('That file has no rows. The first line must be a header row.')
      return
    }
    setFileName(name)
    setParsed(data)
    setMapping(Object.fromEntries(data.headers.map((h) => [h, guess(h, fieldOptions)])))
    setStep(1)
  }

  const readFile = (file: File | undefined) => {
    if (!file) return
    if (!file.name.toLowerCase().endsWith('.csv')) return toast.error('Upload a .csv file.')
    if (file.size > 10 * 1024 * 1024) return toast.error('Files up to 10 MB are supported here. Use the API for larger imports.')
    file.text().then((text) => load(file.name, text))
  }

  const onDrop = (e: DragEvent) => {
    e.preventDefault()
    setDragging(false)
    readFile(e.dataTransfer.files[0])
  }

  const mappedFields = Object.values(mapping).filter(Boolean)
  const hasIdentifier = mappedFields.includes('email') || mappedFields.includes('phone')
  const duplicate = mappedFields.find((f, i) => mappedFields.indexOf(f) !== i)

  const reset = () => {
    setStep(0)
    setParsed(null)
    setResult(null)
    setConfirmed(false)
  }

  return (
    <>
      <PageHeader back={{ label: 'Contacts', to: ROUTES.CONTACTS }} title="Import contacts" description="Upload a CSV, match its columns to contact fields, and choose where the contacts go." />

      <div className="card mb-4">
        <div className="card-body">
          <Stepper steps={['Upload', 'Map columns', 'Settings', 'Done']} current={step} onStep={(i) => step < 3 && setStep(i)} />
        </div>
      </div>

      {step === 0 && (
        <Panel>
          <label
            className={`d-block border border-2 border-dashed rounded-3 text-center p-5 mb-0 ${dragging ? 'border-primary bg-primary-subtle' : ''}`}
            onDragOver={(e) => {
              e.preventDefault()
              setDragging(true)
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            style={{ cursor: 'pointer' }}
          >
            <input type="file" accept=".csv,text/csv" className="d-none" onChange={(e) => readFile(e.target.files?.[0])} />
            <span className="icon-tile icon-tile-lg bg-primary-subtle text-primary mb-3"><i className="ri-upload-cloud-2-line" /></span>
            <h6 className="mb-1">Drop a CSV file here, or click to browse</h6>
            <p className="text-muted mb-0">UTF-8, comma separated, first row is the header. Up to 10 MB.</p>
          </label>
          <div className="text-center mt-4">
            <button type="button" className="btn btn-link" onClick={() => load('sample.csv', SAMPLE)}>
              Try it with a sample file
            </button>
          </div>
        </Panel>
      )}

      {step === 1 && parsed && (
        <Panel
          title="Map columns"
          description={`${fileName} · ${parsed.rows.length.toLocaleString()} rows. Columns set to “Skip” are not imported.`}
          actions={
            <>
              <button type="button" className="btn btn-light" onClick={reset}>Choose another file</button>
              <button type="button" className="btn btn-primary" disabled={!hasIdentifier || Boolean(duplicate)} onClick={() => setStep(2)}>Continue</button>
            </>
          }
          flush
        >
          {!hasIdentifier && <div className="alert alert-warning m-4 mb-0">Map at least one column to Email or Phone — that is how contacts are matched.</div>}
          {duplicate && <div className="alert alert-danger m-4 mb-0">Two columns are mapped to the same field. Each field can be used once.</div>}
          <div className="table-responsive">
            <table className="table align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>CSV column</th>
                  <th>Sample values</th>
                  <th style={{ width: 280 }}>Import as</th>
                </tr>
              </thead>
              <tbody>
                {parsed.headers.map((h) => (
                  <tr key={h}>
                    <td className="fw-medium">{h}</td>
                    <td className="text-muted fs-sm text-truncate" style={{ maxWidth: 320 }}>{parsed.rows.slice(0, 3).map((r) => r[h]).filter(Boolean).join(', ') || '—'}</td>
                    <td>
                      <select className="form-select form-select-sm" value={mapping[h] ?? ''} onChange={(e) => setMapping({ ...mapping, [h]: e.target.value })} aria-label={`Field for ${h}`}>
                        <option value="">Skip this column</option>
                        {fieldOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      )}

      {step === 2 && parsed && (
        <Panel title="Import settings">
          <div className="row g-4" style={{ maxWidth: 640 }}>
            <FormField id="import-list" label="Add contacts to list" hint="Optional. New and updated contacts join this list." className="col-12">
              <select id="import-list" className="form-select" value={listId} onChange={(e) => setListId(e.target.value)}>
                <option value="">Don’t add to a list</option>
                {(lists.data?.data ?? []).map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
            </FormField>
            <div className="col-12">
              <Switch id="import-update" checked={updateExisting} onChange={setUpdateExisting} label="Update existing contacts" description="Contacts matched by email get the new values. Off: matches are skipped." />
            </div>
            <div className="col-12">
              <div className="form-check">
                <input id="import-consent" className="form-check-input" type="checkbox" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} />
                <label htmlFor="import-consent" className="form-check-label">
                  I confirm these contacts agreed to receive marketing from us (opt-in), and I can show proof if asked.
                </label>
              </div>
            </div>
            <div className="col-12 d-flex gap-2">
              <button type="button" className="btn btn-light" onClick={() => setStep(1)}>Back</button>
              <button
                type="button"
                className="btn btn-primary"
                disabled={!confirmed || run.isPending}
                onClick={() => run.mutate({ fileName, rows: parsed.rows, mapping, listId: listId || null, updateExisting })}
              >
                {run.isPending ? 'Importing…' : `Import ${parsed.rows.length.toLocaleString()} rows`}
              </button>
            </div>
          </div>
        </Panel>
      )}

      {step === 3 && result && (
        <Panel>
          <div className="text-center py-4">
            <span className="icon-tile icon-tile-lg bg-success-subtle text-success mb-3"><i className="ri-check-line" /></span>
            <h5>Import finished</h5>
            <p className="text-muted">{result.fileName}: {result.totalRows} rows processed.</p>
            <div className="d-flex justify-content-center gap-5 my-4">
              {[['Created', result.created, 'success'], ['Updated', result.updated, 'primary'], ['Skipped', result.skipped, 'secondary']].map(([label, n, tone]) => (
                <div key={label as string}>
                  <div className={`fs-3 fw-semibold text-${tone}`}>{n as number}</div>
                  <div className="text-muted">{label}</div>
                </div>
              ))}
            </div>
            {result.skipped > 0 && <p className="text-muted fs-sm">Skipped rows had no email or phone, or matched an existing contact while updates were off.</p>}
            <div className="d-flex justify-content-center gap-2">
              <button type="button" className="btn btn-light" onClick={reset}>Import another file</button>
              <Link to={result.listId ? `${ROUTES.CONTACTS}?listId=${result.listId}` : ROUTES.CONTACTS} className="btn btn-primary">View contacts</Link>
            </div>
          </div>
        </Panel>
      )}

      {step === 0 && (history.data?.data.length ?? 0) > 0 && (
        <Panel title="Recent imports" flush className="mt-4">
          <table className="table align-middle mb-0">
            <thead className="table-light">
              <tr><th>File</th><th>Status</th><th className="text-end">Created</th><th className="text-end">Updated</th><th className="text-end">Skipped</th><th>When</th></tr>
            </thead>
            <tbody>
              {history.data!.data.map((job) => (
                <tr key={job.id}>
                  <td className="fw-medium">{job.fileName}</td>
                  <td><StatusBadge status={job.status} /></td>
                  <td className="text-end">{job.created}</td>
                  <td className="text-end">{job.updated}</td>
                  <td className="text-end">{job.skipped}</td>
                  <td className="text-muted">{formatDateTime(job.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
      )}
    </>
  )
}
