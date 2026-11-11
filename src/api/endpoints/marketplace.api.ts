import { AppError } from '@/api/errors'
import { latency, nowIso } from '@/api/mock/collection'
import { db } from '@/api/mock/db'
import { createFaker } from '@/api/mock/faker'
import { callFor, createResourceApi, http } from '@/api/resource'
import { appById, COURIER_PROFILES } from '@/constants/apps.constants'
import { AUTOMATION_TEMPLATES } from '@/constants/automation.constants'
import { FX_PER_USD, regionOf, TARGET_REGIONS, toUsd } from '@/constants/regions.constants'
import type { Currency } from '@/types/commerce.types'
import type { AutomationRule, Connector } from '@/types/integration.types'
import type { GlobalSalesOverview, Listing, RateQuote, ShippingPerformance, Storefront } from '@/types/marketplace.types'

const integrations = callFor('integrations')
const commerce = callFor('commerce')
const platform = callFor('platform')

const DAY = 86_400_000
const round = (n: number) => Math.round(n * 100) / 100

export interface InstallAppInput {
  appId: string
  region: string | null
  account: string
  mode: Connector['mode']
  name?: string
}

/** Plug-and-play apps: installing creates a connector for one account in one market. */
export const appsApi = {
  install: (input: InstallAppInput) =>
    integrations<Connector>(
      async () => {
        await latency(700, 1200)
        const app = appById(input.appId)
        if (!app) throw new AppError(404, 'APP_NOT_FOUND', 'This app is not in the catalog.')
        const duplicate = db.connectors.rows().find((c) => c.provider === app.id && c.account === input.account && (c.region ?? null) === input.region)
        if (duplicate) throw new AppError(409, 'APP_ALREADY_INSTALLED', `${app.name} is already connected for ${input.account}.`)
        const region = regionOf(input.region)
        const connector = await db.connectors.create({
          provider: app.id, kind: app.kind, name: input.name?.trim() || `${app.name}${region ? ` ${region.short}` : ''}`, status: 'connected', mode: input.mode,
          account: input.account, capabilities: app.capabilities, region: input.region, lastSyncAt: nowIso(), errors24h: 0,
        })
        // First sync starts straight away so the merchant sees data within minutes.
        await db.syncJobs.create({ connectorId: connector.id, connectorName: connector.name, type: app.kind === 'courier' ? 'tracking_pull' : app.kind === 'marketplace' || app.kind === 'storefront' ? 'orders_import' : 'product_sync', status: 'running', processed: 0, failed: 0, startedAt: nowIso(), finishedAt: null })
        return connector
      },
      () => http.post('/integrations/apps/install', input),
    ),
  uninstall: (connectorId: string) =>
    integrations<void>(async () => {
      await latency(300, 600)
      await db.connectors.remove(connectorId)
    }, () => http.delete(`/integrations/${connectorId}`)),
}

/** Turns an automation template into a draft rule the merchant reviews before publishing. */
export const templatesApi = {
  use: (templateId: string) =>
    integrations<AutomationRule>(async () => {
      await latency(250, 500)
      const t = AUTOMATION_TEMPLATES.find((x) => x.id === templateId)
      if (!t) throw new AppError(404, 'TEMPLATE_NOT_FOUND', 'Template not found.')
      return db.rules.create({ ...structuredClone(t.rule), status: 'draft', version: 1, runs30d: 0, lastRunAt: null })
    }, () => http.post('/automation/templates/use', { template_id: templateId })),
}

export const listingsApi = {
  ...createResourceApi<Listing>('/listings', db.listings),
  /** Publishes products to one marketplace account; listings start as pending until the marketplace accepts them. */
  publish: ({ productIds, connectorId }: { productIds: string[]; connectorId: string }) =>
    commerce<{ created: number; skipped: number }>(
      async () => {
        await latency(500, 900)
        const c = db.connectors.find(connectorId)
        if (c.status !== 'connected') throw new AppError(409, 'INTEGRATION_DISCONNECTED', `Reconnect ${c.name} before publishing.`)
        const currency = (regionOf(c.region)?.currency ?? 'USD') as Currency
        let created = 0
        let skipped = 0
        for (const pid of productIds) {
          const p = db.products.find(pid)
          for (const v of p.variants) {
            if (db.listings.rows().some((l) => l.connectorId === c.id && l.sku === v.sku)) {
              skipped++
              continue
            }
            const price = Math.round(Math.max(6, (v.price / FX_PER_USD.PKR) * 3.2) * FX_PER_USD[currency]) - 0.01
            await db.listings.create({ productId: p.id, sku: v.sku, title: v.title === 'Default' ? p.title : `${p.title} · ${v.title}`, connectorId: c.id, marketplace: c.name, provider: c.provider, region: c.region ?? 'US', externalId: null, status: 'pending', price, currency, publishedQty: 0, fulfilment: 'linqworks', buyBoxShare: null, unitsSold30d: 0, revenue30d: 0, feeRate: c.provider === 'amazon' ? 0.15 : 0.12, issue: null, lastSyncedAt: null })
            created++
          }
        }
        return { created, skipped }
      },
      () => http.post('/listings/publish', { product_ids: productIds, connector_id: connectorId }),
    ),
  /** Re-sends the listing to the marketplace after the issue is fixed. */
  resubmit: (id: string) =>
    commerce<Listing>(async () => {
      await latency(400, 800)
      return db.listings.update(id, { status: 'pending', issue: null, lastSyncedAt: nowIso() })
    }, () => http.post(`/listings/${id}/resubmit`)),
  setStatus: ({ id, status }: { id: string; status: Listing['status'] }) =>
    commerce<Listing>(() => db.listings.update(id, { status, lastSyncedAt: nowIso() }), () => http.patch(`/listings/${id}`, { status })),
  reprice: ({ id, price }: { id: string; price: number }) =>
    commerce<Listing>(async () => {
      if (!(price > 0)) throw new AppError(422, 'VALIDATION_ERROR', 'Price must be greater than zero.')
      return db.listings.update(id, { price: round(price), lastSyncedAt: nowIso() })
    }, () => http.patch(`/listings/${id}`, { price })),
}

export const storefrontsApi = {
  ...createResourceApi<Storefront>('/storefronts', db.storefronts),
  publish: (id: string) =>
    commerce<Storefront>(async () => {
      await latency(600, 1100)
      const s = db.storefronts.find(id)
      if (s.productsPublished === 0) throw new AppError(422, 'STOREFRONT_EMPTY', 'Publish at least one product before going live.')
      return db.storefronts.update(id, { status: 'published' })
    }, () => http.post(`/storefronts/${id}/publish`)),
  unpublish: (id: string) => commerce<Storefront>(() => db.storefronts.update(id, { status: 'draft' }), () => http.post(`/storefronts/${id}/unpublish`)),
}

/** Cross-market reporting: everything converted to USD so markets compare like for like. */
export const growthAnalyticsApi = {
  globalSales: (days: number, region?: string) =>
    platform<GlobalSalesOverview>(
      async () => {
        await latency(300, 600)
        const f = createFaker(4040 + days)
        const scale = days / 30
        const listings = db.listings.rows()
        const regions = TARGET_REGIONS.filter((r) => !region || r.code === region).map((r) => {
          const own = listings.filter((l) => l.region === r.code)
          const base = own.reduce((s, l) => s + toUsd(l.revenue30d, l.currency), 0) + f.int(4000, 12000)
          const revenueUsd = round(base * scale * (0.9 + f.rand() * 0.25))
          const orders = Math.max(1, Math.round(revenueUsd / (28 + f.rand() * 40)))
          const fees = round(revenueUsd * (0.09 + f.rand() * 0.06))
          return { region: r.code, currency: r.currency, revenueUsd, revenueLocal: round(revenueUsd * FX_PER_USD[r.currency]), previousUsd: round(revenueUsd * (0.75 + f.rand() * 0.35)), orders, aov: round(revenueUsd / orders), fees, marginRate: round(0.18 + f.rand() * 0.16), onTimeRate: round(0.9 + f.rand() * 0.09), returnRate: round(0.02 + f.rand() * 0.07) }
        })
        const share = Object.fromEntries(regions.map((r) => [r.region, r.revenueUsd / days]))
        const daily = Array.from({ length: days }, (_, i) => {
          const date = new Date(Date.now() - (days - 1 - i) * DAY).toISOString().slice(0, 10)
          const weekday = new Date(date).getDay()
          const lift = (weekday === 4 || weekday === 5 ? 1.15 : 1) * (0.8 + i / days / 2.5)
          return { date, byRegion: Object.fromEntries(regions.map((r) => [r.region, round(share[r.region] * lift * (0.75 + f.rand() * 0.5))])) }
        })
        const byKey = new Map<string, GlobalSalesOverview['byMarketplace'][number]>()
        for (const l of listings.filter((x) => !region || x.region === region)) {
          const row = byKey.get(l.connectorId) ?? { marketplace: l.marketplace, region: l.region, revenueUsd: 0, orders: 0, feesUsd: 0 }
          const usd = toUsd(l.revenue30d, l.currency) * scale
          row.revenueUsd = round(row.revenueUsd + usd)
          row.orders += Math.round(l.unitsSold30d * scale * 0.85)
          row.feesUsd = round(row.feesUsd + usd * l.feeRate)
          byKey.set(l.connectorId, row)
        }
        for (const s of db.storefronts.rows().filter((x) => x.status === 'published' && (!region || x.region === region))) {
          const usd = round(s.orders30d * 52 * scale)
          byKey.set(s.id, { marketplace: `${s.name} (store)`, region: s.region, revenueUsd: usd, orders: Math.round(s.orders30d * scale), feesUsd: round(usd * 0.029) })
        }
        const top = new Map<string, GlobalSalesOverview['topProducts'][number]>()
        for (const l of listings.filter((x) => !region || x.region === region)) {
          const row = top.get(l.sku) ?? { sku: l.sku, title: l.title, unitsSold: 0, revenueUsd: 0, channels: 0 }
          row.unitsSold += Math.round(l.unitsSold30d * scale)
          row.revenueUsd = round(row.revenueUsd + toUsd(l.revenue30d, l.currency) * scale)
          row.channels += l.status === 'live' ? 1 : 0
          top.set(l.sku, row)
        }
        const totals = regions.reduce((t, r) => ({ ...t, revenueUsd: t.revenueUsd + r.revenueUsd, previousUsd: t.previousUsd + r.previousUsd, orders: t.orders + r.orders, previousOrders: t.previousOrders + Math.round(r.orders * (r.previousUsd / r.revenueUsd)), profitUsd: t.profitUsd + r.revenueUsd * r.marginRate, feesUsd: t.feesUsd + r.fees }), { revenueUsd: 0, previousUsd: 0, orders: 0, previousOrders: 0, profitUsd: 0, feesUsd: 0 })
        return {
          days,
          totals: { ...totals, revenueUsd: round(totals.revenueUsd), previousUsd: round(totals.previousUsd), profitUsd: round(totals.profitUsd), feesUsd: round(totals.feesUsd), activeListings: listings.filter((l) => l.status === 'live' && (!region || l.region === region)).length, marketplaces: new Set(listings.map((l) => l.connectorId)).size },
          regions,
          daily,
          byMarketplace: [...byKey.values()].sort((a, b) => b.revenueUsd - a.revenueUsd),
          topProducts: [...top.values()].sort((a, b) => b.revenueUsd - a.revenueUsd).slice(0, 8),
        }
      },
      () => http.get('/analytics/global-sales', { days, region }),
    ),

  shippingPerformance: (days: number) =>
    platform<ShippingPerformance>(
      async () => {
        await latency(300, 600)
        const f = createFaker(9090 + days)
        const connected = new Set(db.connectors.rows().filter((c) => c.kind === 'courier').map((c) => c.provider))
        const couriers = COURIER_PROFILES.filter((p) => connected.has(p.appId) || ['aramex', 'smsa', 'royal_mail', 'auspost', 'usps', 'dhl'].includes(p.appId)).map((p) => {
          const parcels = Math.round(f.int(120, 900) * (days / 30))
          return { courier: appById(p.appId)?.name ?? p.appId, region: p.regions[0], parcels, onTimeRate: round(0.86 + f.rand() * 0.12), avgCostUsd: round(p.baseUsd + p.perKgUsd * 1.1), avgTransitDays: round(1 + f.rand() * 3), failedRate: round(0.01 + f.rand() * 0.06), codParcels: p.cod ? Math.round(parcels * (0.3 + f.rand() * 0.4)) : 0 }
        })
        const parcels = couriers.reduce((s, c) => s + c.parcels, 0)
        const weighted = (k: 'onTimeRate' | 'avgCostUsd' | 'avgTransitDays' | 'failedRate') => round(couriers.reduce((s, c) => s + c[k] * c.parcels, 0) / Math.max(1, parcels))
        const daily = Array.from({ length: days }, (_, i) => {
          const date = new Date(Date.now() - (days - 1 - i) * DAY).toISOString().slice(0, 10)
          const total = Math.round((parcels / days) * (0.75 + f.rand() * 0.5))
          const failed = Math.round(total * (0.015 + f.rand() * 0.04))
          return { date, delivered: total - failed, failed }
        })
        return { days, totals: { parcels, onTimeRate: weighted('onTimeRate'), avgCostUsd: weighted('avgCostUsd'), failedRate: weighted('failedRate'), avgTransitDays: weighted('avgTransitDays'), savingsUsd: round(parcels * 0.62) }, couriers: couriers.sort((a, b) => b.parcels - a.parcels), daily }
      },
      () => http.get('/analytics/shipping-performance', { days }),
    ),

  /** Indicative rate shopping across couriers serving the destination market. */
  rateQuote: ({ destination, weightKg, cod }: { destination: string; weightKg: number; cod: boolean }) =>
    platform<RateQuote[]>(
      async () => {
        await latency(400, 800)
        const currency = (regionOf(destination)?.currency ?? 'USD') as Currency
        const connected = new Set(db.connectors.rows().filter((c) => c.kind === 'courier' && c.status === 'connected').map((c) => c.provider))
        const quotes = COURIER_PROFILES.filter((p) => p.regions.includes(destination) && (!cod || p.cod)).map((p) => {
          const priceUsd = round(p.baseUsd + p.perKgUsd * Math.max(0.5, weightKg) + (cod ? 1.1 : 0))
          return { courierKey: p.appId, courier: appById(p.appId)?.name ?? p.appId, service: p.service, priceUsd, priceLocal: round(priceUsd * FX_PER_USD[currency]), currency, transitDays: p.transit, tags: [...p.tags, ...(connected.has(p.appId) ? ['Connected'] : [])] }
        })
        return quotes.sort((a, b) => a.priceUsd - b.priceUsd)
      },
      () => http.get('/shipping/rates', { destination, weight_kg: weightKg, cod }),
    ),
}
