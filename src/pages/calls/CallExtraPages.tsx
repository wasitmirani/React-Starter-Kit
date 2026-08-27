import { Link } from 'react-router-dom'
import { useMemo } from 'react'
import { useQuery } from '@/hooks/useQuery'
import BreadCrumb from '@/components/common/BreadCrumb'
import { callsService } from '@/services/calls.service'
import { campaignsService } from '@/services/campaigns.service'
import { callDetailPath, campaignDetailPath, ROUTES } from '@/constants/routes.constants'

function formatDuration(sec: number) {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

export function CallRecordingsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['calls', 'recordings'],
    queryFn: () => callsService.list({ page: 1, per_page: 50 }),
  })
  const rows = useMemo(
    () => (data?.data ?? []).filter((c) => Boolean(c.recordingUrl)),
    [data],
  )

  return (
    <>
      <BreadCrumb
        activePage="Call Recordings"
        breadcrumbs={[{ label: 'Calls', href: ROUTES.CALLS }]}
      />
      <div className="box">
        <div className="box-body table-responsive">
          {isLoading ? (
            <p className="text-textmuted">Loading…</p>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Contact</th>
                  <th>Agent</th>
                  <th>Duration</th>
                  <th>Started</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {rows.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <Link to={callDetailPath(c.id)} className="text-primary">
                        {c.contactName}
                      </Link>
                    </td>
                    <td>{c.agentName}</td>
                    <td>{formatDuration(c.durationSec)}</td>
                    <td>{new Date(c.startedAt).toLocaleString()}</td>
                    <td>
                      {c.recordingUrl ? (
                        <audio controls className="w-full max-w-xs" preload="none" src={c.recordingUrl}>
                          Your browser does not support audio playback.
                        </audio>
                      ) : (
                        <span className="text-textmuted fs-12">—</span>
                      )}
                    </td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center text-textmuted">
                      No recordings
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  )
}

export function CallTranscriptsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['calls', 'transcripts'],
    queryFn: () => callsService.list({ page: 1, per_page: 50 }),
  })
  const rows = useMemo(
    () => (data?.data ?? []).filter((c) => c.transcript.length > 0),
    [data],
  )

  return (
    <>
      <BreadCrumb
        activePage="Call Transcripts"
        breadcrumbs={[{ label: 'Calls', href: ROUTES.CALLS }]}
      />
      <div className="box">
        <div className="box-body table-responsive">
          {isLoading ? (
            <p className="text-textmuted">Loading…</p>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Contact</th>
                  <th>Lines</th>
                  <th>Summary</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {rows.map((c) => (
                  <tr key={c.id}>
                    <td>{c.contactName}</td>
                    <td>{c.transcript.length}</td>
                    <td className="text-textmuted">{c.summary}</td>
                    <td>
                      <Link to={callDetailPath(c.id)} className="ti-btn ti-btn-sm ti-btn-outline-primary">
                        Open
                      </Link>
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

export function CallOutcomesPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['calls', 'outcomes'],
    queryFn: () => callsService.list({ page: 1, per_page: 50 }),
  })

  const grouped = useMemo(() => {
    const map = new Map<string, number>()
    for (const c of data?.data ?? []) {
      map.set(c.outcome, (map.get(c.outcome) ?? 0) + 1)
    }
    return [...map.entries()]
  }, [data])

  return (
    <>
      <BreadCrumb
        activePage="Call Outcomes"
        breadcrumbs={[{ label: 'Calls', href: ROUTES.CALLS }]}
      />
      <div className="grid grid-cols-12 gap-4 mb-3">
        {grouped.map(([outcome, count]) => (
          <div key={outcome} className="xl:col-span-3 md:col-span-6 col-span-12">
            <div className="box">
              <div className="box-body">
                <div className="text-textmuted fs-12">{outcome}</div>
                <div className="font-semibold fs-22">{count}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="box">
        <div className="box-body table-responsive">
          {isLoading ? (
            <p className="text-textmuted">Loading…</p>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Contact</th>
                  <th>Outcome</th>
                  <th>Sentiment</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {(data?.data ?? []).map((c) => (
                  <tr key={c.id}>
                    <td>{c.contactName}</td>
                    <td>{c.outcome}</td>
                    <td>{c.sentiment}</td>
                    <td>{c.status}</td>
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

function CampaignFilterPage({
  title,
  statuses,
}: {
  title: string
  statuses: string[]
}) {
  const { data, isLoading } = useQuery({
    queryKey: ['campaigns', title],
    queryFn: () => campaignsService.list({ page: 1, per_page: 50 }),
  })
  const rows = (data?.data ?? []).filter((c) => statuses.includes(c.status))

  return (
    <>
      <BreadCrumb
        activePage={title}
        breadcrumbs={[{ label: 'Campaigns', href: ROUTES.CAMPAIGNS }]}
      />
      <div className="box">
        <div className="box-body table-responsive">
          {isLoading ? (
            <p className="text-textmuted">Loading…</p>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Campaign</th>
                  <th>Status</th>
                  <th>Agent</th>
                  <th>Progress</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <Link to={campaignDetailPath(c.id)} className="text-primary">
                        {c.name}
                      </Link>
                    </td>
                    <td>{c.status}</td>
                    <td>{c.agentName}</td>
                    <td>
                      {c.stats.completed}/{c.stats.totalContacts}
                    </td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center text-textmuted">
                      No campaigns
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  )
}

export function CampaignsActivePage() {
  return <CampaignFilterPage title="Active Campaigns" statuses={['running']} />
}

export function CampaignsScheduledPage() {
  return <CampaignFilterPage title="Scheduled Campaigns" statuses={['scheduled']} />
}

export function CampaignsReportsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['campaigns', 'reports'],
    queryFn: () => campaignsService.list({ page: 1, per_page: 50 }),
  })

  return (
    <>
      <BreadCrumb
        activePage="Campaign Reports"
        breadcrumbs={[{ label: 'Campaigns', href: ROUTES.CAMPAIGNS }]}
      />
      <div className="box">
        <div className="box-body table-responsive">
          {isLoading ? (
            <p className="text-textmuted">Loading…</p>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Campaign</th>
                  <th>Answered</th>
                  <th>Successful</th>
                  <th>Failed</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {(data?.data ?? []).map((c) => (
                  <tr key={c.id}>
                    <td>{c.name}</td>
                    <td>{c.stats.answered}</td>
                    <td>{c.stats.successful}</td>
                    <td>{c.stats.failed}</td>
                    <td>{c.status}</td>
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
