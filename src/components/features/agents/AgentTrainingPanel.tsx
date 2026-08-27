import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { knowledgeService } from '@/services/knowledge.service'
import { agentsService } from '@/services/agents.service'
import { useToast } from '@/hooks/useToast'
import { ROUTES, knowledgeDetailPath } from '@/constants/routes.constants'
import { agentFormSchema, type AgentFormValues } from '@/utils/validators/agent.schema'
import type { Agent, AgentTrainingFaq } from '@/types/agent.types'

type SetValues = <K extends keyof AgentFormValues>(
  key: K,
  value: AgentFormValues[K],
) => void

function Field({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div className="mb-3">
      <label className="form-label">{label}</label>
      {hint && <p className="text-textmuted fs-12 mb-1">{hint}</p>}
      {children}
    </div>
  )
}

export function AgentTrainingFields({
  values,
  set,
}: {
  values: AgentFormValues
  set: SetValues
}) {
  const kbQuery = useQuery({
    queryKey: ['knowledge-bases'],
    queryFn: () => knowledgeService.list(),
  })
  const knowledgeBases = kbQuery.data?.success ? kbQuery.data.data : []

  const faqs = values.trainingFaqs ?? []

  const setFaqs = (next: AgentTrainingFaq[]) => set('trainingFaqs', next)

  const addFaq = () => setFaqs([...faqs, { question: '', answer: '' }])

  const updateFaq = (index: number, patch: Partial<AgentTrainingFaq>) => {
    setFaqs(faqs.map((item, i) => (i === index ? { ...item, ...patch } : item)))
  }

  const removeFaq = (index: number) => setFaqs(faqs.filter((_, i) => i !== index))

  const trainingScore = [
    values.businessName,
    values.businessDescription,
    values.productsServices,
    values.trainingContext,
    faqs.some((f) => f.question && f.answer),
    values.knowledgeBaseId,
  ].filter(Boolean).length

  return (
    <div className="agent-training">
      <div className="alert alert-primary-transparent py-2 fs-13 mb-4">
        <strong>Business expert training</strong> — teach your agent about your company, products,
        and FAQs. This data is injected into every customer conversation.
        <div className="mt-1 fs-12">
          Training completeness: {trainingScore}/6 sections filled
        </div>
      </div>

      <h6 className="fw-semibold mb-3">Company profile</h6>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Field label="Business name">
          <input
            className="form-control"
            placeholder="Acme Realty"
            value={values.businessName ?? ''}
            onChange={(e) => set('businessName', e.target.value)}
          />
        </Field>
        <Field label="Industry">
          <input
            className="form-control"
            placeholder="Real estate, SaaS, healthcare…"
            value={values.industry ?? ''}
            onChange={(e) => set('industry', e.target.value)}
          />
        </Field>
      </div>

      <Field
        label="What your business does"
        hint="Describe your company in 2–4 sentences — the agent uses this as core context."
      >
        <textarea
          className="form-control"
          rows={3}
          placeholder="We help home buyers find properties in the Bay Area…"
          value={values.businessDescription ?? ''}
          onChange={(e) => set('businessDescription', e.target.value)}
        />
      </Field>

      <Field
        label="Products & services"
        hint="List offerings, pricing tiers, packages, or service areas."
      >
        <textarea
          className="form-control"
          rows={3}
          placeholder="- Buyer consultation\n- Listing support\n- Mortgage referrals"
          value={values.productsServices ?? ''}
          onChange={(e) => set('productsServices', e.target.value)}
        />
      </Field>

      <Field
        label="Expert knowledge & scripts"
        hint="Policies, objection handling, brand voice, compliance notes, call scripts."
      >
        <textarea
          className="form-control"
          rows={5}
          placeholder="Always mention our 30-day guarantee. Never quote prices without a consultation…"
          value={values.trainingContext ?? ''}
          onChange={(e) => set('trainingContext', e.target.value)}
        />
      </Field>

      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h6 className="fw-semibold mb-0">Training FAQs</h6>
            <p className="text-textmuted fs-12 mb-0">
              Common customer questions — agent answers from this first.
            </p>
          </div>
          <button type="button" className="ti-btn ti-btn-outline-primary ti-btn-sm" onClick={addFaq}>
            <i className="ri-add-line me-1" />
            Add FAQ
          </button>
        </div>

        {faqs.length === 0 && (
          <div className="text-textmuted fs-13 py-3 text-center border border-dashed rounded-lg">
            No FAQs yet. Add questions your customers ask most often.
          </div>
        )}

        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <div key={index} className="border rounded-lg p-3 bg-bodybg">
              <div className="flex justify-between items-start gap-2 mb-2">
                <span className="badge bg-primary-transparent fs-11">FAQ {index + 1}</span>
                <button
                  type="button"
                  className="ti-btn ti-btn-sm ti-btn-icon ti-btn-outline-danger"
                  aria-label="Remove FAQ"
                  onClick={() => removeFaq(index)}
                >
                  <i className="ri-delete-bin-line" />
                </button>
              </div>
              <input
                className="form-control mb-2"
                placeholder="Customer question"
                value={faq.question}
                onChange={(e) => updateFaq(index, { question: e.target.value })}
              />
              <textarea
                className="form-control"
                rows={2}
                placeholder="Expert answer the agent should give"
                value={faq.answer}
                onChange={(e) => updateFaq(index, { answer: e.target.value })}
              />
            </div>
          ))}
        </div>
      </div>

      <h6 className="fw-semibold mb-3">Knowledge base (documents)</h6>
      <Field
        label="Linked knowledge base"
        hint="Attach indexed documents for deeper business context."
      >
        <select
          className="form-select"
          value={values.knowledgeBaseId ?? ''}
          onChange={(e) => set('knowledgeBaseId', e.target.value)}
        >
          <option value="">None — use training fields above only</option>
          {knowledgeBases.map((kb) => (
            <option key={kb.id} value={kb.id}>
              {kb.name} ({kb.documentCount} docs · {kb.status})
            </option>
          ))}
        </select>
      </Field>

      {values.knowledgeBaseId && (
        <Link
          to={knowledgeDetailPath(values.knowledgeBaseId)}
          className="ti-btn ti-btn-outline-light ti-btn-sm mb-3"
        >
          <i className="ri-folder-open-line me-1" />
          Manage documents
        </Link>
      )}

      <Link to={ROUTES.KNOWLEDGE} className="fs-12 text-primary">
        Open Knowledge Bases →
      </Link>
    </div>
  )
}

export function buildTrainingPreview(values: AgentFormValues): string {
  const parts: string[] = []
  if (values.businessName || values.industry) {
    parts.push(
      `Business: ${values.businessName || '—'}${values.industry ? ` (${values.industry})` : ''}`,
    )
  }
  if (values.businessDescription?.trim()) parts.push(values.businessDescription.trim())
  if (values.productsServices?.trim()) parts.push(`Products/Services:\n${values.productsServices.trim()}`)
  if (values.trainingContext?.trim()) parts.push(`Expert notes:\n${values.trainingContext.trim()}`)
  const faqs = (values.trainingFaqs ?? []).filter((f) => f.question.trim() && f.answer.trim())
  if (faqs.length) {
    parts.push(
      'FAQs:\n' +
        faqs.map((f) => `Q: ${f.question.trim()}\nA: ${f.answer.trim()}`).join('\n\n'),
    )
  }
  return parts.join('\n\n') || 'Add training data above to preview context injected into calls.'
}

function agentToFormValues(agent: Agent): AgentFormValues {
  return {
    name: agent.name,
    description: agent.description,
    status: agent.status,
    voiceProvider: agent.voiceProvider,
    voice: agent.voice,
    language: agent.language,
    speed: agent.speed,
    pitch: agent.pitch,
    modelProvider: agent.modelProvider,
    model: agent.model,
    temperature: agent.temperature,
    maxTokens: agent.maxTokens,
    systemInstructions: agent.systemInstructions,
    greeting: agent.greeting,
    personality: agent.personality,
    rules: agent.rules,
    goals: agent.goals,
    fallback: agent.fallback,
    knowledgeBaseId: agent.knowledgeBaseId ?? '',
    businessName: agent.businessName ?? '',
    industry: agent.industry ?? '',
    businessDescription: agent.businessDescription ?? '',
    productsServices: agent.productsServices ?? '',
    trainingContext: agent.trainingContext ?? '',
    trainingFaqs: agent.trainingFaqs ?? [],
    phoneNumberId: agent.phoneNumberId ?? '',
    callerId: agent.callerId ?? '',
    callTimeout: agent.callTimeout,
    retryCount: agent.retryCount,
  }
}

export function AgentTrainingSavePanel({ agent }: { agent: Agent }) {
  const toast = useToast()
  const queryClient = useQueryClient()
  const [values, setValues] = useState<AgentFormValues>(() => agentToFormValues(agent))
  const [showPreview, setShowPreview] = useState(false)

  useEffect(() => {
    setValues(agentToFormValues(agent))
  }, [agent])

  const set = <K extends keyof AgentFormValues>(key: K, value: AgentFormValues[K]) =>
    setValues((prev) => ({ ...prev, [key]: value }))

  const saveMutation = useMutation({
    mutationFn: async () => {
      const parsed = agentFormSchema.safeParse(values)
      if (!parsed.success) throw new Error('Invalid training data')
      return agentsService.update(agent.id, {
        ...parsed.data,
        knowledgeBaseId: parsed.data.knowledgeBaseId || undefined,
      })
    },
    onSuccess: (res) => {
      if (!res.success) {
        toast.error(res.message ?? 'Could not save training')
        return
      }
      void queryClient.invalidateQueries({ queryKey: ['agent', agent.id] })
      toast.success('Agent training saved — republish to apply on live calls')
    },
    onError: () => toast.error('Could not save training data'),
  })

  return (
    <div className="p-4">
      <AgentTrainingFields values={values} set={set} />
      <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t">
        <button
          type="button"
          className="ti-btn ti-btn-primary"
          disabled={saveMutation.isPending}
          onClick={() => saveMutation.mutate()}
        >
          {saveMutation.isPending ? 'Saving…' : 'Save training'}
        </button>
        <button
          type="button"
          className="ti-btn ti-btn-outline-light"
          onClick={() => setShowPreview((v) => !v)}
        >
          {showPreview ? 'Hide preview' : 'Preview injected context'}
        </button>
      </div>
      {showPreview && (
        <pre className="mt-3 p-3 rounded-lg bg-bodybg fs-12 whitespace-pre-wrap border">
          {buildTrainingPreview(values)}
        </pre>
      )}
    </div>
  )
}
