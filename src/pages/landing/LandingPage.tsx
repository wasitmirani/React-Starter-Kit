import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { BrandMark } from '@/components/common/BrandMark'
import { AppLogo } from '@/components/features/apps/AppLogo'
import { env } from '@/config/env.config'
import { APP_CATALOG } from '@/constants/apps.constants'
import { AUTOMATION_TEMPLATES } from '@/constants/automation.constants'
import { localPrice, PLANS, PRICING_CURRENCIES, YEARLY_DISCOUNT } from '@/constants/billing.constants'
import { TARGET_REGIONS } from '@/constants/regions.constants'
import { ROUTES } from '@/constants/routes.constants'
import { useAuth } from '@/hooks/useAuth'
import type { Currency } from '@/types/commerce.types'

const FEATURES = [
  { icon: 'ri-store-3-line', tone: 'primary', title: 'Every marketplace, one catalog', body: 'List once and sell on Amazon, eBay, Noon, Walmart, Trendyol, Salla and Shopify. Prices convert per market; stock stays in sync.' },
  { icon: 'ri-stack-line', tone: 'success', title: 'Inventory that never oversells', body: 'One stock ledger across warehouses, FBA/FBN and 3PLs, with reservations, safety stock and replenishment.' },
  { icon: 'ri-truck-line', tone: 'info', title: 'Ship with the right courier', body: 'Aramex, SMSA, Royal Mail, Australia Post, UPS and more. Rate-shop every order and print labels in bulk.' },
  { icon: 'ri-flashlight-line', tone: 'warning', title: 'Automation without code', body: 'Route orders, confirm COD on WhatsApp, protect marketplace SLAs and reprice across currencies with ready-made flows.' },
  { icon: 'ri-building-4-line', tone: 'orange', title: 'A real WMS built in', body: 'Receiving, putaway, pick waves, packing and dispatch with a mobile scanner app for your team or your 3PL.' },
  { icon: 'ri-line-chart-line', tone: 'pink', title: 'Profit by market', body: 'Revenue, fees and margin per marketplace and country in one dashboard, converted to your reporting currency.' },
]

const FAQ = [
  ['Which marketplaces and stores can I connect?', `Amazon (UAE, KSA, US, UK, Australia), eBay, Noon, Walmart, Etsy, TikTok Shop, Trendyol, Namshi, Catch, Kogan, OnBuy, Shopify, WooCommerce, Salla, Zid, BigCommerce, Magento and Wix, plus ${APP_CATALOG.filter((a) => a.kind === 'courier').length} couriers and payments, accounting and messaging apps.`],
  ['Do you support Arabic and RTL?', 'Yes. Storefronts, WhatsApp templates and invoices support Arabic with right-to-left layouts, and Saudi invoices follow ZATCA e-invoicing.'],
  ['How long does setup take?', 'Most merchants connect their first marketplace and courier in under 15 minutes. Products and stock import automatically from the connected channel or a CSV.'],
  ['Can I use my own courier rates?', 'Yes. Connect your own courier accounts to use your negotiated prices; the rate shopper compares them on every order.'],
  ['Is there a free trial?', 'Every paid plan starts with a 14-day free trial, no card required. You can also explore the full product in the live demo.'],
]

export function LandingPage() {
  const { status } = useAuth()
  const signedIn = status === 'authenticated'
  const [currency, setCurrency] = useState<Currency>('USD')
  const [yearly, setYearly] = useState(true)

  useEffect(() => {
    document.title = `${env.appName} · Sell on every marketplace from one place`
  }, [])

  const price = (usd: number) => {
    const monthly = yearly ? usd * (1 - YEARLY_DISCOUNT) : usd
    return new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(localPrice(Math.round(monthly), currency))
  }
  const popularApps = APP_CATALOG.filter((a) => a.popular)

  return (
    <div className="landing">
      <header className="lp-nav">
        <div className="lp-container">
          <Link to={ROUTES.LANDING}><BrandMark /></Link>
          <nav className="lp-links" aria-label="Product">
            <a href="#features">Features</a><a href="#integrations">Integrations</a><a href="#automation">Automation</a><a href="#pricing">Pricing</a><a href="#faq">FAQ</a>
          </nav>
          <div className="d-flex gap-2">
            {signedIn ? <Link to={ROUTES.DASHBOARD} className="btn btn-primary">Open dashboard</Link> : <><Link to={ROUTES.LOGIN} className="btn btn-light">Sign in</Link><Link to={ROUTES.REGISTER} className="btn btn-primary">Start free trial</Link></>}
          </div>
        </div>
      </header>

      <section className="lp-hero">
        <div className="lp-container">
          <span className="lp-pill"><span>{TARGET_REGIONS.map((r) => r.flag).join(' ')}</span> Built for the UAE, KSA, USA, UK and Australia</span>
          <h1>Sell on <span className="grad">every marketplace</span> and ship every order from one place</h1>
          <p className="lead">{env.appName} connects Amazon, eBay, Noon, Shopify, Salla and {APP_CATALOG.length - 5}+ more apps to one catalog, one stock pool and one warehouse floor, with automation that does the busywork.</p>
          <div className="d-flex flex-wrap justify-content-center gap-2">
            <Link to={signedIn ? ROUTES.DASHBOARD : ROUTES.REGISTER} className="btn btn-primary btn-lg px-4">{signedIn ? 'Go to dashboard' : 'Start 14-day free trial'}</Link>
            {!signedIn && <Link to={ROUTES.LOGIN} className="btn btn-light btn-lg px-4"><i className="ri-play-circle-line me-1" />Explore the live demo</Link>}
          </div>
          <p className="text-muted fs-sm mt-3">No card required · Cancel anytime · Arabic and English</p>
        </div>
      </section>

      <section className="lp-section pt-0" id="integrations">
        <div className="lp-container text-center">
          <div className="lp-eyebrow">Plug and play</div>
          <h2 className="lp-title">{APP_CATALOG.length} integrations, connected in minutes</h2>
          <p className="lp-sub mx-auto mb-4">Marketplaces, stores, couriers, payments, accounting and messaging. Install from the app marketplace; no developers needed.</p>
          <div className="lp-logos">{popularApps.map((a) => <span key={a.id} className="lp-logo-chip"><AppLogo appId={a.id} size="sm" />{a.name}</span>)}</div>
        </div>
      </section>

      <section className="lp-section alt">
        <div className="lp-container">
          <div className="text-center mb-5"><div className="lp-eyebrow">Local in every market</div><h2 className="lp-title">Five markets, one operation</h2></div>
          <div className="row g-3">
            {TARGET_REGIONS.map((r) => (
              <div key={r.code} className="col-6 col-md-4 col-lg">
                <div className="lp-card lp-market">
                  <div className="flag">{r.flag}</div>
                  <h6 className="mt-2 mb-1">{r.name}</h6>
                  <div className="text-muted fs-sm mb-2">{r.currency} · {r.taxLabel}</div>
                  <div className="fs-xs text-muted">{r.compliance.join(' · ')}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="lp-section" id="features">
        <div className="lp-container">
          <div className="text-center mb-5"><div className="lp-eyebrow">Everything in one platform</div><h2 className="lp-title">Replace five tools with one</h2><p className="lp-sub mx-auto">Order management, inventory, warehouse, shipping and marketplace listings that share the same data.</p></div>
          <div className="row g-4">
            {FEATURES.map((f) => (
              <div key={f.title} className="col-md-6 col-lg-4">
                <div className="lp-card"><span className={`icon-tile bg-${f.tone}-subtle text-${f.tone}`}><i className={f.icon} /></span><h5>{f.title}</h5><p className="text-muted mb-0">{f.body}</p></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="lp-section alt">
        <div className="lp-container">
          <div className="text-center mb-5"><div className="lp-eyebrow">Go live fast</div><h2 className="lp-title">Selling in three steps</h2></div>
          <div className="row g-4 text-center">
            {[['Connect your channels', 'Install Amazon, Noon, eBay or your store from the app marketplace. Orders and products import automatically.'], ['Connect couriers', 'Add Aramex, SMSA, Royal Mail or Australia Post. Rates, labels and tracking work immediately.'], ['Turn on automations', 'Pick templates for stock sync, courier selection and WhatsApp updates. Dry-run, then publish.']].map(([t, b], i) => (
              <div key={t} className="col-md-4"><div className="lp-step-num">{i + 1}</div><h5>{t}</h5><p className="text-muted mb-0">{b}</p></div>
            ))}
          </div>
        </div>
      </section>

      <section className="lp-section" id="automation">
        <div className="lp-container">
          <div className="row g-5 align-items-center">
            <div className="col-lg-5">
              <div className="lp-eyebrow">Automation flows</div>
              <h2 className="lp-title">Let the busywork run itself</h2>
              <p className="lp-sub">{AUTOMATION_TEMPLATES.length} ready-made flows for multi-channel sellers. Every flow is versioned, can be tested on recent orders before it goes live, and logs each run.</p>
              <Link to={signedIn ? ROUTES.AUTOMATION_TEMPLATES : ROUTES.REGISTER} className="btn btn-primary mt-2">Browse templates</Link>
            </div>
            <div className="col-lg-7">
              <div className="row g-3">
                {AUTOMATION_TEMPLATES.filter((t) => t.popular).slice(0, 6).map((t) => (
                  <div key={t.id} className="col-sm-6"><div className="lp-card p-3"><div className="d-flex gap-2 align-items-center mb-1"><i className={`${t.icon} text-primary fs-5`} /><strong>{t.name}</strong></div><div className="text-muted fs-sm">{t.impact}</div></div></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="lp-section alt" id="pricing">
        <div className="lp-container">
          <div className="text-center mb-4"><div className="lp-eyebrow">Pricing</div><h2 className="lp-title">Simple plans that grow with you</h2><p className="lp-sub mx-auto">Prices shown in your currency. Every paid plan includes a 14-day free trial.</p></div>
          <div className="d-flex flex-wrap justify-content-center gap-3 mb-5">
            <div className="chip-row" role="group" aria-label="Currency">{PRICING_CURRENCIES.map((c) => <button key={c} type="button" className={`chip ${currency === c ? 'active' : ''}`} onClick={() => setCurrency(c)}>{c}</button>)}</div>
            <div className="chip-row" role="group" aria-label="Billing period">
              <button type="button" className={`chip ${!yearly ? 'active' : ''}`} onClick={() => setYearly(false)}>Monthly</button>
              <button type="button" className={`chip ${yearly ? 'active' : ''}`} onClick={() => setYearly(true)}>Yearly <span className="chip-count">save {YEARLY_DISCOUNT * 100}%</span></button>
            </div>
          </div>
          <div className="row g-4">
            {PLANS.map((p) => {
              const featured = p.id === 'business'
              return (
                <div key={p.id} className="col-md-6 col-xl-3">
                  <div className={`lp-price ${featured ? 'featured' : ''}`}>
                    {featured && <span className="badge bg-primary position-absolute top-0 start-50 translate-middle">Most popular</span>}
                    <h5 className="mb-1">{p.name}</h5>
                    <p className="text-muted fs-sm" style={{ minHeight: 40 }}>{p.description}</p>
                    <div className="amount">{p.priceMonthly == null ? 'Custom' : price(p.priceMonthly)}</div>
                    <div className="text-muted fs-sm">{p.priceMonthly == null ? 'Talk to sales' : p.priceMonthly === 0 ? 'Free forever' : `per month${yearly ? ', billed yearly' : ''}`}</div>
                    <ul>{p.features.map((f) => <li key={f}><i className="ri-check-line" />{f}</li>)}</ul>
                    {p.priceMonthly == null
                      ? <a className="btn btn-light w-100" href={`mailto:sales@${env.appSlug}.com?subject=Enterprise%20plan`}>Contact sales</a>
                      : <Link to={ROUTES.REGISTER} className={`btn w-100 ${featured ? 'btn-primary' : 'btn-light'}`}>{p.priceMonthly === 0 ? 'Get started' : 'Start free trial'}</Link>}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="lp-section" id="faq">
        <div className="lp-container" style={{ maxWidth: 820 }}>
          <div className="text-center mb-4"><div className="lp-eyebrow">FAQ</div><h2 className="lp-title">Questions, answered</h2></div>
          {FAQ.map(([q, a]) => <details key={q}><summary>{q}</summary><p>{a}</p></details>)}
        </div>
      </section>

      <section className="lp-section pt-0">
        <div className="lp-container">
          <div className="lp-cta">
            <h2>Start selling in more markets this week</h2>
            <p className="mb-4" style={{ opacity: 0.9 }}>Connect your first marketplace and courier in under 15 minutes.</p>
            <div className="d-flex flex-wrap justify-content-center gap-2">
              <Link to={ROUTES.REGISTER} className="btn btn-light btn-lg px-4">Start free trial</Link>
              <Link to={ROUTES.LOGIN} className="btn btn-outline-light btn-lg px-4">See the demo</Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="lp-footer">
        <div className="lp-container d-flex flex-wrap justify-content-between gap-3">
          <span>© {new Date().getFullYear()} {env.appName}. All rights reserved.</span>
          <span className="d-flex gap-3"><a href="#pricing">Pricing</a><a href="#integrations">Integrations</a><Link to={ROUTES.LOGIN}>Sign in</Link></span>
        </div>
      </footer>
    </div>
  )
}
