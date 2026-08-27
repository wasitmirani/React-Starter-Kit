import type { Role } from '@/config/permissions'

export interface TeamMember {
  id: string
  name: string
  email: string
  role: Role
  status: 'active' | 'invited' | 'disabled'
  lastActiveAt?: string
  createdAt: string
}

export interface TeamInvitation {
  id: string
  email: string
  role: Role
  status: 'pending' | 'accepted' | 'expired'
  invitedAt: string
  expiresAt: string
}

export interface TeamActivityLog {
  id: string
  actor: string
  action: string
  target: string
  at: string
}

export interface RoleDefinition {
  id: Role
  name: string
  description: string
  permissions: string[]
  memberCount: number
}
