import { env } from '@/config/env.config'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { billingApi } from '@/api/endpoints/platform.api'
import { tenantsApi } from '@/api/endpoints/tenants.api'
import { usersApi } from '@/api/endpoints/users.api'
import { errorMessage } from '@/api/errors'
import { resetMockData } from '@/api/mock/collection'
import { PageHeader } from '@/components/common/PageHeader'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { FormField } from '@/components/common/FormField'
import { Loader } from '@/components/common/Loader'
import { CopyButton } from '@/components/common/Misc'
import { SettingsCard } from '@/components/common/SettingsCard'
import { planBadge, planName, WorkspaceAllowanceCard } from '@/components/features/workspace/MyWorkspaces'
import { ScopeGuide } from '@/components/features/workspace/ScopeGuide'
import { AppearanceEditor, type AppearancePatch, type AppearanceValue } from '@/components/features/account/AppearanceEditor'
import { CreateWorkspaceModal } from '@/components/features/workspace/CreateWorkspaceModal'
import { ROUTES } from '@/constants/routes.constants'
import { useTenantQuery } from '@/hooks/queries/resource.queries'
import { queryKeys, useMyWorkspaces, useTenant, useTenantId, useTenantSettings } from '@/hooks/queries/workspace.queries'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import { useAuthStore } from '@/store/auth.store'
import { DEFAULT_BRAND, brandName } from '@/utils/helpers/brand'
import { workspaceSettingsSchema, type WorkspaceSettingsSchema } from '@/lib/validation/schemas'
import type { UsageItem } from '@/types/platform.types'

const LOCALES: [string, string][] = [['en', 'English'], ['en-GB', 'English (UK)'], ['de', 'Deutsch'], ['fr', 'Français'], ['es', 'Español'], ['pt-BR', 'Português (Brasil)'], ['ar', 'العربية'], ['ur', 'اردو']]

const fmt = (n: number) => n.toLocaleString(undefined, { maximumFractionDigits: 0 })

function GeneralForm() {
  const tenantId = useTenantId()
  const { can, refreshProfile } = useAuth()
  const canEdit = can('tenant.update')
  const toast = useToast()
  const queryClient = useQueryClient()
  const tenant = useTenant()
  const settings = useTenantSettings()
  const timezones = useMemo(() => Intl.supportedValuesOf('timeZone'), [])

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<WorkspaceSettingsSchema>({ resolver: zodResolver(workspaceSettingsSchema) })

  useEffect(() => {
    if (tenant.data && settings.data) {
      reset({ name: tenant.data.name, timezone: settings.data.timezone, locale: settings.data.locale })
    }
  }, [tenant.data, settings.data, reset])

  const onSubmit = handleSubmit(async ({ name, timezone, locale }) => {
    try {
      if (name !== tenant.data?.name) {
        await tenantsApi.update(tenantId, { name })
        await refreshProfile()
      }
      await tenantsApi.updateSettings(tenantId, { timezone, locale })
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.tenant(tenantId) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.settings(tenantId) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.myWorkspaces }),
      ])
      toast.success('Workspace settings saved')
    } catch (err) {
      toast.error(errorMessage(err))
    }
  })

  if (tenant.isLoading || settings.isLoading) return <Loader />
  if (tenant.isError || settings.isError) return <div className="alert alert-danger mb-0">{errorMessage(tenant.error ?? settings.error)}</div>

  return (
    <form onSubmit={onSubmit} noValidate>
      {!canEdit && <div className="alert alert-light border fs-sm mb-5"><i className="ri-lock-line me-1" />Only owners and admins can change these settings.</div>}
      <fieldset disabled={!canEdit} className="row g-6">
        <FormField id="ws-name" label="Workspace name" error={errors.name?.message} className="col-md-6" required>
          <input id="ws-name" className={`form-control${errors.name ? ' is-invalid' : ''}`} {...register('name')} />
        </FormField>
        <FormField id="ws-slug" label="Workspace ID" className="col-md-6" hint="Used in API calls and support requests.">
          <div className="input-group">
            <input id="ws-slug" className="form-control font-monospace" value={tenant.data?.slug ?? ''} readOnly />
            <CopyButton value={tenant.data?.slug ?? ''} label="" className="btn btn-light border" />
          </div>
        </FormField>
        <FormField id="ws-timezone" label="Time zone" error={errors.timezone?.message} className="col-md-6" hint="Used for scheduled campaigns, send windows and reports.">
          <select id="ws-timezone" className="form-select" {...register('timezone')}>
            <option value="UTC">UTC</option>
            {timezones.map((tz) => <option key={tz} value={tz}>{tz}</option>)}
          </select>
        </FormField>
        <FormField id="ws-locale" label="Default language" error={errors.locale?.message} className="col-md-6" hint="Used for new templates, dates and number formats.">
          <select id="ws-locale" className="form-select" {...register('locale')}>
            {LOCALES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            {settings.data?.locale && !LOCALES.some(([v]) => v === settings.data!.locale) && <option value={settings.data.locale}>{settings.data.locale}</option>}
          </select>
        </FormField>
        {canEdit && (
          <div className="col-12 d-flex justify-content-end">
            <button type="submit" className="btn btn-primary" disabled={isSubmitting || !isDirty}>
              {isSubmitting ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        )}
      </fieldset>
    </form>
  )
}

/** Plan, role, members and age of this workspace in one strip. */
function Overview() {
  const tenantId = useTenantId()
  const { currentMembership } = useAuth()
  const tenant = useTenant()
  const mine = useMyWorkspaces()
  const subscription = useTenantQuery('billing', 'subscription', billingApi.subscription)
  const me = mine.data?.workspaces.find((w) => w.id === tenantId)
  const plan = me?.plan ?? subscription.data?.planId ?? 'free'
  const items = [
    { icon: 'ri-vip-diamond-line', label: 'Plan', value: <span className={planBadge(plan)}>{planName(plan)}</span>, to: ROUTES.SETTINGS_BILLING },
    { icon: 'ri-user-star-line', label: 'Your role', value: currentMembership?.role.name ?? '–', to: ROUTES.SETTINGS_ROLES },
    { icon: 'ri-team-line', label: 'Members', value: me ? fmt(me.members) : '–', to: ROUTES.SETTINGS_TEAM },
    { icon: 'ri-vip-crown-2-line', label: 'Owner', value: me?.isOwner ? 'You' : (me?.ownerName ?? '–'), to: null },
    { icon: 'ri-calendar-line', label: 'Created', value: tenant.data ? new Date(tenant.data.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : '–', to: null },
  ]
  return (
    <div className="card ws-overview">
      <div className="card-body">
        <div className="d-flex flex-wrap align-items-center gap-4 mb-5">
          <span className="ws-mark lg" aria-hidden="true">{(tenant.data?.name ?? '?').slice(0, 1).toUpperCase()}</span>
          <div className="flex-1 min-w-0">
            <h5 className="mb-0 text-truncate">{tenant.data?.name ?? 'Workspace'}</h5>
            <div className="text-muted fs-sm">Everything here is shared by the people in this workspace.</div>
          </div>
          {tenant.data?.status === 'suspended' && <span className="badge bg-danger-subtle text-danger">Suspended</span>}
        </div>
        <div className="ws-overview-grid">
          {items.map((it) => {
            const body = (
              <>
                <i className={it.icon} aria-hidden="true" />
                <span className="ws-overview-label">{it.label}</span>
                <span className="ws-overview-value">{it.value}</span>
              </>
            )
            return it.to ? <Link key={it.label} to={it.to} className="ws-overview-item is-link">{body}</Link> : <div key={it.label} className="ws-overview-item">{body}</div>
          })}
        </div>
      </div>
    </div>
  )
}

function UsageRow({ item }: { item: UsageItem }) {
  const pct = item.included ? Math.min(100, Math.round((item.used / item.included) * 100)) : null
  const tone = pct == null ? 'info' : pct >= 100 ? 'danger' : pct >= 80 ? 'warning' : 'primary'
  return (
    <div className="ws-usage-row">
      <div className="d-flex justify-content-between align-items-baseline gap-2 mb-1">
        <span className="fw-medium fs-sm">{item.label}</span>
        <span className="tabular-nums fs-sm text-muted">
          {fmt(item.used)} {item.included != null ? <>/ {fmt(item.included)}</> : <span className="fs-xs">pay as you go</span>}
        </span>
      </div>
      <div className="progress" style={{ height: 6 }}>
        <div className={`progress-bar bg-${tone}`} style={{ width: `${pct ?? 100}%`, opacity: pct == null ? 0.35 : 1 }} />
      </div>
    </div>
  )
}

function PlanUsage() {
  const subscription = useTenantQuery('billing', 'subscription', billingApi.subscription)
  if (subscription.isLoading) return <Loader size="sm" />
  if (subscription.isError) return <div className="alert alert-danger mb-0">{errorMessage(subscription.error)}</div>
  const s = subscription.data!
  return (
    <>
      <div className="d-flex flex-wrap align-items-center gap-2 mb-4">
        <span className={planBadge(s.planId)}>{planName(s.planId)}</span>
        <span className="text-muted fs-sm">
          {s.cycle === 'yearly' ? 'Yearly' : 'Monthly'} · {s.status === 'active' ? `renews ${new Date(s.renewsAt).toLocaleDateString()}` : s.status.replace('_', ' ')}
        </span>
      </div>
      <div className="d-flex flex-column gap-4">
        {s.usage.map((u) => <UsageRow key={u.key} item={u} />)}
      </div>
    </>
  )
}

/**
 * Your own choice (My profile) wins over the workspace default, so changing the default
 * here shows no change for you. Says so, and offers to drop your own choice.
 */
function OwnAppearanceNotice() {
  const { user } = useAuth()
  const setUser = useAuthStore((s) => s.setUser)
  const toast = useToast()
  const [busy, setBusy] = useState(false)
  const mine = user?.preferences ?? {}
  const parts = [mine.brandTheme && `the ${brandName(mine.brandTheme)} colour`, mine.colorMode && `${mine.colorMode} mode`].filter(Boolean)
  if (!user || !parts.length) return null
  const useDefault = async () => {
    setBusy(true)
    try {
      const { data } = await usersApi.updateMe({ preferences: { brandTheme: null, colorMode: null } })
      setUser(data.data)
      toast.success('You now see the workspace default')
    } catch (err) {
      toast.error(errorMessage(err))
    } finally {
      setBusy(false)
    }
  }
  return (
    <div className="alert alert-warning d-flex flex-wrap align-items-center gap-2 fs-sm mb-4" role="status">
      <i className="ri-information-line" />
      <span className="flex-grow-1">You picked {parts.join(' and ')} under My profile, so changes here won’t look different to you. Other members without their own choice will see them.</span>
      <button type="button" className="btn btn-sm btn-outline-secondary" onClick={useDefault} disabled={busy}>Use the workspace default</button>
    </div>
  )
}

/** The workspace default appearance: what members see unless they chose their own. */
function DefaultAppearance() {
  const tenantId = useTenantId()
  const { can } = useAuth()
  const canEdit = can('tenant.update')
  const toast = useToast()
  const queryClient = useQueryClient()
  const settings = useTenantSettings()
  if (settings.isLoading) return <Loader size="sm" />
  const value = (settings.data?.settings?.appearance ?? {}) as AppearanceValue
  const save = async (patch: AppearancePatch) => {
    try {
      await tenantsApi.updateSettings(tenantId, { appearance: patch })
      await queryClient.invalidateQueries({ queryKey: queryKeys.settings(tenantId) })
      toast.success('Default appearance saved for this workspace')
    } catch (err) {
      toast.error(errorMessage(err))
    }
  }
  return (
    <>
      {!canEdit && <div className="alert alert-light border fs-sm mb-4"><i className="ri-lock-line me-1" />Only owners and admins can change the default.</div>}
      <OwnAppearanceNotice />
      <AppearanceEditor value={value} onChange={save} disabled={!canEdit} inherited={{ label: 'App default', brandTheme: DEFAULT_BRAND, colorMode: null }} />
    </>
  )
}

function DangerZone() {
  const tenantId = useTenantId()
  const { currentMembership, memberships, refreshProfile, switchTenant } = useAuth()
  const toast = useToast()
  const [confirm, setConfirm] = useState(false)
  const [busy, setBusy] = useState(false)
  const isOwner = currentMembership?.role.key === 'owner'

  const leave = async () => {
    setBusy(true)
    try {
      await tenantsApi.leave(tenantId)
      const next = memberships.find((m) => m.tenant.id !== tenantId)
      await refreshProfile()
      if (next) switchTenant(next.tenant.id)
      toast.success(`You left ${currentMembership?.tenant.name ?? 'the workspace'}`)
    } catch (err) {
      toast.error(errorMessage(err))
    } finally {
      setBusy(false)
      setConfirm(false)
    }
  }

  return (
    <>
      <div className="d-flex flex-wrap align-items-center gap-3">
        <div className="flex-1">
          <div className="fw-medium">Leave this workspace</div>
          <div className="text-muted fs-sm">
            {isOwner
              ? 'Owners can leave once another owner is in place. Make someone else an owner under Team first.'
              : 'You lose access right away. An admin can invite you again.'}
          </div>
        </div>
        <button type="button" className="btn btn-light text-danger" onClick={() => setConfirm(true)}>
          <i className="ri-logout-box-r-line" />Leave workspace
        </button>
      </div>
      <ConfirmDialog
        open={confirm}
        title={`Leave ${currentMembership?.tenant.name ?? 'this workspace'}?`}
        message="You will lose access to its contacts, campaigns and inbox. This can’t be undone without a new invitation."
        confirmLabel="Leave workspace"
        danger
        busy={busy}
        onClose={() => setConfirm(false)}
        onConfirm={leave}
      />
    </>
  )
}

export function WorkspaceSettingsPage() {
  const mine = useMyWorkspaces()
  const queryClient = useQueryClient()
  const [creating, setCreating] = useState(false)

  return (
    <>
      <PageHeader title="Workspace" description="Details, plan usage and settings shared by everyone in this workspace." />
      <Overview />
      <div className="row g-6">
        <div className="col-xl-7 d-flex flex-column gap-6">
          <SettingsCard title="General" icon="ri-settings-4-line" description="Name, ID, time zone and language.">
            <GeneralForm />
          </SettingsCard>
          <SettingsCard
            title="Plan and usage"
            icon="ri-bar-chart-box-line"
            description="This billing period. Limits belong to the workspace, not to you."
            action={<Link to={ROUTES.SETTINGS_BILLING} className="btn btn-sm btn-light text-nowrap">Billing</Link>}
          >
            <PlanUsage />
          </SettingsCard>
          <SettingsCard title="Default appearance" icon="ri-palette-line" description="Colour theme and light or dark mode for everyone here. People who picked their own under My profile keep theirs.">
            <DefaultAppearance />
          </SettingsCard>
          <SettingsCard title="Danger zone" icon="ri-error-warning-line" className="settings-card-danger">
            <DangerZone />
          </SettingsCard>
        </div>
        <div className="col-xl-5 d-flex flex-column gap-6">
          <SettingsCard title="Who controls what" icon="ri-information-line" description="Personal settings follow you; workspace settings are shared by the team.">
            <ScopeGuide maxFree={mine.data?.allowance.maxFree ?? 1} />
          </SettingsCard>
          <SettingsCard
            title="Creating workspaces"
            icon="ri-add-box-line"
            description="A personal allowance: it counts the workspaces you own, across all of them."
            action={<Link to={ROUTES.SETTINGS_PROFILE} className="btn btn-sm btn-light text-nowrap">My workspaces</Link>}
          >
            {mine.isLoading ? <Loader size="sm" /> : mine.isError ? <div className="alert alert-danger mb-0">{errorMessage(mine.error)}</div> : <WorkspaceAllowanceCard allowance={mine.data!.allowance} onCreate={() => setCreating(true)} />}
          </SettingsCard>
          {env.useMocks && (
            <SettingsCard title="Demo data" icon="ri-database-2-line" description="CRM, campaigns, inbox and channel data come from the in-browser demo API until their backend is live.">
              <button type="button" className="btn btn-light" onClick={resetMockData}>
                <i className="ri-refresh-line me-1" />Reset demo data
              </button>
            </SettingsCard>
          )}
        </div>
      </div>
      <CreateWorkspaceModal
        open={creating}
        onClose={() => {
          setCreating(false)
          void queryClient.invalidateQueries({ queryKey: queryKeys.myWorkspaces })
        }}
      />
    </>
  )
}
