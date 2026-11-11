import type { Currency } from './commerce.types'
import type { Entity } from './common.types'

export interface Client extends Entity {
  code: string
  name: string
  contactName: string
  email: string
  phone: string
  status: 'active' | 'onboarding' | 'suspended'
  warehouseNames: string[]
  rateCardId: string | null
  rateCardName: string | null
  billingCycle: 'monthly' | 'biweekly'
  skuCount: number
  unitsStored: number
  ordersMtd: number
  slaOnTime: number
}

export type BillableActivity = 'storage' | 'receiving' | 'putaway' | 'pick' | 'pack' | 'dispatch' | 'returns' | 'vas'

export interface Rate {
  activity: BillableActivity
  unit: string
  rate: number
  minimum: number
}

export interface RateCard extends Entity {
  name: string
  currency: Currency
  effectiveFrom: string
  status: 'active' | 'draft' | 'retired'
  rates: Rate[]
}

export interface UsageEntry extends Entity {
  clientId: string
  clientName: string
  activity: BillableActivity
  quantity: number
  unit: string
  rate: number
  amount: number
  currency: Currency
  reference: string
}

export interface ClientStatement extends Entity {
  number: string
  clientId: string
  clientName: string
  periodStart: string
  periodEnd: string
  currency: Currency
  amount: number
  lineCount: number
  status: 'draft' | 'issued' | 'paid' | 'overdue'
  dueAt: string
}
