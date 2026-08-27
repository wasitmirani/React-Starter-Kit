import { httpClient } from '@/api/http-client'
import { API_ENDPOINTS } from '@/constants/api.constants'
import type { ApiResponse } from '@/types/api.types'
import type {
  BillingPlan,
  BillingSubscription,
  BillingInvoice,
  PaymentMethod,
  PlanId,
} from '@/types/billing.types'

export const billingApi = {
  subscription: () =>
    httpClient.get<ApiResponse<BillingSubscription>>(API_ENDPOINTS.BILLING.SUBSCRIPTION),
  plans: () => httpClient.get<ApiResponse<BillingPlan[]>>('/billing/plans'),
  invoices: () =>
    httpClient.get<ApiResponse<BillingInvoice[]>>(API_ENDPOINTS.BILLING.INVOICES),
  paymentMethods: () =>
    httpClient.get<ApiResponse<PaymentMethod[]>>('/billing/payment-methods'),
  checkout: (planId: PlanId) =>
    httpClient.post<ApiResponse<{ url: string }>>(API_ENDPOINTS.BILLING.CHECKOUT, {
      planId,
    }),
  portal: () =>
    httpClient.post<ApiResponse<{ url: string }>>(API_ENDPOINTS.BILLING.PORTAL),
}
