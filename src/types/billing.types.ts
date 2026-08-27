export type PlanId = 'starter' | 'professional' | 'business' | 'enterprise'

export interface BillingPlan {
  id: PlanId
  name: string
  monthlyPrice: number
  aiMinutes: number
  features: string[]
}

export interface BillingSubscription {
  planId: PlanId
  planName: string
  monthlyPrice: number
  aiMinutesIncluded: number
  aiMinutesUsed: number
  remainingMinutes: number
  overageMinutes: number
  overageCost: number
  nextBillingDate: string
  status: 'active' | 'past_due' | 'canceled'
}

export interface BillingInvoice {
  id: string
  number: string
  amount: number
  status: 'paid' | 'open' | 'void'
  issuedAt: string
  pdfUrl?: string
}

export interface PaymentMethod {
  id: string
  brand: string
  last4: string
  expMonth: number
  expYear: number
  isDefault: boolean
}
