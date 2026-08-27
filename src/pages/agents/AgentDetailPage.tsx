import { useEffect, useRef, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import BreadCrumb from '@/components/common/BreadCrumb'
import { agentsService } from '@/services/agents.service'
import { AgentVoiceChat, AgentChatStartHero } from '@/components/features/calls/AgentVoiceChat'
import { AgentTrainingSavePanel } from '@/components/features/agents/AgentTrainingPanel'
import type { BackendBrowserSession } from '@/types/backend.types'
import { ROUTES, agentEditPath } from '@/constants/routes.constants'
import { useToast } from '@/hooks/useToast'
import { useBackendReady } from '@/hooks/useBackendReady'

export function AgentDetailPage() {
  const { id = '' } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const toast = useToast()
  const queryClient = useQueryClient()
  const backend = useBackendReady()
  const [session, setSession] = useState<BackendBrowserSession | null>(null)
  const [detailTab, setDetailTab] = useState<'chat' | 'train'>('chat')
  const autoCallRef = useRef(false)

  const { data, isLoading, isError } = useQuery({
    queryKey: ['agent', id],
    queryFn: () => agentsService.get(id),
    enabled: Boolean(id),
  })

  const testMutation = useMutation({
    mutationFn: () => agentsService.test(id),
    onSuccess: (res) => {
      const nextSession =
        res.data && 'session' in res.data ? res.data.session : undefined
      if (!nextSession) {
        toast.error(res.message ?? 'Could not start call')
        return
      }
      setSession(nextSession)
      toast.success('Live conversation started — agent will speak first')
    },
    onError: (error) => {
      const messageText =
        error && typeof error === 'object' && 'message' in error
          ? String((error as { message?: string }).message)
          : 'Failed to start call'
      toast.error(messageText)
    },
  })

  const publishMutation = useMutation({
    mutationFn: () => agentsService.publish(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['agent', id] })
      void queryClient.invalidateQueries({ queryKey: ['agents'] })
      toast.success('Agent published — you can call it now')
    },
  })

  const agent = data?.success ? data.data : null
  const canTest = agent?.status === 'active'

  useEffect(() => {
    if (
      searchParams.get('call') !== '1' ||
      session ||
      autoCallRef.current ||
      !canTest ||
      backend.status !== 'online' ||
      testMutation.isPending ||
      !agent
    ) {
      return
    }
    autoCallRef.current = true
    testMutation.mutate()
    setSearchParams({}, { replace: true })
  }, [
    searchParams,
    session,
    canTest,
    backend.status,
    testMutation.isPending,
    setSearchParams,
    testMutation,
    agent,
  ])

  if (isLoading) return <div className="box box-body">Loading…</div>
  if (isError || !agent) {
    return <div className="box box-body text-danger">Agent not found.</div>
  }

  const apiReady = backend.status === 'online'

  return (
    <>
      <BreadCrumb
        activePage={agent.name}
        breadcrumbs={[{ label: 'AI Agents', href: ROUTES.AGENTS }]}
      />

      <div className="grid grid-cols-12 gap-4">
        {!session && (
          <div className="xl:col-span-4 col-span-12">
            <div className="box">
              <div className="box-header flex items-center justify-between">
                <div>
                  <div className="box-title">{agent.name}</div>
                  <p className="text-textmuted mb-0 fs-12">{agent.description}</p>
                </div>
                <span className="badge bg-primary-transparent">{agent.status}</span>
              </div>
              <div className="box-body fs-13">
                <div className="mb-3">
                  <div className="text-textmuted fs-12">Greeting</div>
                  <p className="mb-0">{agent.greeting || 'Hello! How can I help?'}</p>
                </div>
                <div className="mb-3">
                  <div className="text-textmuted fs-12">Model</div>
                  <p className="mb-0">
                    {agent.modelProvider} · {agent.model}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {agent.status !== 'active' && (
                    <button
                      type="button"
                      className="ti-btn ti-btn-primary ti-btn-sm"
                      disabled={publishMutation.isPending}
                      onClick={() => publishMutation.mutate()}
                    >
                      {publishMutation.isPending ? 'Publishing…' : 'Publish agent'}
                    </button>
                  )}
                  <Link
                    to={agentEditPath(agent.id)}
                    className="ti-btn ti-btn-outline-primary ti-btn-sm"
                  >
                    Edit
                  </Link>
                </div>
              </div>
            </div>

            <div className="box mt-4">
              <div className="box-header">
                <div className="box-title fs-14">Training</div>
              </div>
              <div className="box-body fs-13">
                <SetupRow
                  ok={Boolean(
                    agent.businessDescription ||
                      agent.trainingContext ||
                      (agent.trainingFaqs?.length ?? 0) > 0,
                  )}
                  label="Business training"
                  hint={
                    agent.businessDescription || agent.trainingContext
                      ? 'Training data linked'
                      : 'Add under Train Agent tab'
                  }
                />
              </div>
            </div>

            <div className="box mt-4">
              <div className="box-header">
                <div className="box-title fs-14">Setup</div>
              </div>
              <div className="box-body fs-13 space-y-2">
                <SetupRow
                  ok={agent.status === 'active'}
                  label="Agent published"
                  hint={agent.status === 'active' ? 'Ready' : 'Click Publish above'}
                />
                <SetupRow
                  ok={apiReady}
                  loading={backend.status === 'checking'}
                  label="Backend API"
                  hint={backend.detail ?? 'Checking…'}
                />
                <SetupRow ok={null} label="Ollama" hint="ollama pull llama3.1" />
              </div>
            </div>
          </div>
        )}

        <div className={session ? 'col-span-12' : 'xl:col-span-8 col-span-12'}>
          <div className="box mb-0 overflow-hidden">
            {!session && (
              <div className="box-header flex items-center justify-between flex-wrap gap-2">
                <div className="flex gap-2">
                  <button
                    type="button"
                    className={`ti-btn ti-btn-sm ${detailTab === 'chat' ? 'ti-btn-primary' : 'ti-btn-outline-light'}`}
                    onClick={() => setDetailTab('chat')}
                  >
                    Test conversation
                  </button>
                  <button
                    type="button"
                    className={`ti-btn ti-btn-sm ${detailTab === 'train' ? 'ti-btn-primary' : 'ti-btn-outline-light'}`}
                    onClick={() => setDetailTab('train')}
                  >
                    Train agent
                  </button>
                </div>
                {detailTab === 'chat' && (
                  <Link to={ROUTES.CALLS_LIVE} className="ti-btn ti-btn-outline-light ti-btn-sm">
                    Live Calls
                  </Link>
                )}
              </div>
            )}
            <div className={session ? 'p-0' : detailTab === 'train' ? 'p-0' : 'box-body p-0 md:p-3'}>
              {!session && detailTab === 'train' ? (
                <AgentTrainingSavePanel agent={agent} />
              ) : !session ? (
                <AgentChatStartHero
                  agentName={agent.name}
                  canTest={canTest}
                  apiOffline={backend.status === 'offline'}
                  apiDetail={backend.detail}
                  starting={testMutation.isPending}
                  onStart={() => testMutation.mutate()}
                />
              ) : (
                <AgentVoiceChat
                  session={session}
                  agentName={agent.name}
                  agentGreeting={agent.greeting}
                  agentVoice={agent.voice}
                  speechRate={agent.speed}
                  speechPitch={agent.pitch}
                  language={agent.language.startsWith('en') ? 'en-US' : agent.language}
                  onLeave={() => setSession(null)}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

function SetupRow({
  ok,
  loading,
  label,
  hint,
}: {
  ok: boolean | null
  loading?: boolean
  label: string
  hint: string
}) {
  const icon =
    loading ? 'ri-loader-4-line animate-spin text-warning' :
    ok === true ? 'ri-checkbox-circle-fill text-success' :
    ok === false ? 'ri-close-circle-fill text-danger' :
    'ri-information-line text-textmuted'

  return (
    <div className="flex gap-2">
      <i className={`${icon} mt-0.5`} />
      <div>
        <div>{label}</div>
        <div className="text-textmuted fs-12">{hint}</div>
      </div>
    </div>
  )
}
