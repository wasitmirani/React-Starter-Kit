import type { Plan } from '@/types/platform.types'
import type { Currency } from '@/types/commerce.types'
import { FX_PER_USD } from './regions.constants'

export const PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    priceMonthly: 0,
    description: 'Try multi-channel selling with one store and manual orders.',
    features: ['100 orders / month', '1 warehouse', '1 sales channel', 'Manual and CSV orders', 'Community support'],
    limits: { orders: 100, warehouses: 1, seats: 2 },
  },
  {
    id: 'starter',
    name: 'Starter',
    priceMonthly: 59,
    description: 'For brands selling on a store plus one or two marketplaces.',
    features: ['2,000 orders / month', '2 warehouses', '3 sales channels (Amazon, eBay, Noon, Shopify, Salla…)', 'Courier booking and rate shopping', '10 automation rules', '1 branded storefront', '5 seats'],
    limits: { orders: 2_000, warehouses: 2, seats: 5 },
  },
  {
    id: 'business',
    name: 'Growth',
    priceMonthly: 249,
    description: 'Sell in every market with full WMS, automation and analytics.',
    features: ['20,000 orders / month', '10 warehouses', 'Unlimited channels and marketplaces', 'All couriers, payments and accounting apps', 'Unlimited automations and templates', '5 storefronts with Arabic RTL', 'Global sales and shipping dashboards', 'Scanner app, pick waves, 3PL billing', '25 seats'],
    limits: { orders: 20_000, warehouses: 10, seats: 25 },
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    priceMonthly: null,
    description: 'High volume, custom integrations, SSO and an SLA.',
    features: ['Custom order volumes', 'Unlimited warehouses and storefronts', 'Custom connectors and Direct API limits', 'SSO, audit exports, data residency (UAE / KSA)', '99.95% uptime SLA', 'Dedicated success manager'],
    limits: { orders: null, warehouses: null, seats: null },
  },
]

/** Currencies prospects can price in on the public pricing page. */
export const PRICING_CURRENCIES: Currency[] = ['USD', 'AED', 'SAR', 'GBP', 'AUD']

/** Local list price: converted from USD and rounded to a clean "…9" price point. */
export function localPrice(usd: number, currency: Currency): number {
  if (currency === 'USD' || usd === 0) return usd
  const raw = usd * FX_PER_USD[currency]
  return Math.max(9, Math.round(raw / 10) * 10 - 1)
}

/** Yearly billing discount. */
export const YEARLY_DISCOUNT = 0.2
