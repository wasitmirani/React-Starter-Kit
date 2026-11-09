import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { accessApi } from '@/api/endpoints/access.api'
import { authApi } from '@/api/endpoints/auth.api'
import { tenantsApi } from '@/api/endpoints/tenants.api'
import { useAuthStore } from '@/store/auth.store'

/** Every tenant-scoped key starts with the tenant id so workspaces never share cache entries. */
export const queryKeys = {
  permissions: ['permissions'] as const,
  sessions: ['sessions'] as const,
  tenant: (tenantId: string) => ['tenant', tenantId] as const,
  settings: (tenantId: string) => ['tenant', tenantId, 'settings'] as const,
  members: (tenantId: string) => ['tenant', tenantId, 'members'] as const,
  invitations: (tenantId: string) => ['tenant', tenantId, 'invitations'] as const,
  roles: (tenantId: string) => ['tenant', tenantId, 'roles'] as const,
  apiKeys: (tenantId: string) => ['tenant', tenantId, 'api-keys'] as const,
  auditLog: (tenantId: string, action: string) => ['tenant', tenantId, 'audit-log', action] as const,
}

/** Current workspace id. Tenant-scoped pages only render once it is set. */
export function useTenantId(): string {
  return useAuthStore((s) => s.currentTenantId) as string
}

export function useTenant() {
  const tenantId = useTenantId()
  return useQuery({
    queryKey: queryKeys.tenant(tenantId),
    queryFn: async () => (await tenantsApi.get(tenantId)).data.data,
  })
}

export function useTenantSettings() {
  const tenantId = useTenantId()
  return useQuery({
    queryKey: queryKeys.settings(tenantId),
    queryFn: async () => (await tenantsApi.getSettings(tenantId)).data.data,
  })
}

export function useMembers() {
  const tenantId = useTenantId()
  return useQuery({
    queryKey: queryKeys.members(tenantId),
    queryFn: async () => (await tenantsApi.members(tenantId)).data.data,
  })
}

export function useInvitations(enabled = true) {
  const tenantId = useTenantId()
  return useQuery({
    queryKey: queryKeys.invitations(tenantId),
    queryFn: async () => (await accessApi.invitations()).data.data,
    enabled,
  })
}

export function useRoles(enabled = true) {
  const tenantId = useTenantId()
  return useQuery({
    queryKey: queryKeys.roles(tenantId),
    queryFn: async () => (await accessApi.roles()).data.data,
    enabled,
  })
}

export function usePermissions() {
  return useQuery({
    queryKey: queryKeys.permissions,
    queryFn: async () => (await accessApi.permissions()).data.data,
    staleTime: Infinity,
  })
}

export function useApiKeys() {
  const tenantId = useTenantId()
  return useQuery({
    queryKey: queryKeys.apiKeys(tenantId),
    queryFn: async () => (await accessApi.apiKeys()).data.data,
  })
}

export function useAuditLog(action: string) {
  const tenantId = useTenantId()
  return useInfiniteQuery({
    queryKey: queryKeys.auditLog(tenantId, action),
    queryFn: async ({ pageParam }) =>
      (await accessApi.auditLogs({ cursor: pageParam, limit: 25, action: action || undefined })).data.data,
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => last.nextCursor ?? undefined,
  })
}

export function useSessions() {
  return useQuery({
    queryKey: queryKeys.sessions,
    queryFn: async () => (await authApi.sessions()).data.data,
  })
}
