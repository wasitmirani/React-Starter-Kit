import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import BreadCrumb from '@/components/common/BreadCrumb'
import { agentsService } from '@/services/agents.service'
import {
  agentFormSchema,
  defaultAgentFormValues,
  type AgentFormValues,
} from '@/utils/validators/agent.schema'
import { ROUTES, agentDetailPath } from '@/constants/routes.constants'
import { AgentTrainingFields } from '@/components/features/agents/AgentTrainingPanel'
import { VOICE_PRESETS } from '@/lib/agent-speech'

const SECTIONS = [
  'Basic Information',
  'Voice',
  'AI Model',
  'Behavior',
  'Knowledge',
  'Calling',
] as const

type Section = (typeof SECTIONS)[number]

function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="mb-3">
      <label className="form-label">{label}</label>
      {children}
    </div>
  )
}

export function AgentFormPage() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [section, setSection] = useState<Section>('Basic Information')
  const [values, setValues] = useState<AgentFormValues>(defaultAgentFormValues)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const { data, isLoading } = useQuery({
    queryKey: ['agent', id],
    queryFn: () => agentsService.get(id!),
    enabled: isEdit,
  })

  useEffect(() => {
    if (data?.success && data.data) {
      const a = data.data
      setValues({
        name: a.name,
        description: a.description,
        status: a.status,
        voiceProvider: a.voiceProvider,
        voice: a.voice,
        language: a.language,
        speed: a.speed,
        pitch: a.pitch,
        modelProvider: a.modelProvider,
        model: a.model,
        temperature: a.temperature,
        maxTokens: a.maxTokens,
        systemInstructions: a.systemInstructions,
        greeting: a.greeting,
        personality: a.personality,
        rules: a.rules,
        goals: a.goals,
        fallback: a.fallback,
        knowledgeBaseId: a.knowledgeBaseId ?? '',
        businessName: a.businessName ?? '',
        industry: a.industry ?? '',
        businessDescription: a.businessDescription ?? '',
        productsServices: a.productsServices ?? '',
        trainingContext: a.trainingContext ?? '',
        trainingFaqs: a.trainingFaqs ?? [],
        phoneNumberId: a.phoneNumberId ?? '',
        callerId: a.callerId ?? '',
        callTimeout: a.callTimeout,
        retryCount: a.retryCount,
      })
    }
  }, [data])

  const saveMutation = useMutation({
    mutationFn: async () => {
      const parsed = agentFormSchema.safeParse(values)
      if (!parsed.success) {
        const next: Record<string, string> = {}
        for (const issue of parsed.error.issues) {
          const key = String(issue.path[0] ?? 'form')
          next[key] = issue.message
        }
        setErrors(next)
        throw new Error('Validation failed')
      }
      setErrors({})
      const payload = {
        ...parsed.data,
        knowledgeBaseId: parsed.data.knowledgeBaseId || undefined,
        phoneNumberId: parsed.data.phoneNumberId || undefined,
        callerId: parsed.data.callerId || undefined,
      }
      if (isEdit && id) return agentsService.update(id, payload)
      return agentsService.create(payload)
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['agents'] })
      if (res.success && res.data) navigate(agentDetailPath(res.data.id))
      else navigate(ROUTES.AGENTS)
    },
  })

  const set = <K extends keyof AgentFormValues>(key: K, value: AgentFormValues[K]) =>
    setValues((prev) => ({ ...prev, [key]: value }))

  if (isEdit && isLoading) {
    return <div className="box box-body">Loading agent…</div>
  }

  return (
    <>
      <BreadCrumb
        activePage={isEdit ? 'Edit Agent' : 'Create Agent'}
        breadcrumbs={[
          { label: 'AI Agents', href: ROUTES.AGENTS },
        ]}
      />

      <div className="grid grid-cols-12 gap-4">
        <div className="xl:col-span-3 col-span-12">
          <div className="box">
            <div className="box-body p-0">
              <nav className="flex flex-col">
                {SECTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    className={`text-start px-4 py-3 border-b border-defaultborder ${
                      section === s ? 'bg-primary-transparent text-primary font-medium' : ''
                    }`}
                    onClick={() => setSection(s)}
                  >
                    {s}
                  </button>
                ))}
              </nav>
            </div>
          </div>
        </div>

        <div className="xl:col-span-9 col-span-12">
          <div className="box">
            <div className="box-header flex items-center justify-between">
              <div className="box-title">{section}</div>
              <div className="flex gap-2">
                <Link to={ROUTES.AGENTS} className="ti-btn ti-btn-outline-light ti-btn-sm">
                  Cancel
                </Link>
                <button
                  type="button"
                  className="ti-btn ti-btn-primary ti-btn-sm"
                  disabled={saveMutation.isPending}
                  onClick={() => saveMutation.mutate()}
                >
                  {saveMutation.isPending ? 'Saving…' : 'Save Agent'}
                </button>
              </div>
            </div>
            <div className="box-body">
              {section === 'Basic Information' && (
                <>
                  <Field label="Agent Name">
                    <input
                      className="form-control"
                      value={values.name}
                      onChange={(e) => set('name', e.target.value)}
                    />
                    {errors.name && <div className="text-danger fs-12 mt-1">{errors.name}</div>}
                  </Field>
                  <Field label="Description">
                    <textarea
                      className="form-control"
                      rows={3}
                      value={values.description}
                      onChange={(e) => set('description', e.target.value)}
                    />
                  </Field>
                  <Field label="Status">
                    <select
                      className="form-control"
                      value={values.status}
                      onChange={(e) =>
                        set('status', e.target.value as AgentFormValues['status'])
                      }
                    >
                      <option value="draft">Draft</option>
                      <option value="active">Active</option>
                      <option value="paused">Paused</option>
                      <option value="archived">Archived</option>
                    </select>
                  </Field>
                </>
              )}

              {section === 'Voice' && (
                <>
                  <Field label="Voice">
                    <select
                      className="form-select"
                      value={values.voice}
                      onChange={(e) => {
                        const preset = VOICE_PRESETS.find((p) => p.id === e.target.value)
                        set('voice', e.target.value)
                        if (preset) set('voiceProvider', preset.provider)
                      }}
                    >
                      {VOICE_PRESETS.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.label}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Provider">
                    <input
                      className="form-control"
                      value={values.voiceProvider}
                      onChange={(e) => set('voiceProvider', e.target.value)}
                    />
                  </Field>
                  <Field label="Language">
                    <select
                      className="form-select"
                      value={values.language}
                      onChange={(e) => set('language', e.target.value)}
                    >
                      <option value="en">English (US)</option>
                      <option value="en-GB">English (UK)</option>
                    </select>
                  </Field>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Speech speed">
                      <input
                        type="range"
                        min="0.8"
                        max="1.1"
                        step="0.02"
                        className="form-range"
                        value={values.speed}
                        onChange={(e) => set('speed', Number(e.target.value))}
                      />
                      <span className="fs-12 text-textmuted">{values.speed.toFixed(2)}</span>
                    </Field>
                    <Field label="Voice warmth (pitch)">
                      <input
                        type="range"
                        min="0.9"
                        max="1.2"
                        step="0.02"
                        className="form-range"
                        value={values.pitch}
                        onChange={(e) => set('pitch', Number(e.target.value))}
                      />
                      <span className="fs-12 text-textmuted">{values.pitch.toFixed(2)}</span>
                    </Field>
                  </div>
                  <p className="text-textmuted fs-12 mb-0">
                    Sarah uses natural female TTS (Microsoft Zira on Windows). Restart backend after
                    changing voice.
                  </p>
                </>
              )}

              {section === 'AI Model' && (
                <>
                  <Field label="Provider">
                    <input
                      className="form-control"
                      value={values.modelProvider}
                      onChange={(e) => set('modelProvider', e.target.value)}
                    />
                  </Field>
                  <Field label="Model">
                    <input
                      className="form-control"
                      value={values.model}
                      onChange={(e) => set('model', e.target.value)}
                    />
                  </Field>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Temperature">
                      <input
                        type="number"
                        step="0.1"
                        className="form-control"
                        value={values.temperature}
                        onChange={(e) => set('temperature', Number(e.target.value))}
                      />
                    </Field>
                    <Field label="Max Tokens">
                      <input
                        type="number"
                        className="form-control"
                        value={values.maxTokens}
                        onChange={(e) => set('maxTokens', Number(e.target.value))}
                      />
                    </Field>
                  </div>
                  <Field label="System Instructions">
                    <textarea
                      className="form-control"
                      rows={4}
                      value={values.systemInstructions}
                      onChange={(e) => set('systemInstructions', e.target.value)}
                    />
                  </Field>
                </>
              )}

              {section === 'Behavior' && (
                <>
                  <Field label="Greeting">
                    <textarea
                      className="form-control"
                      rows={2}
                      value={values.greeting}
                      onChange={(e) => set('greeting', e.target.value)}
                    />
                  </Field>
                  <Field label="Personality">
                    <input
                      className="form-control"
                      value={values.personality}
                      onChange={(e) => set('personality', e.target.value)}
                    />
                  </Field>
                  <Field label="Rules">
                    <textarea
                      className="form-control"
                      rows={2}
                      value={values.rules}
                      onChange={(e) => set('rules', e.target.value)}
                    />
                  </Field>
                  <Field label="Goals">
                    <textarea
                      className="form-control"
                      rows={2}
                      value={values.goals}
                      onChange={(e) => set('goals', e.target.value)}
                    />
                  </Field>
                  <Field label="Fallback">
                    <textarea
                      className="form-control"
                      rows={2}
                      value={values.fallback}
                      onChange={(e) => set('fallback', e.target.value)}
                    />
                  </Field>
                </>
              )}

              {section === 'Knowledge' && (
                <AgentTrainingFields values={values} set={set} />
              )}

              {section === 'Calling' && (
                <>
                  <Field label="Phone Number ID">
                    <input
                      className="form-control"
                      placeholder="pn_…"
                      value={values.phoneNumberId}
                      onChange={(e) => set('phoneNumberId', e.target.value)}
                    />
                  </Field>
                  <Field label="Caller ID">
                    <input
                      className="form-control"
                      value={values.callerId}
                      onChange={(e) => set('callerId', e.target.value)}
                    />
                  </Field>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Call Timeout (sec)">
                      <input
                        type="number"
                        className="form-control"
                        value={values.callTimeout}
                        onChange={(e) => set('callTimeout', Number(e.target.value))}
                      />
                    </Field>
                    <Field label="Retry Count">
                      <input
                        type="number"
                        className="form-control"
                        value={values.retryCount}
                        onChange={(e) => set('retryCount', Number(e.target.value))}
                      />
                    </Field>
                  </div>
                </>
              )}

              {saveMutation.isError && (
                <p className="text-danger mb-0 mt-3">
                  Please fix validation errors before saving.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export function CreateAgentPage() {
  return <AgentFormPage />
}

export function EditAgentPage() {
  return <AgentFormPage />
}
