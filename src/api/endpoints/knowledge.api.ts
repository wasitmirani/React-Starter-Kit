import { httpClient } from '@/api/http-client'
import { API_ENDPOINTS } from '@/constants/api.constants'
import type { ApiResponse } from '@/types/api.types'
import type {
  KnowledgeBase,
  KnowledgeDocument,
  KnowledgeFaq,
  KnowledgeWebsite,
} from '@/types/knowledge.types'

export const knowledgeApi = {
  list: () =>
    httpClient.get<ApiResponse<KnowledgeBase[]>>(API_ENDPOINTS.KNOWLEDGE_BASES.BASE),
  get: (id: string) =>
    httpClient.get<ApiResponse<KnowledgeBase>>(API_ENDPOINTS.KNOWLEDGE_BASES.BY_ID(id)),
  documents: (id: string) =>
    httpClient.get<ApiResponse<KnowledgeDocument[]>>(
      API_ENDPOINTS.KNOWLEDGE_BASES.DOCUMENTS(id),
    ),
  faqs: (id?: string) =>
    httpClient.get<ApiResponse<KnowledgeFaq[]>>(
      id ? `${API_ENDPOINTS.KNOWLEDGE_BASES.BY_ID(id)}/faqs` : '/knowledge-bases/faqs',
    ),
  websites: (id?: string) =>
    httpClient.get<ApiResponse<KnowledgeWebsite[]>>(
      id
        ? `${API_ENDPOINTS.KNOWLEDGE_BASES.BY_ID(id)}/websites`
        : '/knowledge-bases/websites',
    ),
  upload: (id: string, form: FormData) =>
    httpClient.post<ApiResponse<KnowledgeDocument>>(
      API_ENDPOINTS.KNOWLEDGE_BASES.DOCUMENTS(id),
      form,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    ),
}
