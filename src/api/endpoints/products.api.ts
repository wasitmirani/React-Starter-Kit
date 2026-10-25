import { apiClient } from '@/api/http-client'
import { API_ENDPOINTS } from '@/constants/api.constants'
import type { ApiResponse, PaginatedResponse, PaginationParams } from '@/types/api.types'
import type { CreateProductPayload, Product, ProductFilters } from '@/types/product.types'

/** Product endpoints: list, read, create, update, and delete. */
export const productsApi = {
  /** List products with optional pagination and filters. */
  getAll: (params?: PaginationParams & ProductFilters) =>
    apiClient.get<PaginatedResponse<Product>>(API_ENDPOINTS.PRODUCTS.BASE, { params }),

  /** Fetch a single product by id. */
  getById: (id: string) =>
    apiClient.get<ApiResponse<Product>>(`${API_ENDPOINTS.PRODUCTS.BASE}/${id}`),

  /** Create a new product. */
  create: (payload: CreateProductPayload) =>
    apiClient.post<ApiResponse<Product>>(API_ENDPOINTS.PRODUCTS.BASE, payload),

  /** Partially update an existing product. */
  update: (id: string, payload: Partial<CreateProductPayload>) =>
    apiClient.patch<ApiResponse<Product>>(`${API_ENDPOINTS.PRODUCTS.BASE}/${id}`, payload),

  /** Delete a product by id. */
  remove: (id: string) =>
    apiClient.delete<ApiResponse<null>>(`${API_ENDPOINTS.PRODUCTS.BASE}/${id}`),
}
