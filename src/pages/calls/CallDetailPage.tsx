import { useParams } from 'react-router-dom'
import { useQuery } from '@/hooks/useQuery'
import BreadCrumb from '@/components/common/BreadCrumb'
import { callsService } from '@/services/calls.service'
import { ROUTES } from '@/constants/routes.constants'

function formatDuration(sec: number) {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

export function CallDetailPage() {
  const { id = '' } = useParams()
  const { data, isLoading, isError } = useQuery({
    queryKey: ['call', id],
    queryFn: () => callsService.get(id),
    enabled: Boolean(id),
  })

  if (isLoading) return <div className="box box-body">Loading…</div>
  if (isError || !data?.success || !data.data) {
    return <div className="box box-body text-danger">Call not found.</div>
  }

  const call = data.data

  return (
    <>
      <BreadCrumb
        activePage={call.contactName}
        breadcrumbs={[{ label: 'Calls', href: ROUTES.CALLS }]}
      />

      <div className="grid grid-cols-12 gap-4">
        <div className="xl:col-span-4 col-span-12">
          <div className="box">
            <div className="box-header">
              <div className="box-title">Call Information</div>
            </div>
            <div className="box-body space-y-3">
              <div>
                <div className="text-textmuted fs-12">Contact</div>
                <div>
                  {call.contactName} · {call.contactPhone}
                </div>
              </div>
              <div>
                <div className="text-textmuted fs-12">Agent</div>
                <div>{call.agentName}</div>
              </div>
              <div>
                <div className="text-textmuted fs-12">Direction / Status</div>
                <div>
                  {call.direction} · {call.status}
                </div>
              </div>
              <div>
                <div className="text-textmuted fs-12">Duration</div>
                <div>{formatDuration(call.durationSec)}</div>
              </div>
              <div>
                <div className="text-textmuted fs-12">Outcome</div>
                <div>{call.outcome}</div>
              </div>
              <div>
                <div className="text-textmuted fs-12">Sentiment</div>
                <div>{call.sentiment}</div>
              </div>
              {call.campaignName && (
                <div>
                  <div className="text-textmuted fs-12">Campaign</div>
                  <div>{call.campaignName}</div>
                </div>
              )}
            </div>
          </div>

          <div className="box mt-3">
            <div className="box-header">
              <div className="box-title">AI Summary</div>
            </div>
            <div className="box-body">
              <p className="mb-0">{call.summary}</p>
            </div>
          </div>

          <div className="box mt-3">
            <div className="box-header">
              <div className="box-title">Recording</div>
            </div>
            <div className="box-body">
              {call.recordingUrl ? (
                <audio controls className="w-full" src={call.recordingUrl}>
                  Your browser does not support audio playback.
                </audio>
              ) : (
                <p className="text-textmuted mb-0">No recording available.</p>
              )}
            </div>
          </div>
        </div>

        <div className="xl:col-span-8 col-span-12">
          <div className="box">
            <div className="box-header">
              <div className="box-title">Transcript</div>
            </div>
            <div className="box-body">
              {call.transcript.length === 0 ? (
                <p className="text-textmuted mb-0">No transcript for this call.</p>
              ) : (
                <div className="space-y-3">
                  {call.transcript.map((line) => (
                    <div
                      key={line.id}
                      className={`p-3 rounded ${
                        line.speaker === 'user'
                          ? 'bg-primary-transparent'
                          : 'bg-light'
                      }`}
                    >
                      <div className="fs-12 text-textmuted mb-1">
                        {line.speaker} · {new Date(line.at).toLocaleTimeString()}
                      </div>
                      <div>{line.text}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
