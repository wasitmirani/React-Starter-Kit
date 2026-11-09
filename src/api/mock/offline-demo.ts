import { AxiosError, AxiosHeaders, type AxiosAdapter, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios'
import type { AuthUser, Membership, Profile, UserSession } from '@/types/auth.types'
import { ALL_PERMISSIONS, ROLE_PRESETS } from '@/constants/permissions.constants'
import type { ApiKey, AuditLogEntry, Invitation, Member, Permission, Role, Tenant, TenantSettings } from '@/types/workspace.types'

/**
 * Offline demo session: lets the demo account sign in when the backend or its
 * database is unreachable. Everything stays in this browser; nothing reaches a server.
 * Foundation endpoints (auth, workspace, team, roles, API keys, audit) are answered
 * by `offlineAdapter`; product modules already use the mock API.
 */

export const OFFLINE_TOKEN = 'offline-demo-session'
const STORE_KEY = 'birdcrm.offline-demo.v1'
const TENANT_ID = 'offline-demo-workspace'
const now = () => new Date().toISOString()

/** Full catalogue: foundation + product permissions (see constants/permissions.constants.ts). */
const PERMISSIONS: Permission[] = ALL_PERMISSIONS
const ALL = PERMISSIONS.map((p) => p.key)

interface Store {
  user: AuthUser
  tenant: Tenant
  settings: TenantSettings
  roles: Role[]
  members: Member[]
  invitations: Invitation[]
  apiKeys: ApiKey[]
  audit: AuditLogEntry[]
}

function seed(email: string): Store {
  const at = new Date(Date.now() - 30 * 86_400_000).toISOString()
  const user: AuthUser = { id: 'offline-user', name: 'Demo Admin', email, emailVerified: true, isPlatformAdmin: false, mfaEnabled: false, avatarUrl: null, lastLoginAt: now(), createdAt: at }
  const role = (id: string, key: string, name: string, description: string, permissions: string[]): Role => ({ id, key, name, description, isSystem: true, permissions })
  const roles = ROLE_PRESETS.map((p) => role(`role-${p.key === 'marketing_manager' ? 'marketing' : p.key === 'support_agent' ? 'support' : p.key}`, p.key, p.name, p.description, p.permissions))
  const member = (id: string, name: string, mail: string, roleIdx: number, status: Member['status'] = 'active'): Member => ({
    id, status, joinedAt: at, user: { id: `u-${id}`, name, email: mail, avatarUrl: null }, role: { id: roles[roleIdx].id, key: roles[roleIdx].key, name: roles[roleIdx].name },
  })
  return {
    user,
    tenant: { id: TENANT_ID, name: 'Demo Workspace', slug: 'demo-workspace', status: 'active', createdAt: at, updatedAt: at },
    settings: { tenantId: TENANT_ID, timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC', locale: 'en', settings: {}, updatedAt: at },
    roles,
    members: [
      { ...member('m-owner', user.name, email, 0), user: { id: user.id, name: user.name, email, avatarUrl: null } },
      member('m-2', 'Ayesha Raza', 'ayesha@northwind.io', 1),
      member('m-3', 'Daniel Brooks', 'daniel@northwind.io', 4),
      member('m-4', 'Mei Lin', 'mei@northwind.io', 2),
      member('m-5', 'Carlos Vega', 'carlos@northwind.io', 5, 'suspended'),
      member('m-6', 'Hannah Becker', 'hannah.b@northwind.io', 3),
    ],
    invitations: [{ id: 'inv-1', email: 'hannah@northwind.io', expiresAt: new Date(Date.now() + 5 * 86_400_000).toISOString(), createdAt: now(), role: { id: 'role-viewer', key: 'viewer', name: 'Viewer' }, invitedBy: { id: user.id, name: user.name } }],
    apiKeys: [{ id: 'key-1', name: 'Website signup form', prefix: 'bk_live_7f3a', scopes: ['contacts.write'], createdBy: user.name, lastUsedAt: now(), expiresAt: null, revokedAt: null, createdAt: at }],
    audit: [
      ['auth.login', 'user'],
      ['member.invited', 'invitation'],
      ['api_key.created', 'api_key'],
      ['role.updated', 'role'],
    ].map(([action, targetType], i) => ({ id: `audit-${i}`, tenantId: TENANT_ID, actorType: 'user' as const, actorId: user.id, action, targetType, targetId: null, metadata: {}, ip: '127.0.0.1', userAgent: 'Offline demo', requestId: null, createdAt: new Date(Date.now() - i * 3_600_000).toISOString() })),
  }
}

function load(): Store | null {
  try {
    const raw = localStorage.getItem(STORE_KEY)
    if (!raw) return null
    const s = JSON.parse(raw) as Store
    // System roles follow the current presets; custom roles are kept as saved.
    const presets = new Map(ROLE_PRESETS.map((p) => [p.key, p]))
    s.roles = s.roles.map((r) => (r.isSystem && presets.has(r.key) ? { ...r, name: presets.get(r.key)!.name, description: presets.get(r.key)!.description, permissions: presets.get(r.key)!.permissions } : r))
    for (const p of ROLE_PRESETS) if (!s.roles.some((r) => r.key === p.key)) s.roles.push({ id: `role-${p.key}`, key: p.key, name: p.name, description: p.description, isSystem: true, permissions: p.permissions })
    return s
  } catch {
    return null
  }
}
const save = (s: Store) => localStorage.setItem(STORE_KEY, JSON.stringify(s))

function membership(s: Store): Membership {
  const owner = s.roles[0]
  return { memberId: 'm-owner', tenant: { id: s.tenant.id, name: s.tenant.name, slug: s.tenant.slug, status: s.tenant.status }, role: { id: owner.id, key: owner.key, name: owner.name }, permissions: ALL }
}

export const offlineDemo = {
  isActive: (): boolean => localStorage.getItem('access_token') === OFFLINE_TOKEN,

  /** Creates (or resumes) the local session and returns its profile. */
  start(email: string): Profile {
    const store = load() ?? seed(email)
    save(store)
    return { user: store.user, memberships: [membership(store)] }
  },

  profile(): Profile {
    const store = load() ?? seed('demo@example.com')
    return { user: store.user, memberships: [membership(store)] }
  },
}

// ---------- adapter ----------

function ok<T>(config: InternalAxiosRequestConfig, data: T, status = 200): AxiosResponse {
  return { data: { success: true, statusCode: status, message: 'OK', data, timestamp: now() }, status, statusText: 'OK', headers: new AxiosHeaders(), config }
}

function fail(config: InternalAxiosRequestConfig, status: number, code: string, message: string): never {
  const response: AxiosResponse = { data: { success: false, statusCode: status, code, message, requestId: null }, status, statusText: code, headers: new AxiosHeaders(), config }
  throw new AxiosError(message, String(status), config, null, response)
}

const body = <T>(config: InternalAxiosRequestConfig): T => (typeof config.data === 'string' ? JSON.parse(config.data || '{}') : config.data ?? {}) as T
const keyId = () => Math.random().toString(36).slice(2, 10)

function audit(s: Store, action: string, targetType: string) {
  s.audit.unshift({ id: `audit-${keyId()}`, tenantId: TENANT_ID, actorType: 'user', actorId: s.user.id, action, targetType, targetId: null, metadata: {}, ip: '127.0.0.1', userAgent: 'Offline demo', requestId: null, createdAt: now() })
}

/** Serves the foundation API from local storage while the offline demo session is active. */
export const offlineAdapter: AxiosAdapter = async (config) => {
  await new Promise((r) => setTimeout(r, 120))
  const s = load() ?? seed('demo@example.com')
  const method = (config.method ?? 'get').toLowerCase()
  const path = (config.url ?? '').replace(/^https?:\/\/[^/]+/, '').replace(/^\/api\/v1/, '').split('?')[0]
  const parts = path.split('/').filter(Boolean)
  const route = `${method} /${parts.map((p, i) => (i > 0 && /^(offline-|m-|role-|inv-|key-|session-)/.test(p) ? ':id' : p)).join('/')}`
  const id = parts.find((p, i) => i > 0 && /^(m-|role-|inv-|key-|session-)/.test(p))
  const done = <T>(data: T, status = 200) => {
    save(s)
    return ok(config, data, status)
  }

  switch (route) {
    case 'get /auth/me':
      return ok(config, { user: s.user, memberships: [membership(s)] })
    case 'post /auth/logout':
      return ok(config, null)
    case 'get /auth/sessions':
      return ok(config, [{ id: 'session-current', userAgent: navigator.userAgent, ip: '127.0.0.1', createdAt: s.user.lastLoginAt ?? now(), lastUsedAt: now(), expiresAt: new Date(Date.now() + 7 * 86_400_000).toISOString(), current: true } satisfies UserSession])
    case 'post /auth/email/resend':
      return ok(config, null, 202)
    case 'patch /users/me':
      s.user = { ...s.user, ...body<{ name: string }>(config) }
      s.members[0].user.name = s.user.name
      return done(s.user)
    case 'get /tenants/:id':
      return ok(config, s.tenant)
    case 'patch /tenants/:id':
      s.tenant = { ...s.tenant, ...body<{ name: string }>(config), updatedAt: now() }
      audit(s, 'tenant.updated', 'tenant')
      return done(s.tenant)
    case 'get /tenants/:id/settings':
      return ok(config, s.settings)
    case 'patch /tenants/:id/settings':
      s.settings = { ...s.settings, ...body<Partial<TenantSettings>>(config), updatedAt: now() }
      return done(s.settings)
    case 'get /tenants/:id/members':
      return ok(config, s.members)
    case 'patch /tenants/:id/members/:id': {
      const patch = body<{ roleId?: string; status?: Member['status'] }>(config)
      const role = s.roles.find((r) => r.id === patch.roleId)
      s.members = s.members.map((m) => (m.id === id ? { ...m, status: patch.status ?? m.status, role: role ? { id: role.id, key: role.key, name: role.name } : m.role } : m))
      audit(s, 'member.updated', 'member')
      return done(s.members.find((m) => m.id === id))
    }
    case 'delete /tenants/:id/members/:id':
      s.members = s.members.filter((m) => m.id !== id)
      audit(s, 'member.removed', 'member')
      return done(null, 204)
    case 'get /permissions':
      return ok(config, PERMISSIONS)
    case 'get /roles':
      return ok(config, s.roles)
    case 'post /roles': {
      const b = body<{ name: string; description?: string; permissions: string[] }>(config)
      const role: Role = { id: `role-${keyId()}`, key: b.name.toLowerCase().replace(/\W+/g, '_'), name: b.name, description: b.description ?? null, isSystem: false, permissions: b.permissions }
      s.roles.push(role)
      audit(s, 'role.created', 'role')
      return done(role, 201)
    }
    case 'patch /roles/:id':
      s.roles = s.roles.map((r) => (r.id === id ? { ...r, ...body<Partial<Role>>(config) } : r))
      audit(s, 'role.updated', 'role')
      return done(s.roles.find((r) => r.id === id))
    case 'delete /roles/:id':
      s.roles = s.roles.filter((r) => r.id !== id || r.isSystem)
      return done(null, 204)
    case 'get /invitations':
      return ok(config, s.invitations)
    case 'post /invitations': {
      const b = body<{ email: string; roleId: string }>(config)
      if (s.members.some((m) => m.user.email === b.email)) fail(config, 409, 'ALREADY_MEMBER', 'This person is already a member.')
      const role = s.roles.find((r) => r.id === b.roleId) ?? s.roles[5]
      const inv: Invitation = { id: `inv-${keyId()}`, email: b.email, expiresAt: new Date(Date.now() + 7 * 86_400_000).toISOString(), createdAt: now(), role: { id: role.id, key: role.key, name: role.name }, invitedBy: { id: s.user.id, name: s.user.name } }
      s.invitations.unshift(inv)
      audit(s, 'member.invited', 'invitation')
      return done({ id: inv.id }, 201)
    }
    case 'post /invitations/:id/resend':
      return ok(config, null)
    case 'delete /invitations/:id':
      s.invitations = s.invitations.filter((i) => i.id !== id)
      return done(null, 204)
    case 'get /api-keys':
      return ok(config, s.apiKeys)
    case 'post /api-keys':
    case 'post /api-keys/:id/rotate': {
      const secret = `bk_live_${keyId()}_${keyId()}${keyId()}`
      let key: ApiKey
      if (id) {
        key = { ...s.apiKeys.find((k) => k.id === id)!, prefix: secret.slice(0, 12) }
        s.apiKeys = s.apiKeys.map((k) => (k.id === id ? key : k))
      } else {
        const b = body<{ name: string; scopes: string[]; expiresAt?: string }>(config)
        key = { id: `key-${keyId()}`, name: b.name, prefix: secret.slice(0, 12), scopes: b.scopes, createdBy: s.user.name, lastUsedAt: null, expiresAt: b.expiresAt ?? null, revokedAt: null, createdAt: now() }
        s.apiKeys.unshift(key)
      }
      audit(s, id ? 'api_key.rotated' : 'api_key.created', 'api_key')
      return done({ apiKey: key, key: secret }, 201)
    }
    case 'delete /api-keys/:id':
      s.apiKeys = s.apiKeys.map((k) => (k.id === id ? { ...k, revokedAt: now() } : k))
      audit(s, 'api_key.revoked', 'api_key')
      return done(null, 204)
    case 'get /audit-logs': {
      const action = (config.params as { action?: string } | undefined)?.action
      return ok(config, { items: s.audit.filter((a) => !action || a.action.startsWith(action)), nextCursor: null })
    }
    default:
      return fail(config, 503, 'OFFLINE_DEMO', 'Not available in the offline demo. Start the backend to use this feature.')
  }
}
