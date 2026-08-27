import { shouldMockModule } from '@/config/env.config'
import { organizationsApi } from '@/api/endpoints/organizations.api'
import type { ApiResponse } from '@/types/api.types'
import type { Organization } from '@/store/organization.store'
import { useOrganizationStore } from '@/store/organization.store'
import { delay, ok, fail } from '@/lib/mock'

export const organizationsService = {
  async getMe(): Promise<ApiResponse<Organization>> {
    if (shouldMockModule('organizations')) {
      await delay()
      const current = useOrganizationStore.getState().currentOrganization()
      if (!current) return fail('No organization')
      return ok(current)
    }
    const res = await organizationsApi.me()
    if (!res.data.success || !res.data.data) {
      return fail(res.data.message ?? 'Organization not found')
    }
    const org: Organization = {
      id: String(res.data.data.id),
      name: res.data.data.name,
      slug: res.data.data.slug,
      plan: 'professional',
    }
    useOrganizationStore.getState().setOrganizations([org])
    useOrganizationStore.getState().setCurrentOrganization(org.id)
    return ok(org)
  },

  async updateMe(payload: {
    name?: string
    settings?: Record<string, unknown>
  }): Promise<ApiResponse<Organization>> {
    if (shouldMockModule('organizations')) {
      await delay()
      const current = useOrganizationStore.getState().currentOrganization()
      if (!current) return fail('No organization')
      const next = { ...current, name: payload.name ?? current.name }
      useOrganizationStore.getState().setOrganizations([next])
      return ok(next)
    }
    const res = await organizationsApi.updateMe(payload)
    if (!res.data.success || !res.data.data) {
      return fail(res.data.message ?? 'Update failed')
    }
    const org: Organization = {
      id: String(res.data.data.id),
      name: res.data.data.name,
      slug: res.data.data.slug,
      plan: 'professional',
    }
    useOrganizationStore.getState().setOrganizations([org])
    useOrganizationStore.getState().setCurrentOrganization(org.id)
    return ok(org, res.data.message)
  },
}
