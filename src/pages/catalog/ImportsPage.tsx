import { useState } from 'react'
import { importsApi } from '@/api/endpoints/commerce.api'
import type { DataTableColumn } from '@/components/common/DataTable'
import { PageHeader } from '@/components/common/PageHeader'
import { Panel } from '@/components/common/Panel'
import { ResourceList } from '@/components/common/ResourceList'
import { Stepper } from '@/components/ui/Controls'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { humanize } from '@/constants/status.constants'
import { useAction } from '@/hooks/queries/resource.queries'
import type { ImportJob } from '@/types/commerce.types'
import { formatDateTime } from '@/utils/formatters/date.formatter'
import { downloadCsv, parseCsv } from '@/utils/helpers/csv'

const TEMPLATES: Record<ImportJob['type'], string[]> = {
  products: ['sku', 'title', 'brand', 'category', 'price', 'cost', 'barcode', 'weight_kg'],
  orders: ['external_id', 'channel', 'customer_name', 'phone', 'city', 'address', 'sku', 'quantity', 'unit_price', 'payment_method'],
  inventory: ['sku', 'warehouse_code', 'bin', 'quantity', 'lot', 'expires_at'],
  customers: ['name', 'phone', 'email', 'city', 'country'],
}

const columns: DataTableColumn<ImportJob>[] = [
  { key: 'fileName', label: 'File', render: (j) => <div><div className="fw-medium">{j.fileName}</div><div className="text-muted fs-sm">{humanize(j.type)} · {j.createdBy}</div></div> },
  { key: 'status', label: 'Status', render: (j) => <StatusBadge status={j.status} /> },
  { key: 'totalRows', label: 'Rows', align: 'end' },
  { key: 'succeeded', label: 'Imported', align: 'end' },
  { key: 'failed', label: 'Failed', align: 'end', render: (j) => <span className={j.failed ? 'text-danger fw-medium' : ''}>{j.failed}</span> },
  { key: 'createdAt', label: 'Started', sortable: true, render: (j) => formatDateTime(j.createdAt) },
]

export function ImportsPage() {
  const [type, setType] = useState<ImportJob['type']>('products')
  const [file, setFile] = useState<{ name: string; headers: string[]; rows: Record<string, string>[] } | null>(null)
  const [result, setResult] = useState<ImportJob | null>(null)
  const run = useAction('imports', importsApi.run, { invalidates: ['products', 'orders', 'balances'], success: (j) => `${j.succeeded} of ${j.totalRows} rows imported`, onSuccess: setResult })
  const missing = file ? TEMPLATES[type].slice(0, 2).filter((h) => !file.headers.includes(h)) : []
  const step = result ? 2 : file ? 1 : 0

  const downloadErrors = (j: ImportJob) => downloadCsv(`${j.fileName}-errors.csv`, [{ label: 'row', value: (e) => e.row }, { label: 'error', value: (e) => e.message }], j.errors)

  return (
    <>
      <PageHeader title="Catalog imports" description="CSV imports are previewed and validated before anything is written. Failed rows come back with actionable messages." />
      <Panel title="New import" icon="ri-upload-2-line" className="mb-4">
        <Stepper steps={['Upload', 'Preview and validate', 'Result']} current={step} />
        <div className="row g-4 mt-1">
          <div className="col-md-4">
            <label htmlFor="import-type" className="form-label">What are you importing?</label>
            <select id="import-type" className="form-select" value={type} onChange={(e) => { setType(e.target.value as ImportJob['type']); setResult(null) }}>
              {Object.keys(TEMPLATES).map((t) => <option key={t} value={t}>{humanize(t)}</option>)}
            </select>
            <button type="button" className="btn btn-link px-0 fs-sm" onClick={() => downloadCsv(`${type}-template.csv`, TEMPLATES[type].map((h) => ({ label: h, value: () => '' })), [])}>
              <i className="ri-download-2-line" /> Download template
            </button>
          </div>
          <div className="col-md-8">
            <label htmlFor="import-file" className="form-label">CSV file</label>
            <input
              id="import-file"
              type="file"
              accept=".csv,text/csv"
              className="form-control"
              onChange={async (e) => {
                const f = e.target.files?.[0]
                setResult(null)
                if (!f) return setFile(null)
                const parsed = parseCsv(await f.text())
                setFile({ name: f.name, ...parsed })
              }}
            />
            <div className="form-text">Expected columns: {TEMPLATES[type].join(', ')}</div>
          </div>
        </div>

        {file && !result && (
          <div className="mt-4">
            {missing.length > 0 ? (
              <div className="alert alert-danger">Missing required column{missing.length > 1 ? 's' : ''}: <strong>{missing.join(', ')}</strong>. Fix the file and upload it again.</div>
            ) : (
              <p className="text-muted">{file.rows.length} rows found in <strong>{file.name}</strong>. Preview of the first 5:</p>
            )}
            <div className="table-responsive border rounded mb-3">
              <table className="table table-sm mb-0">
                <thead><tr>{file.headers.map((h) => <th key={h} className={TEMPLATES[type].includes(h) ? '' : 'text-muted'}>{h}</th>)}</tr></thead>
                <tbody>{file.rows.slice(0, 5).map((r, i) => <tr key={i}>{file.headers.map((h) => <td key={h}>{r[h]}</td>)}</tr>)}</tbody>
              </table>
            </div>
            <button type="button" className="btn btn-primary" disabled={!!missing.length || !file.rows.length || run.isPending} onClick={() => run.mutate({ type, fileName: file.name, rows: file.rows })}>
              {run.isPending ? 'Validating…' : `Import ${file.rows.length} rows`}
            </button>
          </div>
        )}

        {result && (
          <div className={`alert mt-4 mb-0 ${result.failed ? 'alert-warning' : 'alert-success'}`}>
            <strong>{result.succeeded}</strong> imported, <strong>{result.failed}</strong> failed.
            {result.failed > 0 && <button type="button" className="btn btn-sm btn-light ms-3" onClick={() => downloadErrors(result)}>Download failed rows</button>}
          </div>
        )}
      </Panel>

      <h6 className="mb-3">Import history</h6>
      <ResourceList<ImportJob>
        resource="imports"
        list={importsApi.list}
        columns={columns}
        itemsLabel="imports"
        searchPlaceholder="File name…"
        actions={[{ key: 'errors', label: 'Download errors', icon: 'ri-file-warning-line', condition: (j) => j.failed > 0 }]}
        onRowAction={(_, j) => downloadErrors(j)}
      />
    </>
  )
}
