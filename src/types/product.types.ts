export interface Product {
  id: string
  name: string
  description: string
  price: number
  category: string
  imageUrl?: string
  stock: number
  createdAt: string
  updatedAt: string
}

export interface ProductFilters {
  search?: string
  category?: string
  minPrice?: number
  maxPrice?: number
}

export interface CreateProductPayload {
  name: string
  description: string
  price: number
  category: string
  stock: number
  imageUrl?: string
}
