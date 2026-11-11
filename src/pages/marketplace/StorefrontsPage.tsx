import { useState } from 'react'
import { storefrontsApi } from '@/api/endpoints/marketplace.api'
import { errorMessage } from '@/api/errors'
import { FormAlert } from '@/components/common/FormAlert'
import { QueryError } from '@/components/common/Misc'
import { PageHeader } from '@/components/common/PageHeader'
import { Drawer } from '@/components/ui/Drawer'
import { EmptyState, SkeletonLines } from '@/components/ui/EmptyState'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { regionOf, TARGET_REGIONS } from '@/constants/regions.constants'
import { useAction, useAll } from '@/hooks/queries/resource.queries'
import type { Storefront, StorefrontTheme } from '@/types/marketplace.types'
import { formatPercent } from '@/utils/formatters/number.formatter'

const THEMES: { value: StorefrontTheme; label: string; hint: string }[] = [
  { value: 'minimal', label: 'Minimal', hint: 'Clean, lots of white space' },
  { value: 'bold', label: 'Bold', hint: 'Fashion and streetwear' },
  { value: 'luxury', label: 'Luxury', hint: 'Beauty, fragrance, gifting' },
  { value: 'marketplace', label: 'Catalog', hint: 'Large assortments, dense grid' },
]

/** Checkout options offered per market (shown as suggestions in the editor). */
const CHECKOUT_BY_REGION: Record<string, string[]> = {
  AE: ['Card', 'Apple Pay', 'Tabby', 'Tamara', 'COD'],
  SA: ['mada', 'Card', 'Apple Pay', 'STC Pay', 'Tabby', 'Tamara', 'COD'],
  US: ['Card', 'Apple Pay', 'Google Pay', 'PayPal', 'Afterpay', 'Shop Pay'],
  GB: ['Card', 'Apple Pay', 'Google Pay', 'PayPal', 'Clearpay', 'Klarna'],
  AU: ['Card', 'Apple Pay', 'PayPal', 'Afterpay', 'Zip'],
}

type Draft = Omit<Storefront, 'id' | 'createdAt' | 'updatedAt' | 'visitors30d' | 'orders30d' | 'conversionRate'>
const blank = (region = 'AE'): Draft => {
  const r = regionOf(region)!
  return { name: '', domain: '', region, currency: r.currency, languages: [...r.languages], theme: 'minimal', brandColor: '#4F46E5', status: 'draft', productsPublished: 24, checkout: CHECKOUT_BY_REGION[region]?.slice(0, 3) ?? ['Card'], taxInclusive: region !== 'US' }
}

export function StorefrontsPage() {
  const stores = useAll('storefronts', storefrontsApi.list)
  const [editing, setEditing] = useState<{ id: string | null; draft: Draft } | null>(null)
  const publish = useAction('storefronts', storefrontsApi.publish, { success: (s) => `${s.name} is live at ${s.domain}` })
  const unpublish = useAction('storefronts', storefrontsApi.unpublish, { success: (s) => `${s.name} unpublished` })
  const rows = stores.data?.data ?? []

  return (
    <>
      <PageHeader
        title="Storefronts"
        description="Branded stores per market on your own domain, sharing one catalog and stock pool with your marketplaces. Arabic stores render right-to-left with local payment methods."
        actions={<button type="button" className="btn btn-primary" onClick={() => setEditing({ id: null, draft: blank() })}><i className="ri-add-line me-1" />New storefront</button>}
      />
      {stores.isError && <QueryError message={errorMessage(stores.error)} onRetry={() => stores.refetch()} />}
      {stores.isLoading && <div className="card card-body"><SkeletonLines lines={6} /></div>}
      {!stores.isLoading && !rows.length && <EmptyState icon="ri-store-2-line" title="No storefronts yet" description="Launch a branded store for the UAE, KSA, USA, UK or Australia in minutes." action={<button type="button" className="btn btn-primary" onClick={() => setEditing({ id: null, draft: blank() })}>Create storefront</button>} />}
      <div className="row g-4">
        {rows.map((s) => (
          <div key={s.id} className="col-lg-6 col-xxl-4">
            <div className="card h-100 mb-0">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start gap-2 mb-3">
                  <div className="min-w-0"><h6 className="mb-0 text-truncate">{regionOf(s.region)?.flag} {s.name}</h6><a href={`https://${s.domain}`} target="_blank" rel="noreferrer" className="fs-sm">{s.domain} <i className="ri-external-link-line" /></a></div>
                  <StatusBadge status={s.status} />
                </div>
                <StorePreview store={s} compact />
                <div className="row g-2 text-center mt-3">
                  <div className="col-4"><div className="fw-semibold tabular-nums">{s.visitors30d.toLocaleString()}</div><div className="text-muted fs-xs">Visitors 30d</div></div>
                  <div className="col-4"><div className="fw-semibold tabular-nums">{s.orders30d.toLocaleString()}</div><div className="text-muted fs-xs">Orders 30d</div></div>
                  <div className="col-4"><div className="fw-semibold tabular-nums">{formatPercent(s.conversionRate)}</div><div className="text-muted fs-xs">Conversion</div></div>
                </div>
              </div>
              <div className="card-footer d-flex gap-2">
                <button type="button" className="btn btn-sm btn-light" onClick={() => setEditing({ id: s.id, draft: { ...s } })}><i className="ri-palette-line" /> Customize</button>
                {s.status === 'published'
                  ? <button type="button" className="btn btn-sm btn-light ms-auto" disabled={unpublish.isPending} onClick={() => unpublish.mutate(s.id)}>Unpublish</button>
                  : <button type="button" className="btn btn-sm btn-primary ms-auto" disabled={publish.isPending} onClick={() => publish.mutate(s.id)}><i className="ri-rocket-line" /> Publish</button>}
              </div>
            </div>
          </div>
        ))}
      </div>
      {editing && <StoreEditor key={editing.id ?? 'new'} id={editing.id} initial={editing.draft} onClose={() => setEditing(null)} />}
    </>
  )
}

function StoreEditor({ id, initial, onClose }: { id: string | null; initial: Draft; onClose: () => void }) {
  const [d, setD] = useState<Draft>(initial)
  const [error, setError] = useState<string | null>(null)
  const save = useAction('storefronts', (draft: Draft) => (id ? storefrontsApi.update(id, draft) : storefrontsApi.create({ ...draft, visitors30d: 0, orders30d: 0, conversionRate: 0 })), { success: (s) => `${s.name} saved`, onSuccess: onClose })
  const set = (patch: Partial<Draft>) => setD({ ...d, ...patch })
  const toggle = (list: string[], v: string) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v])
  const changeRegion = (code: string) => {
    const r = regionOf(code)!
    set({ region: code, currency: r.currency, languages: [...r.languages], checkout: CHECKOUT_BY_REGION[code]?.slice(0, 3) ?? ['Card'], taxInclusive: code !== 'US' })
  }
  const submit = () => {
    if (d.name.trim().length < 3) return setError('Give the store a name.')
    if (!/^[a-z0-9-]+(\.[a-z0-9-]+)+$/i.test(d.domain.trim())) return setError('Enter a domain such as mybrand.ae.')
    if (!d.languages.length) return setError('Choose at least one language.')
    if (!d.checkout.length) return setError('Offer at least one payment method.')
    setError(null)
    save.mutate({ ...d, name: d.name.trim(), domain: d.domain.trim().toLowerCase() })
  }
  const region = regionOf(d.region)

  return (
    <Drawer open size="lg" onClose={onClose} title={id ? `Customize ${initial.name}` : 'New storefront'} subtitle="Changes preview live; publish when ready." footer={<><button type="button" className="btn btn-light" onClick={onClose}>Cancel</button><button type="button" className="btn btn-primary" disabled={save.isPending} onClick={submit}>{save.isPending ? 'Saving…' : 'Save'}</button></>}>
      <FormAlert message={error} onClose={() => setError(null)} />
      <StorePreview store={{ ...d, name: d.name || 'Your brand' }} />
      <div className="row g-3 mt-2">
        <div className="col-sm-6"><label className="form-label" htmlFor="sf-name">Store name</label><input id="sf-name" className="form-control" value={d.name} onChange={(e) => set({ name: e.target.value })} /></div>
        <div className="col-sm-6"><label className="form-label" htmlFor="sf-domain">Domain</label><input id="sf-domain" className="form-control" placeholder="mybrand.ae" value={d.domain} onChange={(e) => set({ domain: e.target.value })} /></div>
        <div className="col-12">
          <label className="form-label">Market</label>
          <div className="chip-row">{TARGET_REGIONS.map((r) => <button key={r.code} type="button" className={`chip ${d.region === r.code ? 'active' : ''}`} onClick={() => changeRegion(r.code)}>{r.flag} {r.short}</button>)}</div>
          {region && <div className="form-text">{region.currency} · {region.taxLabel} · {region.compliance.join(' · ')}</div>}
        </div>
        <div className="col-12">
          <label className="form-label">Theme</label>
          <div className="row g-2">{THEMES.map((t) => <div key={t.value} className="col-6 col-md-3"><button type="button" className={`choice-card w-100 text-start ${d.theme === t.value ? 'selected' : ''}`} onClick={() => set({ theme: t.value })}><div className="fw-medium">{t.label}</div><div className="text-muted fs-xs">{t.hint}</div></button></div>)}</div>
        </div>
        <div className="col-sm-4"><label className="form-label" htmlFor="sf-color">Brand colour</label><input id="sf-color" type="color" className="form-control form-control-color w-100" value={d.brandColor} onChange={(e) => set({ brandColor: e.target.value })} /></div>
        <div className="col-sm-8">
          <label className="form-label">Languages</label>
          <div className="d-flex gap-3 pt-1">{[['en', 'English'], ['ar', 'العربية (RTL)']].map(([code, label]) => <label key={code} className="form-check"><input type="checkbox" className="form-check-input" checked={d.languages.includes(code)} onChange={() => set({ languages: toggle(d.languages, code) })} /><span className="form-check-label">{label}</span></label>)}</div>
        </div>
        <div className="col-12">
          <label className="form-label">Checkout</label>
          <div className="chip-row">{(CHECKOUT_BY_REGION[d.region] ?? ['Card']).map((m) => <button key={m} type="button" className={`chip ${d.checkout.includes(m) ? 'active' : ''}`} onClick={() => set({ checkout: toggle(d.checkout, m) })}>{d.checkout.includes(m) && <i className="ri-check-line" />}{m}</button>)}</div>
        </div>
        <div className="col-12"><label className="form-check form-switch"><input type="checkbox" className="form-check-input" checked={d.taxInclusive} onChange={(e) => set({ taxInclusive: e.target.checked })} /><span className="form-check-label">Show prices including {region?.taxLabel ?? 'tax'}</span></label></div>
      </div>
    </Drawer>
  )
}

/** Small rendering of the store's home page, so merchants see theme, language and payments at a glance. */
function StorePreview({ store, compact = false }: { store: Pick<Storefront, 'name' | 'domain' | 'theme' | 'brandColor' | 'languages' | 'checkout' | 'currency'>; compact?: boolean }) {
  const rtl = store.languages[0] === 'ar'
  const items = compact ? 3 : 6
  return (
    <div className={`sf-preview theme-${store.theme}`} dir={rtl ? 'rtl' : 'ltr'} aria-label={`Preview of ${store.name}`}>
      <div className="sf-bar" dir="ltr"><i /><i /><i /><span className="sf-url">https://{store.domain || 'your-domain.com'}</span></div>
      <div className="sf-nav"><span style={{ color: store.brandColor }}>{store.name}</span><span className="fw-normal text-muted">{rtl ? 'المتجر · السلة' : 'Shop · Cart'}</span></div>
      <div className="sf-hero" style={{ background: `linear-gradient(120deg, ${store.brandColor}, ${store.brandColor}cc)` }}>
        <h5>{rtl ? 'وصل حديثاً' : 'New season arrivals'}</h5>
        <div style={{ opacity: 0.85 }}>{rtl ? 'توصيل مجاني للطلبات فوق ٢٠٠' : `Free delivery over ${store.currency} 200`}</div>
      </div>
      <div className="sf-grid">{Array.from({ length: items }, (_, i) => <div key={i} className="sf-item"><div className="img" /><div className="fw-medium">{rtl ? `منتج ${i + 1}` : `Product ${i + 1}`}</div><div className="text-muted">{store.currency} {(49 + i * 15).toFixed(2)}</div></div>)}</div>
      {!compact && <div className="sf-pay">{store.checkout.map((c) => <span key={c}>{c}</span>)}</div>}
    </div>
  )
}
