import { httpClient } from '@/api/http-client'
import { API_ENDPOINTS } from '@/constants/api.constants'
import type { ApiResponse, PaginationParams } from '@/types/api.types'
import type {
  Contact,
  CreateContactPayload,
  UpdateContactPayload,
} from '@/types/contact.types'

export const contactsApi = {
  list: (params?: PaginationParams) =>
    httpClient.get<ApiResponse<Contact[]>>(API_ENDPOINTS.CONTACTS.BASE, { params }),

  get: (id: string) =>
    httpClient.get<ApiResponse<Contact>>(API_ENDPOINTS.CONTACTS.BY_ID(id)),

  create: (payload: CreateContactPayload) =>
    httpClient.post<ApiResponse<Contact>>(API_ENDPOINTS.CONTACTS.BASE, payload),

  update: (id: string, payload: UpdateContactPayload) =>
    httpClient.patch<ApiResponse<Contact>>(API_ENDPOINTS.CONTACTS.BY_ID(id), payload),

  remove: (id: string) =>
    httpClient.delete<ApiResponse<null>>(API_ENDPOINTS.CONTACTS.BY_ID(id)),

  importCsv: (file: FormData) =>
    httpClient.post<ApiResponse<{ imported: number }>>(
      API_ENDPOINTS.CONTACTS.IMPORT,
      file,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    ),
}
