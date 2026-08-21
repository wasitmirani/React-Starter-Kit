import { httpClient } from '@/api/http-client'
import { API_ENDPOINTS } from '@/constants/api.constants'
import type { ApiResponse, PaginatedResponse, PaginationParams } from '@/types/api.types'
import type { CreateProductPayload, Product, ProductFilters } from '@/types/product.types'

export const productsApi = {
  getAll: (params?: PaginationParams & ProductFilters) =>
    httpClient.get<PaginatedResponse<Product>>(API_ENDPOINTS.PRODUCTS.BASE, { params }),

  getById: (id: string) =>
    httpClient.get<ApiResponse<Product>>(`${API_ENDPOINTS.PRODUCTS.BASE}/${id}`),

  create: (payload: CreateProductPayload) =>
    httpClient.post<ApiResponse<Product>>(API_ENDPOINTS.PRODUCTS.BASE, payload),

  update: (id: string, payload: Partial<CreateProductPayload>) =>
    httpClient.patch<ApiResponse<Product>>(`${API_ENDPOINTS.PRODUCTS.BASE}/${id}`, payload),

  remove: (id: string) =>
    httpClient.delete<ApiResponse<null>>(`${API_ENDPOINTS.PRODUCTS.BASE}/${id}`),
}
