import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { connectorsApi } from '@/api/endpoints/integrations.api'
import { growthAnalyticsApi } from '@/api/endpoints/marketplace.api'
import { FormAlert } from '@/components/common/FormAlert'
import { PageHeader } from '@/components/common/PageHeader'
import { Panel } from '@/components/common/Panel'
import { AppLogo, RegionFlags } from '@/components/features/apps/AppLogo'
import { ToneBadge } from '@/components/ui/StatusBadge'
import { APP_CATALOG, COURIER_PROFILES } from '@/constants/apps.constants'
import { regionOf, TARGET_REGIONS } from '@/constants/regions.constants'
import { ROUTES } from '@/constants/routes.constants'
import { useAction, useAll } from '@/hooks/queries/resource.queries'
import type { RateQuote } from '@/types/marketplace.types'
import { formatMoney } from '@/utils/formatters/currency.formatter'

const COURIERS = APP_CATALOG.filter((a) => a.kind === 'courier')

export function CourierDirectoryPage() {
  const connectors = useAll('connectors', connectorsApi.list)
  const connected = new Set((connectors.data?.data ?? []).filter((c) => c.kind === 'courier' && c.status !== 'disconnected').map((c) => c.provider))
  const [region, setRegion] = useState('')
  const [feature, setFeature] = useState('')
  const list = useMemo(() => COURIERS.filter((c) => (!region || c.regions.includes(region as never)) && (!feature || c.capabilities.includes(feature))), [region, feature])
  const features = ['COD', 'Rates', 'Labels', 'Pickups', 'Same day', 'Customs', 'Manifests']

  return (
    <>
      <PageHeader
        title="Couriers"
        description="Every carrier LinqWorks books with across the UAE, KSA, USA, UK and Australia. Compare rates, then connect your own account in a few minutes."
        actions={<><Link to={ROUTES.CARRIERS} className="btn btn-light">Carrier accounts</Link><Link to={`${ROUTES.APP_MARKETPLACE}?kind=courier`} className="btn btn-primary"><i className="ri-add-line me-1" />Connect courier</Link></>}
      />
      <div className="row g-4">
        <div className="col-xl-8">
          <div className="d-flex flex-column gap-2 mb-3">
            <div className="chip-row">
              <button type="button" className={`chip ${!region ? 'active' : ''}`} onClick={() => setRegion('')}>All markets</button>
              {TARGET_REGIONS.map((r) => <button key={r.code} type="button" className={`chip ${region === r.code ? 'active' : ''}`} onClick={() => setRegion(r.code)}>{r.flag} {r.short} <span className="chip-count">{COURIERS.filter((c) => c.regions.includes(r.code as never)).length}</span></button>)}
            </div>
            <div className="chip-row">
              {features.map((f) => <button key={f} type="button" className={`chip ${feature === f ? 'active' : ''}`} onClick={() => setFeature(feature === f ? '' : f)}>{f}</button>)}
            </div>
          </div>
          <div className="card">
            <div className="table-responsive">
              <table className="table align-middle mb-0">
                <thead><tr><th>Courier</th><th>Markets</th><th>Services</th><th>Capabilities</th><th /></tr></thead>
                <tbody>
                  {list.map((c) => {
                    const profile = COURIER_PROFILES.find((p) => p.appId === c.id)
                    return (
                      <tr key={c.id}>
                        <td><div className="d-flex align-items-center gap-2"><AppLogo appId={c.id} size="sm" /><div><div className="fw-medium">{c.name}</div><div className="text-muted fs-xs">{c.tagline}</div></div></div></td>
                        <td><RegionFlags regions={c.regions} /></td>
                        <td className="fs-sm">{profile ? <>{profile.service}<div className="text-muted fs-xs">{profile.transit}</div></> : '—'}</td>
                        <td><div className="d-flex flex-wrap gap-1">{c.capabilities.map((x) => <span key={x} className={`badge fw-normal ${x === 'COD' ? 'bg-warning-subtle text-warning' : 'bg-light text-body'}`}>{x}</span>)}</div></td>
                        <td className="text-end text-nowrap">{connected.has(c.id) ? <ToneBadge tone="success" icon="ri-check-line">Connected</ToneBadge> : <Link to={`${ROUTES.APP_MARKETPLACE}?kind=courier${region ? `&region=${region}` : ''}`} className="btn btn-sm btn-light">Connect</Link>}</td>
                      </tr>
                    )
                  })}
                  {!list.length && <tr><td colSpan={5} className="text-center text-muted py-4">No courier matches these filters.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div className="col-xl-4"><RateShopper /></div>
      </div>
    </>
  )
}

function RateShopper() {
  const [destination, setDestination] = useState('AE')
  const [weight, setWeight] = useState('1')
  const [cod, setCod] = useState(false)
  const [quotes, setQuotes] = useState<RateQuote[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const quote = useAction('rate-quotes', growthAnalyticsApi.rateQuote, { onSuccess: setQuotes })
  const run = () => {
    const kg = Number(weight)
    if (!(kg > 0 && kg <= 70)) return setError('Enter a weight between 0.1 and 70 kg.')
    setError(null)
    quote.mutate({ destination, weightKg: kg, cod })
  }
  const region = regionOf(destination)
  return (
    <Panel title="Rate shopper" icon="ri-scales-3-line" description="Compare indicative domestic rates; connected accounts use your negotiated prices.">
      <FormAlert message={error} onClose={() => setError(null)} />
      <div className="row g-2 mb-3">
        <div className="col-7"><label className="form-label" htmlFor="rs-dest">Market</label><select id="rs-dest" className="form-select" value={destination} onChange={(e) => { setDestination(e.target.value); setCod(false); setQuotes(null) }}>{TARGET_REGIONS.map((r) => <option key={r.code} value={r.code}>{r.flag} {r.name}</option>)}</select></div>
        <div className="col-5"><label className="form-label" htmlFor="rs-kg">Weight (kg)</label><input id="rs-kg" type="number" min="0.1" step="0.1" className="form-control" value={weight} onChange={(e) => setWeight(e.target.value)} /></div>
        {(destination === 'AE' || destination === 'SA') && <div className="col-12"><label className="form-check"><input type="checkbox" className="form-check-input" checked={cod} onChange={(e) => setCod(e.target.checked)} /><span className="form-check-label">Cash on delivery</span></label></div>}
      </div>
      <button type="button" className="btn btn-primary w-100 mb-3" disabled={quote.isPending} onClick={run}>{quote.isPending ? 'Comparing…' : 'Compare rates'}</button>
      {quotes && (quotes.length ? quotes.map((q, i) => (
        <div key={q.courierKey + q.service} className={`quote-row ${i === 0 ? 'best' : ''}`}>
          <AppLogo appId={q.courierKey} size="sm" />
          <div className="flex-1 min-w-0"><div className="fw-medium text-truncate">{q.courier} <span className="text-muted fw-normal">· {q.service}</span></div><div className="text-muted fs-xs">{q.transitDays}{q.tags.length ? ` · ${q.tags.join(' · ')}` : ''}</div></div>
          <div className="text-end"><div className="fw-semibold tabular-nums">{formatMoney(q.priceLocal, q.currency)}</div>{i === 0 && <div className="text-success fs-xs">Cheapest</div>}</div>
        </div>
      )) : <p className="text-muted mb-0">No courier in {region?.name} offers this service.</p>)}
      {quotes && quotes.length > 1 && <p className="text-muted fs-xs mt-3 mb-0">Turn on the <Link to={ROUTES.AUTOMATION_TEMPLATES}>"Book the cheapest courier"</Link> automation to do this on every order.</p>}
    </Panel>
  )
}
