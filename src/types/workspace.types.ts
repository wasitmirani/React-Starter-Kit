export interface Tenant {
  id: string
  name: string
  slug: string
  status: 'active' | 'suspended'
  createdAt: string
  updatedAt: string
}

export interface TenantSettings {
  tenantId: string
  timezone: string
  locale: string
  settings: Record<string, unknown>
  updatedAt: string
}

export interface Member {
  id: string
  status: 'active' | 'suspended'
  joinedAt: string
  user: { id: string; name: string; email: string; avatarUrl: string | null }
  role: { id: string; key: string; name: string }
}

export interface Permission {
  key: string
  category: string
  description: string
}

export interface Role {
  id: string
  key: string
  name: string
  description: string | null
  isSystem: boolean
  permissions: string[]
}

export interface RolePayload {
  name: string
  description?: string
  permissions: string[]
}

export interface Invitation {
  id: string
  email: string
  expiresAt: string
  createdAt: string
  role: { id: string; key: string; name: string }
  invitedBy: { id: string | null; name: string | null }
}

export interface InvitationPreview {
  email: string
  tenantName: string
  roleName: string
  inviterName: string | null
  expiresAt: string
}

export interface ApiKey {
  id: string
  name: string
  prefix: string
  scopes: string[]
  createdBy: string | null
  lastUsedAt: string | null
  expiresAt: string | null
  revokedAt: string | null
  createdAt: string
}

/** Returned once on create/rotate — `key` is never retrievable again. */
export interface ApiKeySecret {
  apiKey: ApiKey
  key: string
}

export interface AuditLogEntry {
  id: string
  tenantId: string | null
  actorType: 'user' | 'api_key' | 'system'
  actorId: string | null
  action: string
  targetType: string | null
  targetId: string | null
  metadata: Record<string, unknown>
  ip: string | null
  userAgent: string | null
  requestId: string | null
  createdAt: string
}

/** A workspace I belong to (GET /users/me/workspaces). */
export interface MyWorkspace {
  id: string
  name: string
  slug: string
  status: 'active' | 'suspended'
  createdAt: string
  joinedAt: string
  memberStatus: 'active' | 'suspended'
  role: { key: string; name: string }
  isOwner: boolean
  /** Effective plan: unpaid or cancelled counts as free. */
  plan: string
  subscriptionStatus: string | null
  members: number
  ownerName: string | null
}

/** How many workspaces I may own: Free ones and in total. */
export interface WorkspaceAllowance {
  maxFree: number
  maxTotal: number
  ownedFree: number
  ownedTotal: number
  /** Platform admins have no limit. */
  exempt: boolean
  canCreate: boolean
  reason: string | null
}

export interface MyWorkspaces {
  workspaces: MyWorkspace[]
  allowance: WorkspaceAllowance
}
