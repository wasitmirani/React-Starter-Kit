import { usersApi } from '@/api/endpoints/users.api'
import type { PaginationParams } from '@/types/api.types'
import type { UserProfile } from '@/types/user.types'

export const usersService = {
  async getMe() {
    const { data } = await usersApi.getMe()
    return data.data
  },

  async getUsers(params?: PaginationParams) {
    const { data } = await usersApi.getAll(params)
    return data
  },

  async getUser(id: string) {
    const { data } = await usersApi.getById(id)
    return data.data
  },

  async updateUser(id: string, payload: Partial<UserProfile>) {
    const { data } = await usersApi.update(id, payload)
    return data.data
  },
}
