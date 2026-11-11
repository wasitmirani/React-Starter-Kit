import { useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { connectorsApi } from '@/api/endpoints/integrations.api'
import { appsApi, templatesApi } from '@/api/endpoints/marketplace.api'
import { errorMessage } from '@/api/errors'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { FormAlert } from '@/components/common/FormAlert'
import { QueryError } from '@/components/common/Misc'
import { AppLogo, RegionFlags } from '@/components/features/apps/AppLogo'
import { Drawer } from '@/components/ui/Drawer'
import { EmptyState, SkeletonLines } from '@/components/ui/EmptyState'
import { StatusBadge, ToneBadge } from '@/components/ui/StatusBadge'
import { Tabs } from '@/components/ui/Tabs'
import { APP_CATALOG, APP_KINDS, type AppDefinition } from '@/constants/apps.constants'
import { AUTOMATION_TEMPLATES } from '@/constants/automation.constants'
import { regionLabel, regionOf, TARGET_REGIONS } from '@/constants/regions.constants'
import { ROUTES } from '@/constants/routes.constants'
import { useAction, useAll } from '@/hooks/queries/resource.queries'
import type { Connector, ConnectorKind } from '@/types/integration.types'
import { formatRelativeTime } from '@/utils/formatters/date.formatter'

type View = 'discover' | 'installed'

export function AppMarketplacePage() {
  const [params, setParams] = useSearchParams()
  const view = (params.get('view') as View) || 'discover'
  const region = params.get('region') ?? ''
  const kind = (params.get('kind') as ConnectorKind | null) ?? null
  const [search, setSearch] = useState('')
  const [installing, setInstalling] = useState<AppDefinition | null>(null)
  const [removing, setRemoving] = useState<Connector | null>(null)
  const connectors = useAll('connectors', connectorsApi.list)
  const installed = connectors.data?.data ?? []
  const uninstall = useAction('connectors', appsApi.uninstall, { success: 'App uninstalled', onSuccess: () => setRemoving(null) })
  const sync = useAction('connectors', connectorsApi.sync, { invalidates: ['sync-jobs', 'orders'], success: (j) => `Sync ${j.status}: ${j.processed} records` })

  const set = (patch: Record<string, string | null>) => {
    const next = new URLSearchParams(params)
    Object.entries(patch).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)))
    setParams(next, { replace: true })
  }

  const installCount = (appId: string) => installed.filter((c) => c.provider === appId).length
  const apps = useMemo(() => {
    const q = search.trim().toLowerCase()
    return APP_CATALOG.filter((a) => (!region || a.regions.includes(region as never)) && (!kind || a.kind === kind) && (!q || `${a.name} ${a.tagline} ${a.vendor} ${a.capabilities.join(' ')}`.toLowerCase().includes(q)))
  }, [search, region, kind])
  const byKind = (k: ConnectorKind) => APP_CATALOG.filter((a) => a.kind === k && (!region || a.regions.includes(region as never))).length
  const featured = apps.filter((a) => a.popular).slice(0, 4)

  return (
    <>
      <div className="growth-hero">
        <div className="d-flex flex-wrap justify-content-between gap-4 align-items-end">
          <div>
            <ToneBadge tone="light" icon="ri-plug-2-line" className="mb-3">Plug and play</ToneBadge>
            <h3 className="mb-2">App marketplace</h3>
            <p className="mb-3">Connect Amazon, eBay, Noon, Shopify, Salla, couriers, payments and accounting in minutes. One catalog and one stock pool for the UAE, KSA, USA, UK and Australia.</p>
            <div className="position-relative" style={{ maxWidth: 440 }}>
              <i className="ri-search-line position-absolute top-50 translate-middle-y text-muted" style={{ insetInlineStart: 14 }} />
              <input className="form-control form-control-lg ps-5" placeholder="Search apps: Amazon, SMSA, Tabby, Xero…" value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search apps" />
            </div>
          </div>
          <div className="d-flex flex-wrap gap-2">
            <div className="hero-stat"><strong>{APP_CATALOG.length}</strong><span>apps available</span></div>
            <div className="hero-stat"><strong>{TARGET_REGIONS.length}</strong><span>launch markets</span></div>
            <div className="hero-stat"><strong>{installed.length}</strong><span>connected accounts</span></div>
          </div>
        </div>
      </div>

      <Tabs className="mb-4" value={view} onChange={(v) => set({ view: v === 'discover' ? null : v })} items={[{ value: 'discover', label: 'Discover', icon: 'ri-compass-3-line' }, { value: 'installed', label: 'Installed', icon: 'ri-checkbox-circle-line', count: installed.length }]} />

      {view === 'installed' ? (
        <InstalledApps connectors={installed} loading={connectors.isLoading} error={connectors.isError ? errorMessage(connectors.error) : null} onRetry={() => connectors.refetch()} onSync={(id) => sync.mutate(id)} syncing={sync.isPending} onRemove={setRemoving} onBrowse={() => set({ view: null })} />
      ) : (
        <>
          <div className="d-flex flex-column gap-3 mb-4">
            <div className="chip-row" role="group" aria-label="Market">
              <button type="button" className={`chip ${!region ? 'active' : ''}`} onClick={() => set({ region: null })}><i className="ri-global-line" /> All markets</button>
              {TARGET_REGIONS.map((r) => <button key={r.code} type="button" className={`chip ${region === r.code ? 'active' : ''}`} onClick={() => set({ region: r.code })}>{r.flag} {r.short}</button>)}
            </div>
            <div className="chip-row" role="group" aria-label="Category">
              <button type="button" className={`chip ${!kind ? 'active' : ''}`} onClick={() => set({ kind: null })}>All categories</button>
              {APP_KINDS.map((k) => <button key={k.value} type="button" className={`chip ${kind === k.value ? 'active' : ''}`} onClick={() => set({ kind: k.value })}><i className={k.icon} />{k.label}<span className="chip-count">{byKind(k.value)}</span></button>)}
            </div>
          </div>

          {!search && !kind && featured.length > 0 && (
            <section className="mb-5">
              <h6 className="text-muted text-uppercase fs-sm mb-3">{region ? `Most installed in ${regionOf(region)?.name}` : 'Most installed'}</h6>
              <div className="row g-3">
                {featured.map((a) => (
                  <div key={a.id} className="col-sm-6 col-xxl-3">
                    <button type="button" className="card app-card h-100 mb-0 w-100 text-start" onClick={() => setInstalling(a)}>
                      <div className="card-body d-flex gap-3 align-items-center">
                        <AppLogo appId={a.id} size="lg" />
                        <div className="min-w-0"><div className="fw-semibold text-truncate">{a.name}</div><div className="text-muted fs-sm text-truncate">{a.tagline}</div></div>
                      </div>
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}

          {APP_KINDS.filter((k) => !kind || k.value === kind).map((k) => {
            const list = apps.filter((a) => a.kind === k.value)
            if (!list.length) return null
            return (
              <section key={k.value} className="mb-5">
                <div className="d-flex align-items-baseline gap-2 mb-3"><h5 className="mb-0">{k.label}</h5><span className="text-muted fs-sm">{k.description}</span></div>
                <div className="row g-3">
                  {list.map((a) => <AppCard key={a.id} app={a} installs={installCount(a.id)} onInstall={() => setInstalling(a)} />)}
                </div>
              </section>
            )
          })}
          {!apps.length && <EmptyState icon="ri-search-eye-line" title="No apps match" description="Try another market or search term. Missing an integration? LinqWorks Direct API and webhooks connect anything else." action={<Link className="btn btn-primary" to={ROUTES.DIRECT_API}>Open Direct API</Link>} />}
        </>
      )}

      <InstallDrawer app={installing} defaultRegion={region} onClose={() => setInstalling(null)} />
      <ConfirmDialog open={removing !== null} title={`Uninstall ${removing?.name ?? ''}?`} message="Order import, stock publishing and tracking stop for this account. Orders and listings already in LinqWorks are kept." confirmLabel="Uninstall" danger busy={uninstall.isPending} onConfirm={() => removing && uninstall.mutate(removing.id)} onClose={() => setRemoving(null)} />
    </>
  )
}

function AppCard({ app, installs, onInstall }: { app: AppDefinition; installs: number; onInstall: () => void }) {
  return (
    <div className="col-md-6 col-xl-4 col-xxl-3">
      <div className="card app-card h-100 mb-0">
        <div className="card-body">
          <div className="d-flex align-items-start gap-3 mb-3">
            <AppLogo appId={app.id} />
            <div className="flex-1 min-w-0">
              <h6 className="mb-0 text-truncate">{app.name}</h6>
              <div className="text-muted fs-xs text-truncate">{app.vendor}</div>
            </div>
            {app.isNew ? <span className="badge bg-info-subtle text-info app-ribbon">New</span> : app.popular ? <span className="badge bg-warning-subtle text-warning app-ribbon">Popular</span> : null}
          </div>
          <p className="text-muted fs-sm app-desc mb-3">{app.description}</p>
          <div className="d-flex flex-wrap gap-1 mb-3">{app.capabilities.slice(0, 3).map((c) => <span key={c} className="badge bg-light text-body fw-normal">{c}</span>)}{app.capabilities.length > 3 && <span className="badge bg-light text-muted fw-normal">+{app.capabilities.length - 3}</span>}</div>
          <div className="d-flex justify-content-between align-items-center fs-sm">
            <RegionFlags regions={app.regions} />
            <span className="text-muted"><i className="ri-time-line" /> {app.setupMinutes} min setup</span>
          </div>
        </div>
        <div className="card-footer d-flex align-items-center gap-2">
          {installs > 0 ? <ToneBadge tone="success" icon="ri-check-line">{installs} connected</ToneBadge> : <span className="text-muted fs-xs text-capitalize">{app.plan} plan</span>}
          <button type="button" className={`btn btn-sm ms-auto ${installs ? 'btn-light' : 'btn-primary'}`} onClick={onInstall}>{installs ? 'Add account' : 'Install'}</button>
        </div>
      </div>
    </div>
  )
}

function InstalledApps({ connectors, loading, error, onRetry, onSync, syncing, onRemove, onBrowse }: { connectors: Connector[]; loading: boolean; error: string | null; onRetry: () => void; onSync: (id: string) => void; syncing: boolean; onRemove: (c: Connector) => void; onBrowse: () => void }) {
  if (error) return <QueryError message={error} onRetry={onRetry} />
  if (loading) return <div className="card card-body"><SkeletonLines lines={6} /></div>
  if (!connectors.length) return <EmptyState icon="ri-plug-line" title="No apps installed yet" description="Install a marketplace or store to start importing orders." action={<button type="button" className="btn btn-primary" onClick={onBrowse}>Browse apps</button>} />
  return (
    <div className="card">
      <div className="table-responsive">
        <table className="table align-middle mb-0">
          <thead><tr><th>App</th><th>Market</th><th>Account</th><th>Status</th><th>Last sync</th><th className="text-end">Errors 24h</th><th /></tr></thead>
          <tbody>
            {connectors.map((c) => (
              <tr key={c.id}>
                <td><div className="d-flex align-items-center gap-2"><AppLogo appId={c.provider} size="sm" /><div className="min-w-0"><div className="fw-medium text-truncate">{c.name}</div><div className="text-muted fs-xs">{APP_KINDS.find((k) => k.value === c.kind)?.label ?? c.kind}</div></div></div></td>
                <td>{regionLabel(c.region)}</td>
                <td className="font-monospace fs-sm">{c.account ?? '—'}</td>
                <td><StatusBadge status={c.status} /> {c.mode === 'sandbox' && <StatusBadge status="sandbox" />}</td>
                <td className="text-muted fs-sm">{c.lastSyncAt ? formatRelativeTime(c.lastSyncAt) : 'Never'}</td>
                <td className={`text-end tabular-nums ${c.errors24h ? 'text-danger fw-medium' : ''}`}>{c.errors24h}</td>
                <td className="text-end text-nowrap">
                  <button type="button" className="btn btn-sm btn-light me-1" disabled={syncing || c.status === 'disconnected'} onClick={() => onSync(c.id)}><i className="ri-refresh-line" /> Sync</button>
                  <button type="button" className="btn btn-sm btn-light text-danger" onClick={() => onRemove(c)} aria-label={`Uninstall ${c.name}`}><i className="ri-delete-bin-line" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/** Three-step install: market → credentials → automations. */
function InstallDrawer({ app, defaultRegion, onClose }: { app: AppDefinition | null; defaultRegion: string; onClose: () => void }) {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [region, setRegion] = useState<string | null>(null)
  const [account, setAccount] = useState('')
  const [secret, setSecret] = useState('')
  const [mode, setMode] = useState<Connector['mode']>('live')
  const [recipes, setRecipes] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [authorized, setAuthorized] = useState(false)
  const [done, setDone] = useState<Connector | null>(null)
  const install = useAction('connectors', appsApi.install, { invalidates: ['sync-jobs', 'rules'], quietErrors: true })
  const addTemplate = useAction('rules', templatesApi.use)

  const reset = () => {
    setStep(0); setRegion(null); setAccount(''); setSecret(''); setMode('live'); setRecipes([]); setError(null); setAuthorized(false); setDone(null)
  }
  const close = () => { reset(); onClose() }
  if (!app) return null
  const chosenRegion = region ?? (app.regions.includes(defaultRegion as never) ? defaultRegion : app.regions.length === 1 ? app.regions[0] : null)
  const suggested = AUTOMATION_TEMPLATES.filter((t) => app.recipes?.includes(t.id))

  const next = () => {
    setError(null)
    if (step === 0 && !chosenRegion) return setError('Choose the market for this account.')
    if (step === 1) {
      if (app.auth === 'oauth' && !authorized) return setError(`Authorize LinqWorks in ${app.name} to continue.`)
      if (account.trim().length < 3) return setError(`Enter the ${app.accountLabel}.`)
      if (app.auth === 'api_key' && secret.trim().length < 8) return setError('Enter the API key or secret (at least 8 characters).')
    }
    setStep(step + 1)
  }
  const finish = async () => {
    setError(null)
    try {
      const c = await install.mutateAsync({ appId: app.id, region: chosenRegion, account: account.trim(), mode })
      for (const id of recipes) await addTemplate.mutateAsync(id)
      setDone(c)
    } catch (e) {
      setError(errorMessage(e))
    }
  }

  return (
    <Drawer
      open
      onClose={close}
      size="lg"
      title={<span className="d-flex align-items-center gap-2"><AppLogo appId={app.id} size="sm" />{done ? `${app.name} connected` : `Install ${app.name}`}</span>}
      subtitle={done ? undefined : `${app.vendor} · about ${app.setupMinutes} minutes`}
      footer={
        done ? (
          <>
            <button type="button" className="btn btn-light" onClick={close}>Close</button>
            {(app.kind === 'marketplace') && <button type="button" className="btn btn-primary" onClick={() => { close(); navigate(ROUTES.LISTINGS) }}>Publish listings</button>}
            {app.kind !== 'marketplace' && <button type="button" className="btn btn-primary" onClick={() => { close(); navigate(ROUTES.SYNC_JOBS) }}>View first sync</button>}
          </>
        ) : (
          <>
            {step > 0 && <button type="button" className="btn btn-light" onClick={() => setStep(step - 1)}>Back</button>}
            {step < 2 ? <button type="button" className="btn btn-primary ms-auto" onClick={next}>Continue</button> : <button type="button" className="btn btn-primary ms-auto" disabled={install.isPending} onClick={finish}>{install.isPending ? 'Connecting…' : 'Install and start sync'}</button>}
          </>
        )
      }
    >
      {done ? (
        <div className="text-center py-4">
          <span className="icon-tile icon-tile-lg bg-success-subtle text-success mb-3"><i className="ri-check-double-line" /></span>
          <h5>{done.name} is live</h5>
          <p className="text-muted">The first sync has started. Orders appear under Orders as they import; stock is published after the first inventory sync.</p>
          {recipes.length > 0 && <p className="text-muted">{recipes.length} automation{recipes.length > 1 ? 's were' : ' was'} added as drafts. <Link to={ROUTES.AUTOMATION_RULES} onClick={close}>Review and publish them</Link>.</p>}
        </div>
      ) : (
        <>
          <div className="wizard-steps" aria-hidden="true">{[0, 1, 2].map((i) => <span key={i} className={`step ${i <= step ? 'done' : ''}`} />)}</div>
          <FormAlert message={error} onClose={() => setError(null)} />
          {step === 0 && (
            <>
              <p className="text-muted">{app.description}</p>
              <h6 className="mt-4 mb-3">Which market is this account for?</h6>
              <div className="row g-2">
                {app.regions.map((code) => {
                  const r = regionOf(code)!
                  return (
                    <div key={code} className="col-sm-6">
                      <button type="button" className={`choice-card w-100 text-start ${chosenRegion === code ? 'selected' : ''}`} onClick={() => setRegion(code)} aria-pressed={chosenRegion === code}>
                        <div className="d-flex align-items-center gap-2"><span className="fs-4">{r.flag}</span><div><div className="fw-medium">{r.name}</div><div className="text-muted fs-xs">{r.currency} · {r.taxLabel}</div></div></div>
                      </button>
                    </div>
                  )
                })}
              </div>
              <h6 className="mt-4 mb-2">What it does</h6>
              <div className="d-flex flex-wrap gap-1">{app.capabilities.map((c) => <span key={c} className="badge bg-primary-subtle text-primary fw-normal"><i className="ri-check-line" /> {c}</span>)}</div>
            </>
          )}
          {step === 1 && (
            <>
              {app.auth === 'oauth' ? (
                <div className="border rounded-3 p-3 mb-4 d-flex align-items-center gap-3">
                  <AppLogo appId={app.id} />
                  <div className="flex-1"><div className="fw-medium">Sign in with {app.name}</div><div className="text-muted fs-sm">You approve read/write access on {app.name}; LinqWorks never sees your password.</div></div>
                  {authorized ? <ToneBadge tone="success" icon="ri-shield-check-line">Authorized</ToneBadge> : <button type="button" className="btn btn-dark btn-sm" onClick={() => setAuthorized(true)}>Authorize</button>}
                </div>
              ) : (
                <div className="mb-3">
                  <label className="form-label" htmlFor="app-secret">API key / secret</label>
                  <input id="app-secret" type="password" className="form-control" autoComplete="off" placeholder="••••••••••••" value={secret} onChange={(e) => setSecret(e.target.value)} />
                  <div className="form-text">Stored encrypted. Find it in {app.vendor} under developer or API settings.</div>
                </div>
              )}
              <div className="mb-3">
                <label className="form-label" htmlFor="app-account">{app.accountLabel}</label>
                <input id="app-account" className="form-control" value={account} onChange={(e) => setAccount(e.target.value)} placeholder={app.accountLabel} />
              </div>
              <label className="form-label">Mode</label>
              <div className="row g-2">
                {(['live', 'sandbox'] as const).map((m) => (
                  <div key={m} className="col-6">
                    <button type="button" className={`choice-card w-100 text-start ${mode === m ? 'selected' : ''}`} onClick={() => setMode(m)} aria-pressed={mode === m}>
                      <div className="fw-medium text-capitalize">{m}</div><div className="text-muted fs-xs">{m === 'live' ? 'Real orders and stock' : 'Test with the provider sandbox first'}</div>
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
          {step === 2 && (
            <>
              <div className="border rounded-3 p-3 mb-4">
                <div className="d-flex justify-content-between fs-sm py-1"><span className="text-muted">Market</span><strong>{regionLabel(chosenRegion)}</strong></div>
                <div className="d-flex justify-content-between fs-sm py-1"><span className="text-muted">{app.accountLabel}</span><strong className="font-monospace">{account}</strong></div>
                <div className="d-flex justify-content-between fs-sm py-1"><span className="text-muted">Mode</span><strong className="text-capitalize">{mode}</strong></div>
              </div>
              <h6 className="mb-1">Turn on automations</h6>
              <p className="text-muted fs-sm">Added as drafts, so nothing runs until you publish them.</p>
              {suggested.length ? suggested.map((t) => (
                <label key={t.id} className={`choice-card mb-2 d-flex gap-3 align-items-start ${recipes.includes(t.id) ? 'selected' : ''}`}>
                  <input type="checkbox" className="form-check-input mt-1" checked={recipes.includes(t.id)} onChange={(e) => setRecipes(e.target.checked ? [...recipes, t.id] : recipes.filter((x) => x !== t.id))} />
                  <span><span className="fw-medium d-block"><i className={`${t.icon} me-1`} />{t.name}</span><span className="text-muted fs-sm">{t.summary}</span></span>
                </label>
              )) : <p className="text-muted fs-sm">Browse <Link to={ROUTES.AUTOMATION_TEMPLATES} onClick={close}>automation templates</Link> after install.</p>}
            </>
          )}
          {step === 0 && <p className="text-muted fs-xs mt-4 mb-0">Once installed, manage the account under <Link to={ROUTES.CONNECTORS} onClick={close}>Integrations → Connectors</Link>.</p>}
        </>
      )}
    </Drawer>
  )
}
