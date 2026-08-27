export const PERMISSIONS = {
  AGENTS_VIEW: 'agents.view',
  AGENTS_CREATE: 'agents.create',
  AGENTS_UPDATE: 'agents.update',
  AGENTS_DELETE: 'agents.delete',
  CALLS_VIEW: 'calls.view',
  CALLS_EXPORT: 'calls.export',
  CAMPAIGNS_VIEW: 'campaigns.view',
  CAMPAIGNS_CREATE: 'campaigns.create',
  CAMPAIGNS_START: 'campaigns.start',
  CAMPAIGNS_STOP: 'campaigns.stop',
  BILLING_VIEW: 'billing.view',
  BILLING_MANAGE: 'billing.manage',
  TEAM_VIEW: 'team.view',
  TEAM_MANAGE: 'team.manage',
  CONTACTS_VIEW: 'contacts.view',
  CONTACTS_MANAGE: 'contacts.manage',
  PHONE_NUMBERS_VIEW: 'phone_numbers.view',
  PHONE_NUMBERS_MANAGE: 'phone_numbers.manage',
} as const

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS]

export type Role =
  | 'owner'
  | 'admin'
  | 'manager'
  | 'agent_manager'
  | 'analyst'
  | 'viewer'

const ALL_PERMISSIONS = Object.values(PERMISSIONS)

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  owner: ALL_PERMISSIONS,
  admin: ALL_PERMISSIONS,
  manager: [
    PERMISSIONS.AGENTS_VIEW,
    PERMISSIONS.AGENTS_CREATE,
    PERMISSIONS.AGENTS_UPDATE,
    PERMISSIONS.CALLS_VIEW,
    PERMISSIONS.CALLS_EXPORT,
    PERMISSIONS.CAMPAIGNS_VIEW,
    PERMISSIONS.CAMPAIGNS_CREATE,
    PERMISSIONS.CAMPAIGNS_START,
    PERMISSIONS.CAMPAIGNS_STOP,
    PERMISSIONS.CONTACTS_VIEW,
    PERMISSIONS.CONTACTS_MANAGE,
    PERMISSIONS.PHONE_NUMBERS_VIEW,
    PERMISSIONS.TEAM_VIEW,
    PERMISSIONS.BILLING_VIEW,
  ],
  agent_manager: [
    PERMISSIONS.AGENTS_VIEW,
    PERMISSIONS.AGENTS_CREATE,
    PERMISSIONS.AGENTS_UPDATE,
    PERMISSIONS.CALLS_VIEW,
    PERMISSIONS.CAMPAIGNS_VIEW,
    PERMISSIONS.PHONE_NUMBERS_VIEW,
  ],
  analyst: [
    PERMISSIONS.AGENTS_VIEW,
    PERMISSIONS.CALLS_VIEW,
    PERMISSIONS.CALLS_EXPORT,
    PERMISSIONS.CAMPAIGNS_VIEW,
    PERMISSIONS.CONTACTS_VIEW,
    PERMISSIONS.BILLING_VIEW,
  ],
  viewer: [
    PERMISSIONS.AGENTS_VIEW,
    PERMISSIONS.CALLS_VIEW,
    PERMISSIONS.CAMPAIGNS_VIEW,
    PERMISSIONS.CONTACTS_VIEW,
  ],
}

export function hasPermission(
  role: Role | null | undefined,
  permission: Permission,
): boolean {
  if (!role) return false
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false
}

export function hasAnyPermission(
  role: Role | null | undefined,
  permissions: Permission[],
): boolean {
  return permissions.some((p) => hasPermission(role, p))
}
