import { useEffect, useState } from 'react'
import { preferencesApi } from '@/api/endpoints/platform.api'
import { FormField } from '@/components/common/FormField'
import { Guard } from '@/components/common/Guard'
import { Loader } from '@/components/common/Loader'
import { PageHeader } from '@/components/common/PageHeader'
import { SettingsCard } from '@/components/common/SettingsCard'
import { OptionCard, Switch } from '@/components/ui/Controls'
import { OPTIONS } from '@/constants/domain.constants'
import { useAction, useTenantQuery } from '@/hooks/queries/resource.queries'
import { useCan } from '@/hooks/useCan'
import type { TenantPreferences } from '@/types/platform.types'

/** Currency, tax, units and fulfillment policies for the workspace (plan §4.2, §10). */
export function OperationsSettingsPage() {
  const can = useCan()
  const prefs = useTenantQuery('preferences', 'operations', preferencesApi.get)
  const [draft, setDraft] = useState<TenantPreferences | null>(null)
  const save = useAction('preferences', preferencesApi.save, { success: 'Operations settings saved' })

  useEffect(() => {
    if (prefs.data) setDraft(prefs.data)
  }, [prefs.data])

  if (!draft) return <Loader label="Loading settings…" />
  const set = (patch: Partial<TenantPreferences>) => setDraft({ ...draft, ...patch })
  const readOnly = !can('tenant.update')

  return (
    <>
      <PageHeader title="Tax, currency & operations" description="Defaults applied to new orders, purchase orders and reports. Historical documents keep the values they were created with." actions={<Guard permission="tenant.update"><button type="button" className="btn btn-primary" disabled={save.isPending} onClick={() => save.mutate(draft)}>Save changes</button></Guard>} />
      <fieldset disabled={readOnly} className="d-flex flex-column gap-4">
        <SettingsCard title="Operating mode" icon="ri-building-4-line" description="Merchant OMS, 3PL WMS, or both on one workspace.">
          <div className="row g-3">
            {([['merchant', 'Merchant', 'Your own products, channels and warehouses', 'ri-store-2-line'], ['threepl', '3PL', 'Store and fulfil for client merchants', 'ri-team-line'], ['both', 'Both', 'Own stock plus 3PL clients', 'ri-stack-line']] as const).map(([value, title, description, icon]) => (
              <div key={value} className="col-md-4"><OptionCard selected={draft.operatingMode === value} onSelect={() => set({ operatingMode: value })} title={title} description={description} icon={icon} disabled={readOnly} /></div>
            ))}
          </div>
        </SettingsCard>

        <SettingsCard title="Currency and locale" icon="ri-money-dollar-circle-line" description="Amounts are stored with their currency; reports convert to the base currency.">
          <div className="row g-4">
            <FormField id="base" label="Base currency" className="col-md-4"><select id="base" className="form-select" value={draft.baseCurrency} onChange={(e) => set({ baseCurrency: e.target.value })}>{OPTIONS.currency.map((o) => <option key={o.value}>{o.value}</option>)}</select></FormField>
            <FormField id="tz" label="Reporting timezone" className="col-md-4"><select id="tz" className="form-select" value={draft.timezone} onChange={(e) => set({ timezone: e.target.value })}>{['Asia/Karachi', 'Asia/Dubai', 'UTC'].map((t) => <option key={t}>{t}</option>)}</select></FormField>
            <FormField id="prefix" label="Order number prefix" className="col-md-4"><input id="prefix" className="form-control" value={draft.orderPrefix} maxLength={6} onChange={(e) => set({ orderPrefix: e.target.value.toUpperCase() })} /></FormField>
            <div className="col-12">
              <label className="form-label">Enabled currencies</label>
              <div className="d-flex flex-wrap gap-4">
                {OPTIONS.currency.map((o) => <Switch key={o.value} id={`cur-${o.value}`} label={o.value} checked={draft.enabledCurrencies.includes(o.value)} disabled={readOnly || o.value === draft.baseCurrency} onChange={(v) => set({ enabledCurrencies: v ? [...draft.enabledCurrencies, o.value] : draft.enabledCurrencies.filter((c) => c !== o.value) })} />)}
              </div>
            </div>
            <FormField id="wu" label="Weight unit" className="col-md-3"><select id="wu" className="form-select" value={draft.weightUnit} onChange={(e) => set({ weightUnit: e.target.value as TenantPreferences['weightUnit'] })}><option value="kg">kg</option><option value="lb">lb</option></select></FormField>
            <FormField id="du" label="Dimension unit" className="col-md-3"><select id="du" className="form-select" value={draft.dimensionUnit} onChange={(e) => set({ dimensionUnit: e.target.value as TenantPreferences['dimensionUnit'] })}><option value="cm">cm</option><option value="in">in</option></select></FormField>
          </div>
        </SettingsCard>

        <SettingsCard title="Taxes" icon="ri-percent-line" description="Pakistan GST and UAE VAT defaults. Confirm fiscal invoicing rules with your tax advisor before going live." action={<button type="button" className="btn btn-sm btn-light" onClick={() => set({ taxes: [...draft.taxes, { country: 'PK', name: '', rate: 0, inclusive: false }] })}><i className="ri-add-line" /> Add</button>}>
          <table className="table align-middle mb-0">
            <thead><tr className="text-muted fs-sm"><th>Country</th><th>Name</th><th style={{ width: 120 }}>Rate %</th><th>Prices include tax</th><th /></tr></thead>
            <tbody>
              {draft.taxes.map((t, i) => {
                const upd = (patch: Partial<(typeof draft.taxes)[number]>) => set({ taxes: draft.taxes.map((x, j) => (j === i ? { ...x, ...patch } : x)) })
                return (
                  <tr key={i}>
                    <td><select className="form-select form-select-sm" aria-label="Country" value={t.country} onChange={(e) => upd({ country: e.target.value })}><option value="PK">Pakistan</option><option value="AE">UAE</option><option value="SA">Saudi Arabia</option></select></td>
                    <td><input className="form-control form-control-sm" aria-label="Tax name" value={t.name} onChange={(e) => upd({ name: e.target.value })} /></td>
                    <td><input type="number" min={0} max={50} step={0.01} className="form-control form-control-sm" aria-label="Rate" value={t.rate} onChange={(e) => upd({ rate: Number(e.target.value) })} /></td>
                    <td><Switch id={`incl-${i}`} checked={t.inclusive} onChange={(v) => upd({ inclusive: v })} disabled={readOnly} /></td>
                    <td className="text-end"><button type="button" className="btn btn-sm btn-light btn-icon" aria-label="Remove tax" onClick={() => set({ taxes: draft.taxes.filter((_, j) => j !== i) })}><i className="ri-delete-bin-line" /></button></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </SettingsCard>

        <SettingsCard title="Allocation and backorders" icon="ri-route-line" description="How orders are assigned to warehouses when no automation rule decides.">
          <div className="row g-4">
            <FormField id="alloc" label="Allocation strategy" className="col-md-6"><select id="alloc" className="form-select" value={draft.allocationStrategy} onChange={(e) => set({ allocationStrategy: e.target.value as TenantPreferences['allocationStrategy'] })}><option value="nearest">Nearest warehouse with full stock</option><option value="fifo">FIFO (oldest stock first)</option><option value="fefo">FEFO (earliest expiry first)</option><option value="priority">Warehouse priority order</option></select></FormField>
            <FormField id="bo" label="When stock is short" className="col-md-6"><select id="bo" className="form-select" value={draft.backorderPolicy} onChange={(e) => set({ backorderPolicy: e.target.value as TenantPreferences['backorderPolicy'] })}><option value="hold">Allocate what is available and hold the rest</option><option value="allow">Allow backorders</option><option value="reject">Do not allocate partially</option></select></FormField>
          </div>
        </SettingsCard>
      </fieldset>
    </>
  )
}
