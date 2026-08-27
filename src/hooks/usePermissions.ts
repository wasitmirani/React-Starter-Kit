import { useMemo } from 'react'
import { useAuth } from '@/hooks/useAuth'
import {
  hasAnyPermission,
  hasPermission,
  type Permission,
  type Role,
} from '@/config/permissions'
import type { AuthRole } from '@/types/auth.types'

function toRole(role: AuthRole | undefined): Role | null {
  if (!role || role === 'user') return 'viewer'
  return role
}

export function usePermissions() {
  const { user } = useAuth()
  const role = toRole(user?.role)

  return useMemo(
    () => ({
      role,
      can: (permission: Permission) => hasPermission(role, permission),
      canAny: (permissions: Permission[]) => hasAnyPermission(role, permissions),
    }),
    [role],
  )
}
