export interface AgentTemplate {
  id: string
  name: string
  category: string
  description: string
  voice: string
  useCases: string[]
}

export interface VoiceOption {
  id: string
  name: string
  provider: string
  language: string
  gender: string
  sampleLabel: string
}

export interface PromptSnippet {
  id: string
  title: string
  category: string
  content: string
}

export interface IntegrationItem {
  id: string
  name: string
  category: 'telephony' | 'crm' | 'calendar' | 'automation' | 'other'
  description: string
  status: 'connected' | 'available' | 'error'
  logoIcon: string
}

export interface WorkflowItem {
  id: string
  name: string
  trigger: string
  status: 'active' | 'draft' | 'paused'
  runs: number
  updatedAt: string
}
