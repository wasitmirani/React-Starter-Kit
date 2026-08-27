export type AgentStatus = 'draft' | 'active' | 'paused' | 'archived'

export interface AgentTrainingFaq {
  question: string
  answer: string
}

export interface Agent {
  id: string
  name: string
  description: string
  status: AgentStatus
  avatarUrl?: string
  voiceProvider: string
  voice: string
  language: string
  speed: number
  pitch: number
  modelProvider: string
  model: string
  temperature: number
  maxTokens: number
  systemInstructions: string
  greeting: string
  personality: string
  rules: string
  goals: string
  fallback: string
  knowledgeBaseId?: string
  businessName?: string
  industry?: string
  businessDescription?: string
  productsServices?: string
  trainingContext?: string
  trainingFaqs?: AgentTrainingFaq[]
  phoneNumberId?: string
  callerId?: string
  callTimeout: number
  retryCount: number
  createdAt: string
  updatedAt: string
  callsHandled: number
  successRate: number
}

export type CreateAgentPayload = Omit<
  Agent,
  'id' | 'createdAt' | 'updatedAt' | 'callsHandled' | 'successRate'
>

export type UpdateAgentPayload = Partial<CreateAgentPayload>
