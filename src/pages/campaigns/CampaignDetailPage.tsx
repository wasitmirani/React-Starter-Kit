import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import BreadCrumb from '@/components/common/BreadCrumb'
import { campaignsService } from '@/services/campaigns.service'
import { contactsService } from '@/services/contacts.service'
import { callsService } from '@/services/calls.service'
import { Can } from '@/components/common/Can'
import { PERMISSIONS } from '@/config/permissions'
import { useToast } from '@/hooks/useToast'
import { ROUTES, callDetailPath, contactDetailPath } from '@/constants/routes.constants'

export function CampaignDetailPage() {
  const { id = '' } = useParams()
  const toast = useToast()
  const queryClient = useQueryClient()

  const { data, isLoading, isError } = useQuery({
    queryKey: ['campaign', id],
    queryFn: () => campaignsService.get(id),
    enabled: Boolean(id),
  })

  const contactsQuery = useQuery({
    queryKey: ['contacts', 'campaign', id],
    queryFn: () => contactsService.list({ page: 1, per_page: 200 }),
    enabled: Boolean(data?.data?.contactIds?.length),
  })

  const campaignContacts = useMemo(() => {
    const ids = new Set(data?.data?.contactIds ?? [])
    return (contactsQuery.data?.data ?? []).filter((c) => ids.has(c.id))
  }, [contactsQuery.data, data?.data?.contactIds])

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ['campaign', id] })
    void queryClient.invalidateQueries({ queryKey: ['campaigns'] })
    void queryClient.invalidateQueries({ queryKey: ['calls'] })
  }

  const dialLead = useMutation({
    mutationFn: (contact: { id: string; phone: string; name: string }) => {
      const c = data?.data
      if (!c) throw new Error('Campaign not loaded')
      return callsService.dialLead({
        phoneNumberId: c.phoneNumberId,
        toNumber: contact.phone,
        agentId: c.agentId,
        contactName: contact.name,
      })
    },
    onSuccess: (res) => {
      if (res.success && res.data) {
        toast.success('Lead call started')
        invalidate()
        window.location.href = callDetailPath(res.data.callId)
      } else {
        toast.error(res.message ?? 'Dial failed')
      }
    },
  })

  const start = useMutation({
    mutationFn: () => campaignsService.start(id),
    onSuccess: async (res) => {
      invalidate()
      if (res.success && campaignContacts[0] && data?.data) {
        const first = campaignContacts[0]
        const dialRes = await callsService.dialLead({
          phoneNumberId: data.data.phoneNumberId,
          toNumber: first.phone,
          agentId: data.data.agentId,
          contactName: `${first.firstName} ${first.lastName}`.trim(),
        })
        if (dialRes.success && dialRes.data) {
          toast.success(`Campaign started — calling ${first.firstName}`)
          window.location.href = callDetailPath(dialRes.data.callId)
        }
      }
    },
  })

  const pause = useMutation({
    mutationFn: () => campaignsService.pause(id),
    onSuccess: invalidate,
  })
  const stop = useMutation({
    mutationFn: () => campaignsService.stop(id),
    onSuccess: invalidate,
  })

  if (isLoading) return <div className="box box-body">Loading…</div>
  if (isError || !data?.success || !data.data) {
    return <div className="box box-body text-danger">Campaign not found.</div>
  }

  const c = data.data
  const stats = [
    { label: 'Total Contacts', value: c.stats.totalContacts },
    { label: 'Queued', value: c.stats.queued },
    { label: 'Calling', value: c.stats.calling },
    { label: 'Completed', value: c.stats.completed },
    { label: 'Answered', value: c.stats.answered },
    { label: 'No Answer', value: c.stats.noAnswer },
    { label: 'Failed', value: c.stats.failed },
    { label: 'Successful', value: c.stats.successful },
  ]

  return (
    <>
      <BreadCrumb
        activePage={c.name}
        breadcrumbs={[{ label: 'Campaigns', href: ROUTES.CAMPAIGNS }]}
      />

      <div className="box mb-3">
        <div className="box-header flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="box-title">{c.name}</div>
            <p className="text-textmuted mb-0 fs-12">{c.description}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="badge bg-primary-transparent">{c.status}</span>
            <Can permission={PERMISSIONS.CAMPAIGNS_START}>
              <button
                type="button"
                className="ti-btn ti-btn-success ti-btn-sm"
                disabled={start.isPending}
                onClick={() => start.mutate()}
              >
                {start.isPending ? 'Starting…' : 'Start & call leads'}
              </button>
              <button
                type="button"
                className="ti-btn ti-btn-warning ti-btn-sm"
                onClick={() => pause.mutate()}
              >
                Pause
              </button>
            </Can>
            <Can permission={PERMISSIONS.CAMPAIGNS_STOP}>
              <button
                type="button"
                className="ti-btn ti-btn-danger ti-btn-sm"
                onClick={() => stop.mutate()}
              >
                Stop
              </button>
            </Can>
            <Link to={ROUTES.CALLS_LIVE} className="ti-btn ti-btn-outline-light ti-btn-sm">
              Live Calls
            </Link>
          </div>
        </div>
        <div className="box-body grid grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <div className="text-textmuted fs-12">Agent</div>
            <div>{c.agentName}</div>
          </div>
          <div>
            <div className="text-textmuted fs-12">Phone</div>
            <div>{c.phoneNumber}</div>
          </div>
          <div>
            <div className="text-textmuted fs-12">Retry policy</div>
            <div>{c.retryPolicy}</div>
          </div>
          <div>
            <div className="text-textmuted fs-12">Call limit</div>
            <div>{c.callLimit}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4 mb-4">
        {stats.map((s) => (
          <div key={s.label} className="xl:col-span-3 md:col-span-4 col-span-6">
            <div className="box mb-0">
              <div className="box-body">
                <div className="text-textmuted fs-12">{s.label}</div>
                <div className="font-semibold fs-22">{s.value}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="box">
        <div className="box-header">
          <div className="box-title">Lead queue</div>
        </div>
        <div className="box-body table-responsive">
          {campaignContacts.length === 0 ? (
            <p className="text-textmuted mb-0">No contacts in this campaign.</p>
          ) : (
            <table className="table mb-0">
              <thead>
                <tr>
                  <th>Lead</th>
                  <th>Phone</th>
                  <th>Company</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {campaignContacts.map((contact) => (
                  <tr key={contact.id}>
                    <td>
                      <Link to={contactDetailPath(contact.id)} className="text-primary">
                        {contact.firstName} {contact.lastName}
                      </Link>
                    </td>
                    <td>{contact.phone}</td>
                    <td>{contact.company ?? '—'}</td>
                    <td className="text-end">
                      <Can permission={PERMISSIONS.CAMPAIGNS_START}>
                        <button
                          type="button"
                          className="ti-btn ti-btn-success ti-btn-sm"
                          disabled={dialLead.isPending || c.status === 'stopped'}
                          onClick={() =>
                            dialLead.mutate({
                              id: contact.id,
                              phone: contact.phone,
                              name: `${contact.firstName} ${contact.lastName}`.trim(),
                            })
                          }
                        >
                          <i className="ri-phone-fill me-1" />
                          Call now
                        </button>
                      </Can>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  )
}
