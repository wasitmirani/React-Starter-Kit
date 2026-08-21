import { productsApi } from '@/api/endpoints/products.api'
import type { PaginationParams } from '@/types/api.types'
import type { CreateProductPayload, ProductFilters } from '@/types/product.types'

export const productsService = {
  async getProducts(params?: PaginationParams & ProductFilters) {
    const { data } = await productsApi.getAll(params)
    return data
  },

  async getProduct(id: string) {
    const { data } = await productsApi.getById(id)
    return data.data
  },

  async createProduct(payload: CreateProductPayload) {
    const { data } = await productsApi.create(payload)
    return data.data
  },

  async updateProduct(id: string, payload: Partial<CreateProductPayload>) {
    const { data } = await productsApi.update(id, payload)
    return data.data
  },

  async deleteProduct(id: string) {
    await productsApi.remove(id)
  },
}
