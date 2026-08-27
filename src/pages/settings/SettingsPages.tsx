import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import BreadCrumb from '@/components/common/BreadCrumb'
import { useOrganizationStore } from '@/store/organization.store'
import { useAuth } from '@/hooks/useAuth'
import { settingsService } from '@/services/settings.service'
import { ROUTES } from '@/constants/routes.constants'
import { env } from '@/config/env.config'

export function SettingsNotificationsPage() {
  const queryClient = useQueryClient()
  const { data } = useQuery({
    queryKey: ['settings', 'notifications'],
    queryFn: () => settingsService.getNotifications(),
  })
  const [email, setEmail] = useState(true)
  const [sms, setSms] = useState(false)
  const [calls, setCalls] = useState(true)
  const [whatsapp, setWhatsapp] = useState(false)

  useEffect(() => {
    if (data?.data) {
      setEmail(data.data.email)
      setSms(data.data.sms)
      setCalls(data.data.liveCalls)
      setWhatsapp(data.data.whatsapp ?? false)
    }
  }, [data])

  const save = useMutation({
    mutationFn: () =>
      settingsService.saveNotifications({
        email,
        sms,
        liveCalls: calls,
        whatsapp,
      }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['settings', 'notifications'] }),
  })

  return (
    <>
      <BreadCrumb
        activePage="Notification Settings"
        breadcrumbs={[{ label: 'Settings', href: ROUTES.SETTINGS }]}
      />
      <div className="box">
        <div className="box-body space-y-3">
          {[
            { label: 'Email alerts', value: email, set: setEmail },
            { label: 'SMS alerts', value: sms, set: setSms },
            { label: 'Live call notifications', value: calls, set: setCalls },
            { label: 'WhatsApp calling alerts', value: whatsapp, set: setWhatsapp },
          ].map((row) => (
            <label key={row.label} className="flex items-center justify-between">
              <span>{row.label}</span>
              <input
                type="checkbox"
                checked={row.value}
                onChange={(e) => row.set(e.target.checked)}
              />
            </label>
          ))}
          <button
            type="button"
            className="ti-btn ti-btn-primary ti-btn-sm mt-2"
            disabled={save.isPending}
            onClick={() => save.mutate()}
          >
            {save.isPending ? 'Saving…' : 'Save preferences'}
          </button>
          {save.isSuccess && <p className="text-success fs-12 mb-0">Saved.</p>}
        </div>
      </div>
    </>
  )
}

export function SettingsSecurityPage() {
  return (
    <>
      <BreadCrumb
        activePage="Security"
        breadcrumbs={[{ label: 'Settings', href: ROUTES.SETTINGS }]}
      />
      <div className="box">
        <div className="box-body space-y-4">
          <div>
            <label className="form-label">Current password</label>
            <input type="password" className="form-control" />
          </div>
          <div>
            <label className="form-label">New password</label>
            <input type="password" className="form-control" />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Two-factor authentication</div>
              <div className="fs-12 text-textmuted">Recommended for owners and admins</div>
            </div>
            <button type="button" className="ti-btn ti-btn-outline-primary ti-btn-sm">
              Enable
            </button>
          </div>
          <button type="button" className="ti-btn ti-btn-primary ti-btn-sm">
            Update password
          </button>
        </div>
      </div>
    </>
  )
}

export function SettingsAuditLogsPage() {
  const logs = [
    { at: '2 hours ago', event: 'Login from Chrome on Windows' },
    { at: 'Yesterday', event: 'API key created' },
    { at: '3 days ago', event: 'Plan upgraded to Professional' },
  ]
  return (
    <>
      <BreadCrumb
        activePage="Audit Logs"
        breadcrumbs={[{ label: 'Settings', href: ROUTES.SETTINGS }]}
      />
      <div className="box">
        <div className="box-body space-y-3">
          {logs.map((l) => (
            <div key={l.event} className="flex justify-between border-b border-defaultborder pb-2">
              <span>{l.event}</span>
              <span className="fs-12 text-textmuted">{l.at}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

export function SettingsDeveloperPage() {
  return (
    <>
      <BreadCrumb
        activePage="Developer"
        breadcrumbs={[{ label: 'Settings', href: ROUTES.SETTINGS }]}
      />
      <div className="box">
        <div className="box-body">
          <div className="mb-3">
            <div className="text-textmuted fs-12">API Base URL</div>
            <code>{env.apiBaseUrl}</code>
          </div>
          <div className="mb-3">
            <div className="text-textmuted fs-12">WebSocket</div>
            <code>{env.websocket.baseUrl}</code>
          </div>
          <div>
            <div className="text-textmuted fs-12">Mock API</div>
            <span className="badge bg-primary-transparent">
              {env.useMockApi ? 'enabled' : 'disabled'}
            </span>
          </div>
        </div>
      </div>
    </>
  )
}

export function NotificationsPage() {
  const items = [
    { id: 1, type: 'Call', text: 'Live call started with Jordan Lee', at: '5m ago' },
    { id: 2, type: 'Campaign', text: 'Q1 Demo Outreach resumed', at: '1h ago' },
    { id: 3, type: 'Billing', text: 'Invoice INV-1042 paid', at: '2d ago' },
  ]
  return (
    <>
      <BreadCrumb
        activePage="Notifications"
        breadcrumbs={[{ label: 'Overview', href: ROUTES.DASHBOARD }]}
      />
      <div className="box">
        <div className="box-body space-y-3">
          {items.map((n) => (
            <div key={n.id} className="flex justify-between gap-3 p-3 border border-defaultborder rounded">
              <div>
                <span className="badge bg-primary-transparent me-2">{n.type}</span>
                {n.text}
              </div>
              <span className="fs-12 text-textmuted">{n.at}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

export function ResetPasswordPage() {
  return (
    <div className="box max-w-md mx-auto">
      <div className="box-header">
        <div className="box-title">Reset Password</div>
      </div>
      <div className="box-body space-y-3">
        <input type="password" className="form-control" placeholder="New password" />
        <input type="password" className="form-control" placeholder="Confirm password" />
        <button type="button" className="ti-btn ti-btn-primary w-full">
          Update password
        </button>
      </div>
    </div>
  )
}

export function VerifyEmailPage() {
  return (
    <div className="box max-w-md mx-auto text-center">
      <div className="box-body py-8">
        <h5 className="font-semibold mb-2">Verify your email</h5>
        <p className="text-textmuted">
          We sent a verification link. Open it to activate your account.
        </p>
        <button type="button" className="ti-btn ti-btn-outline-primary ti-btn-sm">
          Resend email
        </button>
      </div>
    </div>
  )
}

export function OnboardingPage() {
  const { user } = useAuth()
  const setCurrentOrganization = useOrganizationStore((s) => s.setCurrentOrganization)
  const organizations = useOrganizationStore((s) => s.organizations)
  const [name, setName] = useState('My Voice Org')

  return (
    <div className="box max-w-lg mx-auto mt-8">
      <div className="box-header">
        <div className="box-title">Create your organization</div>
      </div>
      <div className="box-body space-y-3">
        <p className="text-textmuted fs-12">Welcome{user ? `, ${user.name}` : ''}.</p>
        <div>
          <label className="form-label">Organization name</label>
          <input
            className="form-control"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <button
          type="button"
          className="ti-btn ti-btn-primary w-full"
          onClick={() => {
            if (organizations[0]) setCurrentOrganization(organizations[0].id)
            window.location.assign(ROUTES.DASHBOARD)
          }}
        >
          Continue to dashboard
        </button>
      </div>
    </div>
  )
}
