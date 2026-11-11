import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { authApi } from '@/api/endpoints/auth.api'
import { usersApi } from '@/api/endpoints/users.api'
import { errorMessage, toApiError } from '@/api/errors'
import { PageHeader } from '@/components/common/PageHeader'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { FormField } from '@/components/common/FormField'
import { Loader } from '@/components/common/Loader'
import { SettingsCard } from '@/components/common/SettingsCard'
import { Avatar } from '@/components/ui/Avatar'
import { MyWorkspacesList } from '@/components/features/workspace/MyWorkspaces'
import { ScopeGuide } from '@/components/features/workspace/ScopeGuide'
import { ROUTES } from '@/constants/routes.constants'
import { queryKeys, useMyWorkspaces, useSessions, useTenantSettings } from '@/hooks/queries/workspace.queries'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import { useAuthStore } from '@/store/auth.store'
import { resolveAppearance } from '@/utils/helpers/brand'
import { AppearanceEditor, type AppearancePatch } from '@/components/features/account/AppearanceEditor'
import {
  changePasswordSchema,
  profileSchema,
  type ChangePasswordSchema,
  type ProfileSchema,
} from '@/lib/validation/schemas'
import { formatRelativeTime } from '@/utils/formatters/date.formatter'

function ProfileForm() {
  const { user } = useAuth()
  const setUser = useAuthStore((s) => s.setUser)
  const toast = useToast()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ProfileSchema>({ resolver: zodResolver(profileSchema) })

  useEffect(() => {
    if (user) reset({ name: user.name })
  }, [user, reset])

  const onSubmit = handleSubmit(async (values) => {
    try {
      const { data } = await usersApi.updateMe(values)
      setUser(data.data)
      toast.success('Profile updated')
    } catch (err) {
      toast.error(errorMessage(err))
    }
  })

  return (
    <form onSubmit={onSubmit} noValidate className="row g-5">
      <FormField id="profile-name" label="Full name" error={errors.name?.message} className="col-md-6">
        <input id="profile-name" className={`form-control${errors.name ? ' is-invalid' : ''}`} autoComplete="name" {...register('name')} />
      </FormField>
      <FormField
        id="profile-email"
        label="Email"
        className="col-md-6"
        hint={user?.emailVerified ? 'Verified. Used to sign in and for account notices.' : 'Not verified yet: check your inbox.'}
      >
        <input id="profile-email" className="form-control" value={user?.email ?? ''} readOnly disabled />
      </FormField>
      <div className="col-12 d-flex justify-content-end">
        <button type="submit" className="btn btn-primary" disabled={isSubmitting || !isDirty}>
          {isSubmitting ? 'Saving…' : 'Save details'}
        </button>
      </div>
    </form>
  )
}

const STRENGTH = [
  { label: 'Too short', tone: 'danger' },
  { label: 'Weak', tone: 'danger' },
  { label: 'Fair', tone: 'warning' },
  { label: 'Good', tone: 'info' },
  { label: 'Strong', tone: 'success' },
] as const

function strength(pw: string) {
  if (pw.length < 8) return 0
  let score = 1
  if (pw.length >= 12) score++
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++
  if (/\d/.test(pw) && /[^A-Za-z0-9]/.test(pw)) score++
  return Math.min(score, 4)
}

/** Live hint while typing a new password. */
function PasswordStrength({ value }: { value: string }) {
  if (!value) return <div className="form-text">At least 8 characters. Longer, with mixed case, numbers and symbols, is stronger.</div>
  const score = strength(value)
  const s = STRENGTH[score]
  return (
    <div className="pw-strength mt-2" aria-live="polite">
      <div className="pw-strength-bars" aria-hidden="true">
        {[1, 2, 3, 4].map((i) => <span key={i} className={i <= score ? `bg-${s.tone}` : undefined} />)}
      </div>
      <span className={`fs-xs fw-medium text-${s.tone}`}>{s.label}</span>
    </div>
  )
}

function ChangePasswordForm() {
  const toast = useToast()
  const queryClient = useQueryClient()
  const {
    register,
    handleSubmit,
    reset,
    setError,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordSchema>({ resolver: zodResolver(changePasswordSchema) })

  const onSubmit = handleSubmit(async ({ currentPassword, newPassword }) => {
    try {
      await authApi.changePassword(currentPassword, newPassword)
      reset({ currentPassword: '', newPassword: '', confirmPassword: '' })
      await queryClient.invalidateQueries({ queryKey: queryKeys.sessions })
      toast.success('Password changed. Your other devices were signed out.')
    } catch (err) {
      const apiError = toApiError(err)
      if (apiError.code === 'INVALID_PASSWORD') setError('currentPassword', { message: apiError.message })
      else toast.error(apiError.message)
    }
  })

  const cls = (name: keyof ChangePasswordSchema) => `form-control${errors[name] ? ' is-invalid' : ''}`

  return (
    <form onSubmit={onSubmit} noValidate className="row g-5">
      <FormField id="pw-current" label="Current password" error={errors.currentPassword?.message} className="col-md-4">
        <input id="pw-current" type="password" autoComplete="current-password" className={cls('currentPassword')} {...register('currentPassword')} />
      </FormField>
      <FormField id="pw-new" label="New password" error={errors.newPassword?.message} className="col-md-4">
        <input id="pw-new" type="password" autoComplete="new-password" className={cls('newPassword')} {...register('newPassword')} />
        <PasswordStrength value={watch('newPassword') ?? ''} />
      </FormField>
      <FormField id="pw-confirm" label="Confirm new password" error={errors.confirmPassword?.message} className="col-md-4">
        <input id="pw-confirm" type="password" autoComplete="new-password" className={cls('confirmPassword')} {...register('confirmPassword')} />
      </FormField>
      <div className="col-12 d-flex justify-content-end">
        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
          {isSubmitting ? 'Changing…' : 'Change password'}
        </button>
      </div>
    </form>
  )
}

/** "Chrome on Windows" from a user agent, with a matching icon. */
function describeDevice(ua: string | null) {
  if (!ua) return { name: 'Unknown device', icon: 'ri-device-line' }
  const browser = /Edg\//.test(ua)
    ? 'Edge'
    : /OPR\//.test(ua)
      ? 'Opera'
      : /Firefox\//.test(ua)
        ? 'Firefox'
        : /Chrome\//.test(ua)
          ? 'Chrome'
          : /Safari\//.test(ua)
            ? 'Safari'
            : /curl|Postman|node|axios|okhttp/i.test(ua)
              ? 'API client'
              : 'Browser'
  const os = /Windows/.test(ua) ? 'Windows' : /iPhone|iPad/.test(ua) ? 'iOS' : /Mac OS X/.test(ua) ? 'macOS' : /Android/.test(ua) ? 'Android' : /Linux/.test(ua) ? 'Linux' : null
  const mobile = /Mobile|iPhone|Android/.test(ua)
  return {
    name: os ? `${browser} on ${os}` : browser,
    icon: mobile ? 'ri-smartphone-line' : browser === 'API client' ? 'ri-terminal-box-line' : 'ri-computer-line',
  }
}

function SessionsList() {
  const sessions = useSessions()
  const queryClient = useQueryClient()
  const toast = useToast()
  const [revokingId, setRevokingId] = useState<string | null>(null)
  const [confirmAll, setConfirmAll] = useState(false)
  const others = sessions.data?.filter((s) => !s.current) ?? []

  const revoke = useMutation({
    mutationFn: (id: string) => authApi.revokeSession(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.sessions })
      toast.success('Device signed out')
      setRevokingId(null)
    },
    onError: (err) => toast.error(errorMessage(err)),
  })
  const revokeOthers = useMutation({
    mutationFn: async () => {
      for (const s of others) await authApi.revokeSession(s.id)
      return others.length
    },
    onSuccess: async (n) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.sessions })
      toast.success(`Signed out ${n} other device${n === 1 ? '' : 's'}`)
      setConfirmAll(false)
    },
    onError: (err) => toast.error(errorMessage(err)),
  })

  if (sessions.isLoading) return <Loader size="sm" />
  if (sessions.isError) return <div className="alert alert-danger">{errorMessage(sessions.error)}</div>

  return (
    <>
      <ul className="device-list">
        {sessions.data?.map((s) => {
          const d = describeDevice(s.userAgent)
          return (
            <li key={s.id}>
              <span className="device-icon" aria-hidden="true"><i className={d.icon} /></span>
              <div className="flex-1 min-w-0">
                <div className="fw-medium text-truncate" title={s.userAgent ?? undefined}>{d.name}</div>
                <div className="text-muted fs-xs">{s.ip ?? 'Unknown IP'} · active {formatRelativeTime(s.lastUsedAt)}</div>
              </div>
              {s.current ? (
                <span className="badge bg-success-subtle text-success text-nowrap">This device</span>
              ) : (
                <button type="button" className="btn btn-sm btn-light text-danger" onClick={() => setRevokingId(s.id)}>Sign out</button>
              )}
            </li>
          )
        })}
      </ul>
      {others.length > 0 && (
        <div className="d-flex justify-content-end mt-4">
          <button type="button" className="btn btn-sm btn-light text-danger" onClick={() => setConfirmAll(true)}>
            <i className="ri-logout-box-r-line" />Sign out all other devices
          </button>
        </div>
      )}
      <ConfirmDialog
        open={revokingId !== null}
        title="Sign out device"
        message="That device will need to sign in again."
        confirmLabel="Sign out"
        danger
        busy={revoke.isPending}
        onClose={() => setRevokingId(null)}
        onConfirm={() => revoke.mutate(revokingId!)}
      />
      <ConfirmDialog
        open={confirmAll}
        title="Sign out all other devices?"
        message={`${others.length} other device${others.length === 1 ? '' : 's'} will need to sign in again. This device stays signed in.`}
        confirmLabel="Sign out others"
        danger
        busy={revokeOthers.isPending}
        onClose={() => setConfirmAll(false)}
        onConfirm={() => revokeOthers.mutate()}
      />
    </>
  )
}

/** Your appearance, saved to your account; unset parts follow the workspace default. */
function MyAppearance() {
  const { user, currentMembership } = useAuth()
  const setUser = useAuthStore((st) => st.setUser)
  const toast = useToast()
  const settings = useTenantSettings()
  const workspace = currentMembership ? (settings.data?.settings?.appearance as { brandTheme?: string; colorMode?: 'light' | 'dark' } | undefined) : undefined
  const inherited = resolveAppearance(null, workspace)
  const save = async (patch: AppearancePatch) => {
    if (!user) return
    const before = user
    // Optimistic: apply now, roll back if the save fails.
    setUser({ ...user, preferences: { ...Object.fromEntries(Object.entries({ ...(user.preferences ?? {}), ...patch }).filter(([, v]) => v != null)) } })
    try {
      const { data } = await usersApi.updateMe({ preferences: patch })
      setUser(data.data)
    } catch (err) {
      setUser(before)
      toast.error(errorMessage(err))
    }
  }
  return (
    <AppearanceEditor
      value={user?.preferences ?? {}}
      onChange={save}
      inherited={{ label: currentMembership ? 'Workspace default' : 'App default', brandTheme: inherited.brand, colorMode: inherited.colorMode }}
    />
  )
}

/** Who you are at a glance: identity, account age, security and workspaces. */
function ProfileHero() {
  const { user, currentMembership } = useAuth()
  const workspaces = useMyWorkspaces()
  const sessions = useSessions()
  if (!user) return null
  const owned = workspaces.data?.workspaces.filter((w) => w.isOwner).length
  const stats = [
    { icon: 'ri-building-2-line', label: 'Workspaces', value: workspaces.data?.workspaces.length ?? '–' },
    { icon: 'ri-vip-crown-2-line', label: 'You own', value: owned ?? '–' },
    { icon: 'ri-computer-line', label: 'Devices', value: sessions.data?.length ?? '–' },
  ]
  return (
    <div className="card profile-hero">
      <div className="card-body">
        <div className="d-flex flex-wrap align-items-center gap-5">
          <Avatar name={user.name} src={user.avatarUrl} size={76} className="profile-hero-avatar" />
          <div className="flex-1 min-w-0">
            <div className="d-flex flex-wrap align-items-center gap-2">
              <h4 className="mb-0 text-truncate">{user.name}</h4>
              {user.isPlatformAdmin && <span className="badge bg-primary-subtle text-primary"><i className="ri-shield-star-line me-1" />Platform admin</span>}
              {currentMembership && <span className="badge bg-light text-body border">{currentMembership.role.name} in {currentMembership.tenant.name}</span>}
            </div>
            <div className="text-muted mt-1 d-flex flex-wrap align-items-center gap-2">
              <span className="text-truncate">{user.email}</span>
              {user.emailVerified ? (
                <span className="badge bg-success-subtle text-success"><i className="ri-verified-badge-line me-1" />Verified</span>
              ) : (
                <span className="badge bg-warning-subtle text-warning-emphasis"><i className="ri-mail-unread-line me-1" />Not verified</span>
              )}
            </div>
            <div className="profile-hero-meta">
              <span><i className="ri-calendar-line" />Member since {new Date(user.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</span>
              {user.lastLoginAt && <span><i className="ri-login-circle-line" />Last sign-in {formatRelativeTime(user.lastLoginAt)}</span>}
              <span className={user.mfaEnabled ? 'text-success' : undefined}>
                <i className={user.mfaEnabled ? 'ri-shield-check-line' : 'ri-shield-line'} />Two-step verification {user.mfaEnabled ? 'on' : 'off'}
              </span>
            </div>
          </div>
          <div className="profile-hero-stats">
            {stats.map((st) => (
              <div key={st.label}>
                <i className={st.icon} aria-hidden="true" />
                <strong className="tabular-nums">{st.value}</strong>
                <span>{st.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export function ProfilePage() {
  return (
    <>
      <PageHeader title="My profile" description="Your account follows you into every workspace you belong to." />
      <ProfileHero />
      <div className="row g-6">
        <div className="col-xl-7 d-flex flex-column gap-6">
          <SettingsCard title="Personal details" icon="ri-user-3-line" description="Shown to teammates in every workspace: on assignments, notes and the audit log.">
            <ProfileForm />
          </SettingsCard>
          <SettingsCard title="Password" icon="ri-lock-password-line" description="Changing it signs out your other devices.">
            <ChangePasswordForm />
          </SettingsCard>
          <SettingsCard title="Signed-in devices" icon="ri-device-line" description="Sign out anything you don’t recognise.">
            <SessionsList />
          </SettingsCard>
        </div>
        <div className="col-xl-5 d-flex flex-column gap-6">
          <SettingsCard
            title="My workspaces"
            icon="ri-building-2-line"
            description="Where you’re a member, your role there, and how many more you can create."
            action={<Link to={ROUTES.SETTINGS_WORKSPACE} className="btn btn-sm btn-light text-nowrap">Workspace settings</Link>}
          >
            <MyWorkspacesList />
          </SettingsCard>
          <SettingsCard title="Appearance" icon="ri-palette-line" description="Saved to your account, so it follows you to every device. Leave a part on “Workspace default” to use what your workspace admins chose. The moon icon in the top bar also saves here.">
            <MyAppearance />
          </SettingsCard>
          <SettingsCard title="What’s yours, what’s the workspace’s" icon="ri-information-line">
            <ScopeGuide />
          </SettingsCard>
        </div>
      </div>
    </>
  )
}
