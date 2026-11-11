import { useId } from 'react'
import { productsApi } from '@/api/endpoints/commerce.api'
import { useTenantQuery } from '@/hooks/queries/resource.queries'

export interface LineDraft {
  sku: string
  quantity: number
  /** Unit price or cost; omitted when `priceLabel` is not set. */
  price?: number
}

interface LineItemsEditorProps {
  lines: LineDraft[]
  onChange: (lines: LineDraft[]) => void
  /** Column title for the price input (e.g. "Unit price"); hidden when absent. */
  priceLabel?: string
  /** Allow negative quantities (stock adjustments). */
  signed?: boolean
  error?: string
}

/** Every active SKU, cached for pickers. */
export function useSkus() {
  return useTenantQuery('products', 'skus', productsApi.skus, { staleTime: 5 * 60_000 })
}

/**
 * SKU + quantity (+ price) rows with a typeahead over the catalog. Picking a SKU
 * fills its catalog price; unknown SKUs are flagged before the API rejects them.
 */
export function LineItemsEditor({ lines, onChange, priceLabel, signed = false, error }: LineItemsEditorProps) {
  const listId = useId()
  const skus = useSkus()
  const known = new Map((skus.data ?? []).map((s) => [s.sku, s]))
  const set = (i: number, patch: Partial<LineDraft>) => onChange(lines.map((l, j) => (j === i ? { ...l, ...patch } : l)))

  return (
    <div>
      <datalist id={listId}>
        {(skus.data ?? []).map((s) => <option key={s.sku} value={s.sku}>{s.title}</option>)}
      </datalist>
      <div className="table-responsive">
        <table className="table table-sm align-middle mb-2">
          <thead>
            <tr className="text-muted fs-sm">
              <th>SKU</th>
              <th style={{ width: 120 }}>Quantity</th>
              {priceLabel && <th style={{ width: 150 }}>{priceLabel}</th>}
              <th style={{ width: 44 }} />
            </tr>
          </thead>
          <tbody>
            {lines.map((l, i) => {
              const item = known.get(l.sku)
              return (
                <tr key={i}>
                  <td>
                    <input
                      className={`form-control form-control-sm${l.sku && skus.data && !item ? ' is-invalid' : ''}`}
                      list={listId}
                      value={l.sku}
                      placeholder="Type SKU or product"
                      aria-label={`SKU line ${i + 1}`}
                      onChange={(e) => {
                        const sku = e.target.value.toUpperCase()
                        const match = known.get(sku)
                        set(i, { sku, ...(priceLabel && match && !l.price ? { price: match.price } : {}) })
                      }}
                    />
                    <div className={`fs-xs mt-1 ${item ? 'text-muted' : 'text-danger'}`}>{l.sku ? item?.title ?? 'Unknown SKU' : ' '}</div>
                  </td>
                  <td>
                    <input type="number" className="form-control form-control-sm" value={l.quantity} min={signed ? undefined : 1} aria-label={`Quantity line ${i + 1}`} onChange={(e) => set(i, { quantity: Number(e.target.value) })} />
                    <div className="fs-xs mt-1">&nbsp;</div>
                  </td>
                  {priceLabel && (
                    <td>
                      <input type="number" className="form-control form-control-sm" value={l.price ?? 0} min={0} step="any" aria-label={`${priceLabel} line ${i + 1}`} onChange={(e) => set(i, { price: Number(e.target.value) })} />
                      <div className="fs-xs mt-1">&nbsp;</div>
                    </td>
                  )}
                  <td>
                    <button type="button" className="btn btn-sm btn-light btn-icon" aria-label="Remove line" disabled={lines.length === 1} onClick={() => onChange(lines.filter((_, j) => j !== i))}>
                      <i className="ri-delete-bin-line" />
                    </button>
                    <div className="fs-xs mt-1">&nbsp;</div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      {error && <div className="invalid-feedback d-block mb-2">{error}</div>}
      <button type="button" className="btn btn-sm btn-light" onClick={() => onChange([...lines, { sku: '', quantity: 1, ...(priceLabel ? { price: 0 } : {}) }])}>
        <i className="ri-add-line" /> Add line
      </button>
    </div>
  )
}

/** Client-side check before submit: SKUs known, quantities valid. Returns a message or null. */
export function validateLines(lines: LineDraft[], known: Set<string> | null, signed = false): string | null {
  if (!lines.length) return 'Add at least one line.'
  for (const l of lines) {
    if (!l.sku) return 'Every line needs a SKU.'
    if (known && !known.has(l.sku)) return `SKU ${l.sku} is not in the catalog.`
    if (!Number.isFinite(l.quantity) || l.quantity === 0 || (!signed && l.quantity < 0)) return `Enter a valid quantity for ${l.sku}.`
  }
  if (new Set(lines.map((l) => l.sku)).size !== lines.length) return 'Each SKU can appear only once.'
  return null
}
