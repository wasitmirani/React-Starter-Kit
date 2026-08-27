import type { ReactNode } from 'react'
import { usePermissions } from '@/hooks/usePermissions'
import type { Permission } from '@/config/permissions'

export function Can({
  permission,
  children,
  fallback = null,
}: {
  permission: Permission
  children: ReactNode
  fallback?: ReactNode
}) {
  const { can } = usePermissions()
  if (!can(permission)) return <>{fallback}</>
  return <>{children}</>
}
