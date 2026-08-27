import { shouldMockModule } from '@/config/env.config'
import { catalogApi } from '@/api/endpoints/catalog.api'
import { delay, ok } from '@/lib/mock'
import type { ApiResponse } from '@/types/api.types'
import type {
  AgentTemplate,
  VoiceOption,
  PromptSnippet,
  IntegrationItem,
  WorkflowItem,
} from '@/types/catalog.types'
import {
  mockAgentTemplates,
  mockVoices,
  mockPrompts,
  mockIntegrations,
  mockWorkflows,
} from '@/services/mock/mock-data'

let integrations = [...mockIntegrations]
let workflows = [...mockWorkflows]

export const catalogService = {
  async templates(): Promise<ApiResponse<AgentTemplate[]>> {
    if (shouldMockModule('catalog')) {
      await delay()
      return ok(mockAgentTemplates)
    }
    const res = await catalogApi.templates()
    return res.data
  },

  async voices(): Promise<ApiResponse<VoiceOption[]>> {
    if (shouldMockModule('catalog')) {
      await delay()
      return ok(mockVoices)
    }
    const res = await catalogApi.voices()
    return res.data
  },

  async prompts(): Promise<ApiResponse<PromptSnippet[]>> {
    if (shouldMockModule('catalog')) {
      await delay()
      return ok(mockPrompts)
    }
    const res = await catalogApi.prompts()
    return res.data
  },

  async integrations(category?: string): Promise<ApiResponse<IntegrationItem[]>> {
    if (shouldMockModule('catalog')) {
      await delay()
      const items = category
        ? integrations.filter((i) => i.category === category)
        : integrations
      return ok(items)
    }
    const res = await catalogApi.integrations(category)
    return res.data
  },

  async toggleIntegration(id: string): Promise<ApiResponse<IntegrationItem>> {
    if (shouldMockModule('catalog')) {
      await delay()
      integrations = integrations.map((i) =>
        i.id === id
          ? { ...i, status: i.status === 'connected' ? 'available' : 'connected' }
          : i,
      )
      return ok(integrations.find((i) => i.id === id)!)
    }
    const res = await catalogApi.toggleIntegration(id)
    return res.data
  },

  async workflows(): Promise<ApiResponse<WorkflowItem[]>> {
    if (shouldMockModule('catalog')) {
      await delay()
      return ok(workflows)
    }
    const res = await catalogApi.workflows()
    return res.data
  },

  async setWorkflowStatus(
    id: string,
    status: WorkflowItem['status'],
  ): Promise<ApiResponse<WorkflowItem>> {
    if (shouldMockModule('catalog')) {
      await delay()
      workflows = workflows.map((w) => (w.id === id ? { ...w, status } : w))
      return ok(workflows.find((w) => w.id === id)!)
    }
    const res = await catalogApi.setWorkflowStatus(id, status)
    return res.data
  },
}
