import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { adminApi, type PlatformSettings } from '@/api/endpoints/admin.api'
import { errorMessage } from '@/api/errors'
import { Loader } from '@/components/common/Loader'
import { PageHeader } from '@/components/common/PageHeader'
import { Switch } from '@/components/ui/Controls'
import { useToast } from '@/hooks/useToast'
import { AnnouncementBar } from '@/components/features/platform/AnnouncementBanner'
import { AdminNav } from './admin-ui'

/** Platform-wide switches: the announcement banner and new sign-ups. */
export function AdminSettingsPage() {
  const q = useQuery({ queryKey: ['admin', 'settings'], queryFn: async () => (await adminApi.settings()).data.data })
  return (
    <>
      <PageHeader title="Platform settings" description="Switches that apply to every workspace and every user. Each change is recorded in the platform audit log." />
      <AdminNav />
      {q.isLoading ? <Loader /> : q.isError || !q.data ? <div className="alert alert-danger">{errorMessage(q.error)}</div> : <Forms key={JSON.stringify(q.data)} s={q.data} />}
    </>
  )
}

function Forms({ s }: { s: PlatformSettings }) {
  const queryClient = useQueryClient()
  const toast = useToast()
  const [a, setA] = useState(s.announcement)
  const [signups, setSignups] = useState(s.signups)

  const save = useMutation({
    mutationFn: (body: Partial<PlatformSettings>) => adminApi.updateSettings(body),
    onSuccess: ({ data }) => {
      queryClient.setQueryData(['admin', 'settings'], data.data)
      void queryClient.invalidateQueries({ queryKey: ['announcement'] })
      void queryClient.invalidateQueries({ queryKey: ['admin', 'audit'] })
      toast.success('Settings saved')
    },
    onError: (e) => toast.error(errorMessage(e)),
  })
  const aChanged = JSON.stringify(a) !== JSON.stringify(s.announcement)
  const sChanged = JSON.stringify(signups) !== JSON.stringify(s.signups)
  const linkBad = !!a.link && !/^https:\/\/\S+$/i.test(a.link)

  return (
    <div className="row g-4">
      <div className="col-xl-7">
        <div className="card">
          <div className="card-header">
            <h6 className="card-title mb-0">Announcement banner</h6>
          </div>
          <div className="card-body">
            <p className="text-muted fs-sm">Shown at the top of the app to every signed-in user, in every workspace, for example before planned maintenance. People can hide it for their session.</p>
            <div className="mb-3">
              <Switch id="ann-on" checked={a.enabled} onChange={(enabled) => setA({ ...a, enabled })} label="Show the banner" />
            </div>
            <div className="mb-3">
              <label className="form-label" htmlFor="ann-msg">
                Message
              </label>
              <textarea id="ann-msg" className="form-control" rows={2} maxLength={300} value={a.message} onChange={(e) => setA({ ...a, message: e.target.value })} placeholder="Scheduled maintenance on Sunday 02:00–03:00 UTC. Sending may be delayed." />
              <div className="form-text">{a.message.length}/300</div>
            </div>
            <div className="row g-3 mb-3">
              <div className="col-sm-4">
                <label className="form-label" htmlFor="ann-level">
                  Style
                </label>
                <select id="ann-level" className="form-select" value={a.level} onChange={(e) => setA({ ...a, level: e.target.value as typeof a.level })}>
                  <option value="info">Information</option>
                  <option value="warning">Warning</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
              <div className="col-sm-8">
                <label className="form-label" htmlFor="ann-link">
                  Link <span className="text-muted fw-normal">(optional)</span>
                </label>
                <input id="ann-link" type="url" className={`form-control${linkBad ? ' is-invalid' : ''}`} value={a.link} onChange={(e) => setA({ ...a, link: e.target.value })} placeholder="https://status.example.com" aria-describedby="ann-link-err" />
                {linkBad && (
                  <div id="ann-link-err" className="invalid-feedback">
                    Use a full https:// address.
                  </div>
                )}
              </div>
            </div>
            {a.message.trim() && (
              <div className="mb-3">
                <div className="text-muted fs-xs mb-1">Preview</div>
                <AnnouncementBar a={{ message: a.message, level: a.level, link: a.link || null }} />
              </div>
            )}
            <button type="button" className="btn btn-primary" disabled={!aChanged || linkBad || (a.enabled && !a.message.trim()) || save.isPending} onClick={() => save.mutate({ announcement: a })}>
              Save banner
            </button>
          </div>
        </div>
      </div>
      <div className="col-xl-5">
        <div className="card">
          <div className="card-header">
            <h6 className="card-title mb-0">New sign-ups</h6>
          </div>
          <div className="card-body">
            <div className="mb-3">
              <Switch
                id="signups-on"
                checked={signups.enabled}
                onChange={(enabled) => setSignups({ ...signups, enabled })}
                label="Anyone can create an account"
                description="When off, only people with a pending invitation can sign up. Existing accounts are not affected."
              />
            </div>
            <div className="mb-3">
              <label className="form-label" htmlFor="signups-msg">
                Message when closed
              </label>
              <input id="signups-msg" className="form-control" maxLength={300} value={signups.closedMessage} onChange={(e) => setSignups({ ...signups, closedMessage: e.target.value })} />
              <div className="form-text">Shown on the sign-up form.</div>
            </div>
            {!signups.enabled && s.signups.enabled && <div className="alert alert-warning fs-sm">Saving closes sign-ups immediately.</div>}
            <button type="button" className="btn btn-primary" disabled={!sChanged || save.isPending} onClick={() => save.mutate({ signups })}>
              Save sign-ups
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
