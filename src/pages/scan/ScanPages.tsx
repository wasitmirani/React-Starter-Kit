import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { productsApi } from '@/api/endpoints/commerce.api'
import { receiptsApi, tasksApi } from '@/api/endpoints/warehouse.api'
import { toApiError } from '@/api/errors'
import { PromptDialog } from '@/components/common/PromptDialog'
import { ScanInput, type ScanFeedback } from '@/components/features/scan/ScanInput'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { TASK_ICONS } from '@/constants/domain.constants'
import { humanize } from '@/constants/status.constants'
import { ROUTES, to } from '@/constants/routes.constants'
import { useAction, useAll, useOne } from '@/hooks/queries/resource.queries'
import { useAuth } from '@/hooks/useAuth'
import { useScanContext } from '@/layouts/ScanLayout/ScanLayout'
import type { WarehouseTask } from '@/types/warehouse.types'
import { formatRelativeTime } from '@/utils/formatters/date.formatter'

const PRIORITY = { urgent: 0, high: 1, normal: 2 } as const

/** Home: the operator's tasks first, then open ones, by priority and due time. */
export function ScanHomePage() {
  const { warehouseId } = useScanContext()
  const { user } = useAuth()
  const tasks = useAll('tasks', tasksApi.list, { warehouseId })
  const open = (tasks.data?.data ?? [])
    .filter((t) => ['open', 'assigned', 'in_progress'].includes(t.status) && ['pick', 'putaway', 'replenish', 'move'].includes(t.type))
    .sort((a, b) => Number(b.assigneeName === user?.name) - Number(a.assigneeName === user?.name) || PRIORITY[a.priority] - PRIORITY[b.priority] || a.dueAt.localeCompare(b.dueAt))

  return (
    <>
      <div className="scan-tiles">
        <Link to={ROUTES.SCAN_RECEIVE} className="scan-tile"><i className="ri-inbox-archive-line" /> Receive</Link>
        <Link to={ROUTES.SCAN_MOVE} className="scan-tile"><i className="ri-arrow-left-right-line" /> Move stock</Link>
      </div>
      <h2 className="scan-title">My tasks <span className="text-muted fs-6">({open.length})</span></h2>
      {tasks.isLoading && <p className="text-muted">Loading tasks…</p>}
      {!tasks.isLoading && !open.length && <p className="text-muted">No open tasks in this warehouse. Nice work.</p>}
      <div className="d-flex flex-column gap-3">
        {open.map((t) => (
          <Link key={t.id} to={to(ROUTES.SCAN_TASK, { id: t.id })} className={`scan-task-card priority-${t.priority}`}>
            <i className={`${TASK_ICONS[t.type]} scan-task-icon`} />
            <div className="flex-1 min-w-0">
              <div className="d-flex justify-content-between gap-2">
                <strong>{humanize(t.type)} · {t.quantity - t.quantityDone} × {t.sku}</strong>
                <StatusBadge status={t.status} />
              </div>
              <div className="text-muted text-truncate">{t.productTitle}</div>
              <div className="fs-sm mt-1"><span className="font-monospace">{t.fromBin} → {t.toBin}</span> · due {formatRelativeTime(t.dueAt)}{t.assigneeName === user?.name ? ' · assigned to you' : ''}</div>
            </div>
          </Link>
        ))}
      </div>
    </>
  )
}

type Step = 'bin' | 'sku' | 'quantity'

/** Guided task: scan the bin, then the item, then confirm quantity (or report short). */
export function ScanTaskPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { online } = useScanContext()
  const task = useOne('tasks', tasksApi.get, id)
  const [step, setStep] = useState<Step>('bin')
  const [feedback, setFeedback] = useState<ScanFeedback | null>(null)
  const [qty, setQty] = useState<number | null>(null)
  const [short, setShort] = useState(false)
  const scan = useAction('tasks', tasksApi.scan, { quietErrors: true })
  const complete = useAction('tasks', tasksApi.complete, { invalidates: ['balances', 'waves'], success: (t) => (t.status === 'exception' ? `${t.number}: short reported` : `${t.number} done`), onSuccess: () => navigate(ROUTES.SCAN) })

  const t = task.data
  if (!t) return <p className="text-muted">{task.isError ? toApiError(task.error).message : 'Loading task…'}</p>
  if (!['open', 'assigned', 'in_progress'].includes(t.status)) {
    return <div className="text-center py-5"><StatusBadge status={t.status} /><p className="mt-3">This task is {humanize(t.status).toLowerCase()}.</p><Link to={ROUTES.SCAN} className="btn btn-primary btn-lg">Back to my tasks</Link></div>
  }
  const remaining = t.quantity - t.quantityDone
  const bin = t.type === 'putaway' ? t.toBin : t.fromBin
  const quantity = qty ?? remaining

  const onScan = (s: 'bin' | 'sku') => (code: string) =>
    scan.mutateAsync({ id: t.id, step: s, code }).then(
      () => {
        setFeedback({ ok: true, message: s === 'bin' ? `Bin ${code} confirmed` : `${code} confirmed` })
        setStep(s === 'bin' ? 'sku' : 'quantity')
      },
      (e) => setFeedback({ ok: false, message: toApiError(e).message }),
    )

  return (
    <>
      <div className="scan-task-head">
        <span className="text-muted">{t.number} · {humanize(t.type)}{t.orderNumber ? ` · ${t.orderNumber}` : ''}</span>
        <h2 className="scan-title mb-1">{remaining} × <span className="font-monospace">{t.sku}</span></h2>
        <div className="text-muted">{t.productTitle}</div>
      </div>
      <ol className="scan-steps">
        {(['bin', 'sku', 'quantity'] as const).map((s, i) => <li key={s} className={step === s ? 'active' : ['bin', 'sku', 'quantity'].indexOf(step) > i ? 'done' : ''}>{s === 'bin' ? `Bin ${bin}` : s === 'sku' ? 'Item' : 'Quantity'}</li>)}
      </ol>

      {step === 'bin' && <ScanInput key="bin" label={t.type === 'putaway' ? `Go to bin ${bin} and scan its label` : `Go to bin ${bin} and scan its label`} feedback={feedback} busy={scan.isPending || !online} onScan={onScan('bin')} />}
      {step === 'sku' && <ScanInput key="sku" label={`Scan the item (${t.sku})`} feedback={feedback} busy={scan.isPending || !online} onScan={onScan('sku')} />}
      {step === 'quantity' && (
        <div>
          <div role="status" className="scan-feedback ok mb-3"><i className="ri-checkbox-circle-fill" /> Bin and item confirmed</div>
          <label htmlFor="scan-qty" className="form-label fw-semibold">Quantity {t.type === 'putaway' ? 'put away' : 'picked'}</label>
          <div className="scan-qty">
            <button type="button" className="btn btn-light btn-lg" aria-label="Less" onClick={() => setQty(Math.max(0, quantity - 1))}>−</button>
            <input id="scan-qty" type="number" inputMode="numeric" className="form-control form-control-lg text-center tabular-nums" min={0} max={remaining} value={quantity} onChange={(e) => setQty(Math.min(remaining, Math.max(0, Number(e.target.value))))} />
            <button type="button" className="btn btn-light btn-lg" aria-label="More" disabled={quantity >= remaining} onClick={() => setQty(quantity + 1)}>+</button>
          </div>
          <div className="d-grid gap-2 mt-4">
            <button type="button" className="btn btn-primary btn-lg" disabled={!online || complete.isPending || quantity !== remaining} onClick={() => complete.mutate({ id: t.id, quantity })}>
              <i className="ri-check-line me-1" />Confirm {quantity}
            </button>
            <button type="button" className="btn btn-outline-danger btn-lg" disabled={!online || complete.isPending || quantity >= remaining} onClick={() => setShort(true)}>
              Report short ({quantity} of {remaining})
            </button>
          </div>
        </div>
      )}

      <PromptDialog open={short} title="Short pick" message={`You found ${quantity} of ${remaining}. A supervisor will investigate the bin.`} label="What happened?" confirmLabel="Report short" danger busy={complete.isPending} onClose={() => setShort(false)} onConfirm={(reason) => complete.mutate({ id: t.id, quantity, shortReason: reason })} />
    </>
  )
}

/** Receiving on the dock: pick an expected receipt, scan items to count them, then save. */
export function ScanReceivePage() {
  const { warehouseId, online } = useScanContext()
  const receipts = useAll('receipts', receiptsApi.list, { warehouseId })
  const [receiptId, setReceiptId] = useState<string | null>(null)
  const [counts, setCounts] = useState<Record<string, number>>({})
  const [feedback, setFeedback] = useState<ScanFeedback | null>(null)
  const receive = useAction('receipts', receiptsApi.receive, { invalidates: ['tasks', 'balances', 'purchase-orders'], success: 'Receipt counts saved; putaway tasks created', onSuccess: () => { setReceiptId(null); setCounts({}) } })
  const open = (receipts.data?.data ?? []).filter((r) => r.status !== 'completed')
  const receipt = open.find((r) => r.id === receiptId)
  const products = useAll('products', productsApi.list)
  const barcodes = new Map((products.data?.data ?? []).flatMap((p) => p.variants.map((v) => [v.barcode, v.sku] as const)))

  if (!receipt) {
    return (
      <>
        <h2 className="scan-title">Receive</h2>
        {!open.length && <p className="text-muted">No receipts expected in this warehouse.</p>}
        <div className="d-flex flex-column gap-3">
          {open.map((r) => (
            <button key={r.id} type="button" className="scan-task-card text-start" onClick={() => setReceiptId(r.id)}>
              <i className="ri-inbox-archive-line scan-task-icon" />
              <div className="flex-1"><strong>{r.number}</strong> · {r.supplierName}<div className="text-muted fs-sm">{r.purchaseOrderNumber ?? 'Blind receipt'} · {r.lines.length} SKUs</div></div>
              <StatusBadge status={r.status} />
            </button>
          ))}
        </div>
      </>
    )
  }

  const onScan = async (code: string) => {
    const value = code.toUpperCase()
    const line = receipt.lines.find((l) => l.sku === value || barcodes.get(value) === l.sku)
    if (!line) return setFeedback({ ok: false, message: `${value} is not on ${receipt.number}. Set it aside for inspection.` })
    const next = (counts[line.sku] ?? line.received) + 1
    setCounts({ ...counts, [line.sku]: next })
    setFeedback({ ok: next <= line.expected, message: next <= line.expected ? `${line.sku}: ${next} / ${line.expected}` : `${line.sku}: over-receipt (${next} / ${line.expected})` })
  }

  return (
    <>
      <h2 className="scan-title">{receipt.number}</h2>
      <p className="text-muted">{receipt.supplierName} · scan each unit</p>
      <ScanInput label="Scan item" feedback={feedback} busy={!online} onScan={onScan} />
      <ul className="list-group my-4">
        {receipt.lines.map((l) => {
          const n = counts[l.sku] ?? l.received
          return <li key={l.sku} className={`list-group-item d-flex justify-content-between ${n === l.expected ? 'list-group-item-success' : n > l.expected ? 'list-group-item-warning' : ''}`}><span className="font-monospace">{l.sku}</span><span className="tabular-nums fs-5">{n} / {l.expected}</span></li>
        })}
      </ul>
      <div className="d-grid gap-2">
        <button type="button" className="btn btn-primary btn-lg" disabled={!online || receive.isPending} onClick={() => receive.mutate({ id: receipt.id, complete: false, lines: receipt.lines.map((l) => ({ sku: l.sku, received: counts[l.sku] ?? l.received, rejected: l.rejected })) })}>Save counts</button>
        <button type="button" className="btn btn-light btn-lg" onClick={() => setReceiptId(null)}>Choose another receipt</button>
      </div>
    </>
  )
}

/** Bin-to-bin move: source bin, item, quantity, destination bin. */
export function ScanMovePage() {
  const { warehouseId, online } = useScanContext()
  const navigate = useNavigate()
  const [draft, setDraft] = useState<{ fromBin?: string; sku?: string; quantity: number }>({ quantity: 1 })
  const [feedback, setFeedback] = useState<ScanFeedback | null>(null)
  const move = useAction('tasks', tasksApi.move, { invalidates: ['balances', 'locations'], quietErrors: true, success: (t: WarehouseTask) => `Moved ${t.quantity} × ${t.sku} to ${t.toBin}`, onSuccess: () => navigate(ROUTES.SCAN) })

  return (
    <>
      <h2 className="scan-title">Move stock</h2>
      {!draft.fromBin && <ScanInput key="from" label="Scan the source bin" feedback={feedback} busy={!online} onScan={async (c) => { setDraft({ ...draft, fromBin: c.toUpperCase() }); setFeedback({ ok: true, message: `From ${c.toUpperCase()}` }) }} />}
      {draft.fromBin && !draft.sku && <ScanInput key="sku" label="Scan the item" feedback={feedback} busy={!online} onScan={async (c) => { setDraft({ ...draft, sku: c.toUpperCase() }); setFeedback({ ok: true, message: `Item ${c.toUpperCase()}` }) }} />}
      {draft.fromBin && draft.sku && (
        <>
          <label htmlFor="move-qty" className="form-label fw-semibold">Quantity</label>
          <input id="move-qty" type="number" min={1} inputMode="numeric" className="form-control form-control-lg mb-4" value={draft.quantity} onChange={(e) => setDraft({ ...draft, quantity: Math.max(1, Number(e.target.value)) })} />
          <ScanInput key="to" label="Scan the destination bin" feedback={feedback} busy={!online || move.isPending} onScan={(c) => move.mutateAsync({ warehouseId, sku: draft.sku!, fromBin: draft.fromBin!, toBin: c, quantity: draft.quantity }).catch((e) => setFeedback({ ok: false, message: toApiError(e).message }))} />
        </>
      )}
      <p className="text-muted mt-4 fs-sm">{draft.fromBin && `From ${draft.fromBin}`}{draft.sku && ` · ${draft.sku}`}</p>
      {draft.fromBin && <button type="button" className="btn btn-light" onClick={() => { setDraft({ quantity: 1 }); setFeedback(null) }}>Start over</button>}
    </>
  )
}
