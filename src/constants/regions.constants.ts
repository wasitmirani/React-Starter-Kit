import type { Currency } from '@/types/commerce.types'

export type RegionCode = 'AE' | 'SA' | 'US' | 'GB' | 'AU' | 'PK'

export interface Region {
  code: RegionCode
  name: string
  short: string
  flag: string
  currency: Currency
  /** Standard VAT / GST / sales tax rate used as the default for new storefronts. */
  taxRate: number
  taxLabel: string
  languages: string[]
  timezone: string
  /** Local compliance the app handles in this market. */
  compliance: string[]
}

/** Launch markets, in the order the product is sold. PK stays for existing workspaces. */
export const REGIONS: Region[] = [
  { code: 'AE', name: 'United Arab Emirates', short: 'UAE', flag: '🇦🇪', currency: 'AED', taxRate: 0.05, taxLabel: 'VAT 5%', languages: ['en', 'ar'], timezone: 'Asia/Dubai', compliance: ['FTA VAT invoices', 'Arabic labels', 'COD reconciliation'] },
  { code: 'SA', name: 'Saudi Arabia', short: 'KSA', flag: '🇸🇦', currency: 'SAR', taxRate: 0.15, taxLabel: 'VAT 15%', languages: ['ar', 'en'], timezone: 'Asia/Riyadh', compliance: ['ZATCA e-invoicing (Fatoora)', 'Arabic-first storefronts', 'National address on labels'] },
  { code: 'US', name: 'United States', short: 'USA', flag: '🇺🇸', currency: 'USD', taxRate: 0, taxLabel: 'Sales tax by state', languages: ['en'], timezone: 'America/New_York', compliance: ['State sales tax nexus', 'Marketplace facilitator tax', 'Hazmat flags'] },
  { code: 'GB', name: 'United Kingdom', short: 'UK', flag: '🇬🇧', currency: 'GBP', taxRate: 0.2, taxLabel: 'VAT 20%', languages: ['en'], timezone: 'Europe/London', compliance: ['VAT (MTD ready)', 'IOSS / EU shipping', 'Royal Mail Click & Drop'] },
  { code: 'AU', name: 'Australia', short: 'AUS', flag: '🇦🇺', currency: 'AUD', taxRate: 0.1, taxLabel: 'GST 10%', languages: ['en'], timezone: 'Australia/Sydney', compliance: ['GST tax invoices', 'Australia Post eParcel', 'Low-value import GST'] },
  { code: 'PK', name: 'Pakistan', short: 'PK', flag: '🇵🇰', currency: 'PKR', taxRate: 0.18, taxLabel: 'GST 18%', languages: ['en', 'ur'], timezone: 'Asia/Karachi', compliance: ['COD reconciliation', 'FBR invoices'] },
]

/** The five launch markets shown first everywhere (UAE, KSA, USA, UK, Australia). */
export const TARGET_REGIONS = REGIONS.filter((r) => r.code !== 'PK')

export const regionOf = (code: string | null | undefined) => REGIONS.find((r) => r.code === code)

export const regionLabel = (code: string | null | undefined) => {
  const r = regionOf(code)
  return r ? `${r.flag} ${r.short}` : 'Global'
}

/** Units of currency per 1 USD (indicative rates for reporting; live rates come from the API). */
export const FX_PER_USD: Record<Currency, number> = { USD: 1, AED: 3.6725, SAR: 3.75, GBP: 0.79, AUD: 1.52, EUR: 0.92, PKR: 280 }

export const toUsd = (amount: number, currency: Currency) => amount / FX_PER_USD[currency]
export const fromUsd = (amount: number, currency: Currency) => amount * FX_PER_USD[currency]
