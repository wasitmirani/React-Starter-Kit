import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import BreadCrumb from '@/components/common/BreadCrumb'
import { settingsService } from '@/services/settings.service'
import { phoneNumbersService } from '@/services/phone-numbers.service'
import { ROUTES } from '@/constants/routes.constants'
import { useToast } from '@/hooks/useToast'

export function PhoneSipPage() {
  const toast = useToast()
  const queryClient = useQueryClient()
  const { data } = useQuery({
    queryKey: ['settings', 'telephony'],
    queryFn: () => settingsService.getTelephony(),
  })
  const [sipDomain, setSipDomain] = useState('')
  const [sipUsername, setSipUsername] = useState('')
  const [sipPassword, setSipPassword] = useState('')
  const [sipTransport, setSipTransport] = useState<'udp' | 'tcp' | 'tls'>('tls')

  useEffect(() => {
    if (data?.data) {
      setSipDomain(data.data.sipDomain)
      setSipUsername(data.data.sipUsername)
      setSipPassword(data.data.sipPassword ?? '')
      setSipTransport(data.data.sipTransport ?? 'tls')
    }
  }, [data])

  const save = useMutation({
    mutationFn: () =>
      settingsService.saveTelephony({
        sipDomain,
        sipUsername,
        sipPassword,
        sipTransport,
      }),
    onSuccess: () => {
      toast.success('SIP config saved')
      void queryClient.invalidateQueries({ queryKey: ['settings', 'telephony'] })
    },
  })

  return (
    <>
      <BreadCrumb
        activePage="SIP Trunks"
        breadcrumbs={[{ label: 'Telephony', href: ROUTES.PHONE_NUMBERS }]}
      />
      <div className="box mb-3">
        <div className="box-body">
          <p className="mb-0">
            Connect an open-source trunk (LiveKit SIP, Asterisk, FreeSWITCH) so purchased or BYON
            numbers can reach AI agents over WebRTC.
          </p>
        </div>
      </div>
      <div className="box">
        <div className="box-body">
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="form-label">SIP domain / host</label>
              <input
                className="form-control"
                value={sipDomain}
                onChange={(e) => setSipDomain(e.target.value)}
                placeholder="sip.livekit.cloud"
              />
            </div>
            <div>
              <label className="form-label">Transport</label>
              <select
                className="form-control"
                value={sipTransport}
                onChange={(e) =>
                  setSipTransport(e.target.value as 'udp' | 'tcp' | 'tls')
                }
              >
                <option value="tls">TLS</option>
                <option value="tcp">TCP</option>
                <option value="udp">UDP</option>
              </select>
            </div>
            <div>
              <label className="form-label">Username</label>
              <input
                className="form-control"
                value={sipUsername}
                onChange={(e) => setSipUsername(e.target.value)}
              />
            </div>
            <div>
              <label className="form-label">Password</label>
              <input
                className="form-control"
                type="password"
                value={sipPassword}
                onChange={(e) => setSipPassword(e.target.value)}
                placeholder="Stored encrypted on the API"
                autoComplete="new-password"
              />
            </div>
          </div>
          <button
            type="button"
            className="ti-btn ti-btn-primary ti-btn-sm"
            disabled={save.isPending}
            onClick={() => save.mutate()}
          >
            {save.isPending ? 'Saving…' : 'Save SIP config'}
          </button>
        </div>
      </div>
    </>
  )
}

export function PhoneRoutingPage() {
  const toast = useToast()
  const queryClient = useQueryClient()
  const { data } = useQuery({
    queryKey: ['settings', 'telephony'],
    queryFn: () => settingsService.getTelephony(),
  })
  const [rules, setRules] = useState<string[]>([])
  const [draft, setDraft] = useState('')

  useEffect(() => {
    if (data?.data?.routingRules) setRules(data.data.routingRules)
  }, [data])

  const save = useMutation({
    mutationFn: () => settingsService.saveTelephony({ routingRules: rules }),
    onSuccess: () => {
      toast.success('Routing updated')
      void queryClient.invalidateQueries({ queryKey: ['settings', 'telephony'] })
    },
  })

  return (
    <>
      <BreadCrumb
        activePage="Call Routing"
        breadcrumbs={[{ label: 'Telephony', href: ROUTES.PHONE_NUMBERS }]}
      />
      <div className="box">
        <div className="box-body space-y-3">
          {rules.map((rule, index) => (
            <div
              key={`${rule}-${index}`}
              className="p-3 border border-defaultborder rounded flex items-center justify-between gap-2"
            >
              <span>{rule}</span>
              <button
                type="button"
                className="ti-btn ti-btn-outline-danger ti-btn-sm"
                onClick={() => setRules((prev) => prev.filter((_, i) => i !== index))}
              >
                Remove
              </button>
            </div>
          ))}
          <div className="flex flex-wrap gap-2">
            <input
              className="form-control grow"
              style={{ minWidth: 240 }}
              placeholder="New rule…"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
            />
            <button
              type="button"
              className="ti-btn ti-btn-outline-primary ti-btn-sm"
              disabled={!draft.trim()}
              onClick={() => {
                setRules((prev) => [...prev, draft.trim()])
                setDraft('')
              }}
            >
              Add rule
            </button>
            <button
              type="button"
              className="ti-btn ti-btn-primary ti-btn-sm"
              disabled={save.isPending}
              onClick={() => save.mutate()}
            >
              {save.isPending ? 'Saving…' : 'Save routing'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

export function PhoneHoursPage() {
  const toast = useToast()
  const queryClient = useQueryClient()
  const { data } = useQuery({
    queryKey: ['settings', 'telephony'],
    queryFn: () => settingsService.getTelephony(),
  })
  const [hours, setHours] = useState<{ day: string; open: string; close: string }[]>([])

  useEffect(() => {
    if (data?.data?.businessHours) setHours(data.data.businessHours)
  }, [data])

  const save = useMutation({
    mutationFn: () => settingsService.saveTelephony({ businessHours: hours }),
    onSuccess: () => {
      toast.success('Business hours saved')
      void queryClient.invalidateQueries({ queryKey: ['settings', 'telephony'] })
    },
  })

  return (
    <>
      <BreadCrumb
        activePage="Business Hours"
        breadcrumbs={[{ label: 'Telephony', href: ROUTES.PHONE_NUMBERS }]}
      />
      <div className="box">
        <div className="box-body table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Day</th>
                <th>Open</th>
                <th>Close</th>
              </tr>
            </thead>
            <tbody>
              {hours.map((row, index) => (
                <tr key={row.day}>
                  <td>{row.day}</td>
                  <td>
                    <input
                      className="form-control"
                      value={row.open}
                      onChange={(e) =>
                        setHours((prev) =>
                          prev.map((h, i) =>
                            i === index ? { ...h, open: e.target.value } : h,
                          ),
                        )
                      }
                    />
                  </td>
                  <td>
                    <input
                      className="form-control"
                      value={row.close}
                      onChange={(e) =>
                        setHours((prev) =>
                          prev.map((h, i) =>
                            i === index ? { ...h, close: e.target.value } : h,
                          ),
                        )
                      }
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button
            type="button"
            className="ti-btn ti-btn-primary ti-btn-sm"
            disabled={save.isPending}
            onClick={() => save.mutate()}
          >
            {save.isPending ? 'Saving…' : 'Save hours'}
          </button>
        </div>
      </div>
    </>
  )
}

export function PhoneCallerIdPage() {
  const toast = useToast()
  const queryClient = useQueryClient()
  const { data } = useQuery({
    queryKey: ['settings', 'telephony'],
    queryFn: () => settingsService.getTelephony(),
  })
  const numbersQuery = useQuery({
    queryKey: ['phone-numbers', 'caller-id'],
    queryFn: () => phoneNumbersService.list({ page: 1, per_page: 50 }),
  })
  const [callerId, setCallerId] = useState('')
  useEffect(() => {
    if (data?.data) setCallerId(data.data.defaultCallerId)
  }, [data])

  const save = useMutation({
    mutationFn: () => settingsService.saveTelephony({ defaultCallerId: callerId }),
    onSuccess: () => {
      toast.success('Caller ID saved')
      void queryClient.invalidateQueries({ queryKey: ['settings', 'telephony'] })
    },
  })

  const owned = (numbersQuery.data?.data ?? []).filter(
    (n) => n.status === 'available' || n.status === 'assigned',
  )

  return (
    <>
      <BreadCrumb
        activePage="Caller ID"
        breadcrumbs={[{ label: 'Telephony', href: ROUTES.PHONE_NUMBERS }]}
      />
      <div className="box">
        <div className="box-body space-y-3">
          <div>
            <label className="form-label">Default outbound caller ID</label>
            <select
              className="form-control"
              value={callerId}
              onChange={(e) => setCallerId(e.target.value)}
            >
              <option value="">Select…</option>
              {owned.map((n) => (
                <option key={n.id} value={n.number}>
                  {n.number} · {n.friendlyName} ({n.channel ?? n.provider})
                </option>
              ))}
            </select>
            {owned.length === 0 && (
              <p className="text-textmuted fs-12 mt-2 mb-0">
                Add a number first (Buy / BYON / WhatsApp) to choose a caller ID.
              </p>
            )}
          </div>
          <button
            type="button"
            className="ti-btn ti-btn-primary ti-btn-sm"
            disabled={save.isPending || !callerId}
            onClick={() => save.mutate()}
          >
            {save.isPending ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </>
  )
}
