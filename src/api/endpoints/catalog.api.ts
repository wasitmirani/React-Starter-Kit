import { httpClient } from '@/api/http-client'
import type { ApiResponse } from '@/types/api.types'
import type {
  AgentTemplate,
  VoiceOption,
  PromptSnippet,
  IntegrationItem,
  WorkflowItem,
} from '@/types/catalog.types'

const BASE = {
  templates: '/agent-templates',
  voices: '/voices',
  prompts: '/prompts',
  integrations: '/integrations',
  workflows: '/workflows',
}

export const catalogApi = {
  templates: () => httpClient.get<ApiResponse<AgentTemplate[]>>(BASE.templates),
  voices: () => httpClient.get<ApiResponse<VoiceOption[]>>(BASE.voices),
  prompts: () => httpClient.get<ApiResponse<PromptSnippet[]>>(BASE.prompts),
  integrations: (category?: string) =>
    httpClient.get<ApiResponse<IntegrationItem[]>>(BASE.integrations, {
      params: { category },
    }),
  toggleIntegration: (id: string) =>
    httpClient.post<ApiResponse<IntegrationItem>>(`${BASE.integrations}/${id}/toggle`),
  workflows: () => httpClient.get<ApiResponse<WorkflowItem[]>>(BASE.workflows),
  setWorkflowStatus: (id: string, status: WorkflowItem['status']) =>
    httpClient.patch<ApiResponse<WorkflowItem>>(`${BASE.workflows}/${id}`, { status }),
}
