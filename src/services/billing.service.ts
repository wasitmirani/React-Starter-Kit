import { shouldMockModule } from '@/config/env.config'
import { billingApi } from '@/api/endpoints/billing.api'
import type { ApiResponse } from '@/types/api.types'
import type {
  BillingPlan,
  BillingSubscription,
  BillingInvoice,
  PaymentMethod,
  PlanId,
} from '@/types/billing.types'
import { delay, ok } from '@/lib/mock'
import {
  mockBillingPlans,
  mockSubscription,
  mockInvoices,
  mockPaymentMethods,
} from '@/services/mock/mock-data'

let subscription = { ...mockSubscription }

export const billingService = {
  async subscription(): Promise<ApiResponse<BillingSubscription>> {
    if (shouldMockModule('billing')) {
      await delay()
      return ok(subscription)
    }
    const res = await billingApi.subscription()
    return res.data
  },

  async plans(): Promise<ApiResponse<BillingPlan[]>> {
    if (shouldMockModule('billing')) {
      await delay()
      return ok(mockBillingPlans)
    }
    const res = await billingApi.plans()
    return res.data
  },

  async invoices(): Promise<ApiResponse<BillingInvoice[]>> {
    if (shouldMockModule('billing')) {
      await delay()
      return ok(mockInvoices)
    }
    const res = await billingApi.invoices()
    return res.data
  },

  async paymentMethods(): Promise<ApiResponse<PaymentMethod[]>> {
    if (shouldMockModule('billing')) {
      await delay()
      return ok(mockPaymentMethods)
    }
    const res = await billingApi.paymentMethods()
    return res.data
  },

  async changePlan(planId: PlanId): Promise<ApiResponse<BillingSubscription | { url: string }>> {
    if (shouldMockModule('billing')) {
      await delay(400)
      const plan = mockBillingPlans.find((p) => p.id === planId)
      if (plan) {
        subscription = {
          ...subscription,
          planId: plan.id,
          planName: plan.name,
          monthlyPrice: plan.monthlyPrice,
          aiMinutesIncluded: plan.aiMinutes,
          remainingMinutes: Math.max(0, plan.aiMinutes - subscription.aiMinutesUsed),
        }
      }
      return ok(subscription, 'Plan updated')
    }
    const res = await billingApi.checkout(planId)
    if (res.data.success && res.data.data?.url && typeof window !== 'undefined') {
      window.location.assign(res.data.data.url)
    }
    return res.data
  },

  async openPortal(): Promise<ApiResponse<{ url: string }>> {
    if (shouldMockModule('billing')) {
      await delay()
      return ok({ url: '#' }, 'Portal unavailable in mock mode')
    }
    const res = await billingApi.portal()
    if (res.data.success && res.data.data?.url) {
      window.location.assign(res.data.data.url)
    }
    return res.data
  },
}
