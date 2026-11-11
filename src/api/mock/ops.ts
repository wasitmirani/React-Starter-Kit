import { AppError } from '@/api/errors'
import { useAuthStore } from '@/store/auth.store'
import type { MovementType, StockBalance } from '@/types/inventory.types'
import { nowIso, uid } from './collection'
import { db } from './db'

/** Name of the signed-in user, recorded on every mock change. */
export const actor = () => useAuthStore.getState().user?.name ?? 'You'

/** Next document number: `PO-9023` after the highest existing `PO-…`. */
export function nextNumber(numbers: string[], prefix: string, start: number): string {
  const max = numbers.reduce((n, value) => {
    const m = value.match(/(\d+)$/)
    return m ? Math.max(n, Number(m[1])) : n
  }, start - 1)
  return `${prefix}${max + 1}`
}

/** Throws the API's state-machine error when `status` is not one of `allowed`. */
export function assertStatus(status: string, allowed: string[], what: string) {
  if (!allowed.includes(status)) throw new AppError(409, 'INVALID_STATE_TRANSITION', `Cannot ${what} while status is "${status.replace(/_/g, ' ')}".`)
}

interface Movement {
  sku: string
  warehouseId: string
  type: MovementType
  /** Change applied to `field` (signed). */
  quantity: number
  field?: 'onHand' | 'reserved' | 'damaged' | 'quarantined' | 'inTransit' | 'incoming'
  reference: [type: string, number: string]
  reason?: string | null
}

/**
 * The single stock mutation path in the mock: updates the balance, recomputes
 * availability and writes an immutable ledger row. Rejects moves that would oversell.
 */
export function moveStock(m: Movement): StockBalance {
  const field = m.field ?? 'onHand'
  const rows = db.balances.rows()
  let balance = rows.find((b) => b.sku === m.sku && b.warehouseId === m.warehouseId)
  if (!balance) {
    const template = rows.find((b) => b.sku === m.sku)
    const warehouse = db.warehouses.find(m.warehouseId)
    if (!template) throw new AppError(404, 'RESOURCE_NOT_FOUND', `SKU ${m.sku} not found`)
    balance = { ...template, id: uid(), warehouseId: warehouse.id, warehouseName: warehouse.name, onHand: 0, reserved: 0, damaged: 0, quarantined: 0, available: 0, incoming: 0, inTransit: 0, createdAt: nowIso(), updatedAt: nowIso() }
    rows.unshift(balance)
  }
  const next = { ...balance, [field]: balance[field] + m.quantity, updatedAt: nowIso() }
  next.available = next.onHand - next.reserved - next.damaged - next.quarantined
  if (next[field] < 0 || next.available < 0) throw new AppError(409, 'INSUFFICIENT_STOCK', `Not enough available stock for ${m.sku} in ${balance.warehouseName}.`)
  db.balances.replaceAll(rows.map((b) => (b.id === balance!.id ? next : b)))
  const at = nowIso()
  db.ledger.replaceAll([
    { id: uid(), movementType: m.type, sku: m.sku, warehouseName: balance.warehouseName, binCode: balance.binCode, quantity: m.quantity, balanceAfter: next.onHand, referenceType: m.reference[0], referenceNumber: m.reference[1], actorName: actor(), reason: m.reason ?? null, createdAt: at, updatedAt: at },
    ...db.ledger.rows(),
  ])
  return next
}

export function warehouseByName(name: string) {
  const w = db.warehouses.rows().find((x) => x.name === name || x.code === name)
  if (!w) throw new AppError(404, 'RESOURCE_NOT_FOUND', `Warehouse ${name} not found`)
  return w
}

export function notify(title: string, body: string, type: 'info' | 'success' | 'warning' | 'error', link: string | null = null) {
  const at = nowIso()
  db.notifications.replaceAll([{ id: uid(), title, body, type, link, read: false, createdAt: at, updatedAt: at }, ...db.notifications.rows()])
}
