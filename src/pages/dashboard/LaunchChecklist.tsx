import { Link } from 'react-router-dom'
import { connectorsApi, rulesApi } from '@/api/endpoints/integrations.api'
import { listingsApi, storefrontsApi } from '@/api/endpoints/marketplace.api'
import { Panel } from '@/components/common/Panel'
import { ROUTES } from '@/constants/routes.constants'
import { useAll } from '@/hooks/queries/resource.queries'
import { useCan } from '@/hooks/useCan'

const QUICK_ACTIONS = [
  { label: 'New order', icon: 'ri-add-circle-line', to: ROUTES.ORDER_NEW, permission: 'orders.create' },
  { label: 'Publish listings', icon: 'ri-upload-cloud-2-line', to: ROUTES.LISTINGS, permission: 'products.read' },
  { label: 'Connect an app', icon: 'ri-apps-2-add-line', to: ROUTES.APP_MARKETPLACE, permission: 'integrations.manage' },
  { label: 'Compare couriers', icon: 'ri-scales-3-line', to: ROUTES.COURIERS, permission: 'shipping.read' },
  { label: 'Pick waves', icon: 'ri-hand-coin-line', to: ROUTES.WAVES, permission: 'warehouse.read' },
  { label: 'Receive stock', icon: 'ri-inbox-archive-line', to: ROUTES.RECEIPTS, permission: 'warehouse.read' },
  { label: 'Storefronts', icon: 'ri-store-2-line', to: ROUTES.STOREFRONTS, permission: 'products.read' },
  { label: 'Automations', icon: 'ri-flashlight-line', to: ROUTES.AUTOMATION_TEMPLATES, permission: 'automation.manage' },
]

/** Setup progress (derived from real workspace data) next to one-click shortcuts. */
export function LaunchAndActions() {
  const can = useCan()
  const admin = can('integrations.manage')
  const actions = QUICK_ACTIONS.filter((a) => can(a.permission))
  return (
    <div className="row g-4 mb-4 fade-up">
      {admin && <div className="col-xl-5"><LaunchChecklist /></div>}
      <div className={admin ? 'col-xl-7' : 'col-12'}>
        <Panel title="Quick actions" icon="ri-flashlight-line" className="h-100 mb-0">
          <div className="row g-2">
            {actions.map((a) => (
              <div key={a.label} className="col-6 col-md-3">
                <Link to={a.to} className="quick-action"><i className={a.icon} />{a.label}</Link>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  )
}

function LaunchChecklist() {
  const connectors = useAll('connectors', connectorsApi.list).data?.data ?? []
  const listings = useAll('listings', listingsApi.list).data?.data ?? []
  const stores = useAll('storefronts', storefrontsApi.list).data?.data ?? []
  const rules = useAll('rules', rulesApi.list).data?.data ?? []
  const markets = new Set(connectors.filter((c) => c.kind === 'marketplace' && c.status === 'connected' && c.region && c.region !== 'PK').map((c) => c.region))

  const steps = [
    { title: 'Connect a marketplace', hint: 'Amazon, eBay, Noon, Walmart…', done: connectors.some((c) => c.kind === 'marketplace' && c.status === 'connected'), to: `${ROUTES.APP_MARKETPLACE}?kind=marketplace` },
    { title: 'Connect a courier', hint: 'Aramex, SMSA, Royal Mail, Australia Post…', done: connectors.some((c) => c.kind === 'courier' && c.status === 'connected'), to: `${ROUTES.APP_MARKETPLACE}?kind=courier` },
    { title: 'Publish your first listings', hint: 'Push products to a marketplace', done: listings.some((l) => l.status === 'live'), to: ROUTES.LISTINGS },
    { title: 'Launch a storefront', hint: 'Your own branded store per market', done: stores.some((s) => s.status === 'published'), to: ROUTES.STOREFRONTS },
    { title: 'Turn on an automation', hint: 'Stock sync, courier selection, WhatsApp', done: rules.some((r) => r.status === 'active'), to: ROUTES.AUTOMATION_TEMPLATES },
    { title: 'Sell in 3 or more markets', hint: `${markets.size} of 5 launch markets live`, done: markets.size >= 3, to: ROUTES.DASH_GLOBAL_SALES },
  ]
  const done = steps.filter((s) => s.done).length
  const pct = Math.round((done / steps.length) * 100)

  return (
    <Panel title="Launch checklist" icon="ri-rocket-2-line" className="h-100 mb-0" actions={<div className="progress-ring" style={{ ['--p' as string]: pct }}><span>{pct}%</span></div>}>
      {steps.map((s) => (
        <Link key={s.title} to={s.to} className={`launch-step text-reset ${s.done ? 'done' : ''}`}>
          <span className="tick"><i className="ri-check-line" /></span>
          <span className="flex-1 min-w-0"><span className="launch-title d-block fw-medium">{s.title}</span><span className="text-muted fs-xs">{s.hint}</span></span>
          {!s.done && <i className="ri-arrow-right-s-line text-muted" />}
        </Link>
      ))}
    </Panel>
  )
}
