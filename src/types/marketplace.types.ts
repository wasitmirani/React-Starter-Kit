import type { Currency } from './commerce.types'
import type { Entity } from './common.types'

/** One product offer on one marketplace account (Amazon.ae, eBay UK, Noon KSA…). */
export interface Listing extends Entity {
  productId: string
  sku: string
  title: string
  connectorId: string
  marketplace: string
  /** Provider key from the app catalog (amazon, ebay, noon…). */
  provider: string
  region: string
  /** ASIN, eBay item ID, Noon PSKU… */
  externalId: string | null
  status: 'live' | 'pending' | 'suppressed' | 'error' | 'inactive'
  price: number
  currency: Currency
  /** Quantity published after safety stock. */
  publishedQty: number
  fulfilment: 'merchant' | 'marketplace' | 'linqworks'
  /** Share of page views where this offer won the buy box (Amazon / Noon). */
  buyBoxShare: number | null
  unitsSold30d: number
  revenue30d: number
  /** Marketplace referral + closing fees as a fraction of the price. */
  feeRate: number
  issue: string | null
  lastSyncedAt: string | null
}

export type StorefrontTheme = 'minimal' | 'bold' | 'luxury' | 'marketplace'

/** First-party branded store per market, powered by the shared catalog and stock. */
export interface Storefront extends Entity {
  name: string
  domain: string
  region: string
  currency: Currency
  languages: string[]
  theme: StorefrontTheme
  brandColor: string
  status: 'published' | 'draft' | 'maintenance'
  productsPublished: number
  checkout: string[]
  /** Monthly figures for the store card. */
  visitors30d: number
  orders30d: number
  conversionRate: number
  taxInclusive: boolean
}

/** One row of the cross-market sales dashboard. */
export interface RegionSales {
  region: string
  currency: Currency
  revenueLocal: number
  revenueUsd: number
  previousUsd: number
  orders: number
  aov: number
  fees: number
  marginRate: number
  onTimeRate: number
  returnRate: number
}

export interface GlobalSalesOverview {
  days: number
  totals: { revenueUsd: number; previousUsd: number; orders: number; previousOrders: number; profitUsd: number; feesUsd: number; activeListings: number; marketplaces: number }
  regions: RegionSales[]
  daily: { date: string; byRegion: Record<string, number> }[]
  byMarketplace: { marketplace: string; region: string; revenueUsd: number; orders: number; feesUsd: number }[]
  topProducts: { sku: string; title: string; unitsSold: number; revenueUsd: number; channels: number }[]
}

export interface ShippingPerformance {
  days: number
  totals: { parcels: number; onTimeRate: number; avgCostUsd: number; failedRate: number; avgTransitDays: number; savingsUsd: number }
  couriers: { courier: string; region: string; parcels: number; onTimeRate: number; avgCostUsd: number; avgTransitDays: number; failedRate: number; codParcels: number }[]
  daily: { date: string; delivered: number; failed: number }[]
}

export interface RateQuote {
  courierKey: string
  courier: string
  service: string
  priceUsd: number
  priceLocal: number
  currency: Currency
  transitDays: string
  tags: string[]
}
