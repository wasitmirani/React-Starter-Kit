import { apiClient } from '@/api/http-client'
import type { ApiResponse } from '@/types/api.types'

/** Platform (master) console. Every call needs a platform-admin account (403 otherwise). */

export type AdminPlanId = 'free' | 'starter' | 'business' | 'enterprise'

export interface AdminPage<T> {
  items: T[]
  total: number
  page: number
  limit: number
}

export interface AdminOverview {
  tenants: { total: number; active: number; suspended: number; new30d: number }
  users: { total: number; disabled: number; platformAdmins: number; new30d: number; active7d: number }
  plans: Record<string, number>
  /** List price × workspaces per plan; no payments are collected yet. */
  estimatedMrr: number
  contacts: number
  messages30d: { total: number; byChannel: Record<string, number>; byStatus: Record<string, number> }
  signups: { day: string; count: number }[]
  topTenants: { id: string; name: string; messages30d: number }[]
}

export interface AdminTenant {
  id: string
  name: string
  slug: string
  status: 'active' | 'suspended'
  plan: AdminPlanId
  cycle: 'monthly' | 'yearly'
  owner: { id: string; name: string; email: string } | null
  members: number
  contacts: number
  messages30d: number
  suspendedAt: string | null
  suspendedReason: string | null
  /** Outgoing messages held by the platform team (the workspace still works). */
  sendingPaused: boolean
  /** Custom limits replace some of the plan's. */
  customLimits: boolean
  lastActiveAt: string | null
  createdAt: string
}

export interface AdminLimits {
  contacts: number | null
  emailsPerMonth: number | null
  emailsPerDay: number | null
  seats: number | null
  activeAutomations: number | null
  features: Record<string, boolean>
}

/** Keys present replace the plan's value; `null` means unlimited. */
export type AdminLimitOverrides = Partial<Omit<AdminLimits, 'features'>> & { features?: Record<string, boolean> }

export interface AdminMember {
  id: string
  userId: string
  name: string
  email: string
  role: { key: string; name: string }
  status: string
  userStatus: string
  lastLoginAt: string | null
  joinedAt: string
}

/** One workspace in full. Unlike the list row, `members` is the member list. */
export interface AdminTenantDetail extends Omit<AdminTenant, 'members'> {
  members: AdminMember[]
  adminNotes: string
  settings: { timezone: string; locale: string } | null
  subscription: { planId?: string; cycle?: string; status?: string; renewsAt?: string; [key: string]: unknown }
  /** In force: the plan's limits with the overrides applied. */
  limits: AdminLimits
  planLimits: AdminLimits
  limitOverrides: AdminLimitOverrides
  sending: { paused: boolean; pausedAt: string | null; reason: string | null }
  usage: Record<string, number>
  invitations: { id: string; email: string; createdAt: string; expiresAt: string }[]
  channels: { id: string; channel: string; provider?: string; name?: string; status?: string; isDefault: boolean; createdAt: string }[]
  audit: AdminAuditEntry[]
}

export interface AdminUser {
  id: string
  name: string
  email: string
  status: 'active' | 'disabled'
  isPlatformAdmin: boolean
  emailVerified: boolean
  mfaEnabled: boolean
  workspaces: number
  lastLoginAt: string | null
  createdAt: string
}

export interface AdminUserDetail extends AdminUser {
  activeSessions: number
  memberships: {
    tenant: { id: string; name: string; slug: string; status: string; plan: string }
    role: { key: string; name: string }
    status: string
  }[]
}

export interface AdminAuditEntry {
  id: string
  action: string
  actorEmail: string | null
  actorType?: string
  tenant?: { id: string; name: string | null } | null
  targetType: string | null
  targetId: string | null
  metadata: Record<string, unknown>
  ip: string | null
  createdAt: string
}

export interface AdminMessaging {
  engine: 'node' | 'go'
  /** Go engine: jobs waiting over 10 minutes (are the workers running?). */
  engineStalled: boolean
  queue: {
    total: number
    byChannel: { channel: string; count: number; oldestAt: string }[]
    jobs: { pending: number; sending: number; sent: number; failed: number }
    oldestJobAt: string | null
  }
  last24h: { channel: string; sent: number; failed: number }[]
  topErrors: { code: string; channel: string; count: number }[]
  workspaces: { id: string; name: string; status: string; sendingPaused: boolean; queued: number; sent7d: number; failed7d: number }[]
  paused: { id: string; name: string; pausedAt: string; reason: string | null }[]
  recentFailures: { id: string; tenantId: string; tenantName: string; channel: string; to: string; code: string | null; provider: string | null; detail: string | null; at: string }[]
}

export interface PlatformSettings {
  announcement: { enabled: boolean; message: string; level: 'info' | 'warning' | 'critical'; link: string }
  signups: { enabled: boolean; closedMessage: string }
}

export interface Announcement {
  message: string
  level: 'info' | 'warning' | 'critical'
  link: string | null
}

export interface TenantQuery {
  page?: number
  limit?: number
  search?: string
  status?: string
  plan?: string
  sort?: string
}

export interface UserQuery {
  page?: number
  limit?: number
  search?: string
  status?: string
  platformAdmin?: string
}

/** Drops empty filters so the API's validation never sees `status=`. */
const clean = (q: object) => Object.fromEntries(Object.entries(q).filter(([, v]) => v !== '' && v != null))

export const adminApi = {
  overview: () => apiClient.get<ApiResponse<AdminOverview>>('/admin/overview'),

  tenants: (q: TenantQuery) => apiClient.get<ApiResponse<AdminPage<AdminTenant>>>('/admin/tenants', { params: clean(q) }),
  tenant: (id: string) => apiClient.get<ApiResponse<AdminTenantDetail>>(`/admin/tenants/${id}`),
  updateTenant: (id: string, body: { name?: string; status?: 'active' | 'suspended'; reason?: string; adminNotes?: string }) =>
    apiClient.patch<ApiResponse<AdminTenantDetail>>(`/admin/tenants/${id}`, body),
  changePlan: (id: string, body: { planId: AdminPlanId; cycle?: 'monthly' | 'yearly'; force?: boolean }) =>
    apiClient.put<ApiResponse<AdminTenantDetail>>(`/admin/tenants/${id}/plan`, body),
  setLimits: (id: string, overrides: AdminLimitOverrides, reason?: string) =>
    apiClient.put<ApiResponse<AdminTenantDetail>>(`/admin/tenants/${id}/limits`, { overrides, ...(reason ? { reason } : {}) }),
  setSending: (id: string, paused: boolean, reason?: string) =>
    apiClient.put<ApiResponse<AdminTenantDetail>>(`/admin/tenants/${id}/sending`, { paused, ...(reason ? { reason } : {}) }),
  /** CSV of the workspaces matching the filters. */
  exportTenants: (q: TenantQuery) =>
    apiClient.get<Blob>('/admin/tenants/export', { params: clean({ ...q, page: undefined, limit: undefined }), responseType: 'blob' }),
  deleteTenant: (id: string, confirm: string) => apiClient.delete<ApiResponse<{ id: string; deleted: true }>>(`/admin/tenants/${id}`, { data: { confirm } }),

  users: (q: UserQuery) => apiClient.get<ApiResponse<AdminPage<AdminUser>>>('/admin/users', { params: clean(q) }),
  user: (id: string) => apiClient.get<ApiResponse<AdminUserDetail>>(`/admin/users/${id}`),
  updateUser: (id: string, body: { status?: 'active' | 'disabled'; isPlatformAdmin?: boolean }) =>
    apiClient.patch<ApiResponse<AdminUserDetail>>(`/admin/users/${id}`, body),

  signOutUser: (id: string) => apiClient.post<ApiResponse<{ revoked: number }>>(`/admin/users/${id}/sign-out`),
  verifyEmail: (id: string) => apiClient.post<ApiResponse<AdminUserDetail>>(`/admin/users/${id}/verify-email`),
  sendPasswordReset: (id: string) => apiClient.post<ApiResponse<{ sent: true }>>(`/admin/users/${id}/password-reset`),

  messaging: () => apiClient.get<ApiResponse<AdminMessaging>>('/admin/messaging'),
  settings: () => apiClient.get<ApiResponse<PlatformSettings>>('/admin/settings'),
  updateSettings: (body: Partial<PlatformSettings>) => apiClient.put<ApiResponse<PlatformSettings>>('/admin/settings', body),

  audit: (q: { page?: number; limit?: number }) => apiClient.get<ApiResponse<AdminPage<AdminAuditEntry>>>('/admin/audit', { params: clean(q) }),
}

/** The platform banner for every signed-in user (not admin-only). */
export const announcementApi = {
  current: () => apiClient.get<ApiResponse<Announcement | null>>('/announcement'),
}
