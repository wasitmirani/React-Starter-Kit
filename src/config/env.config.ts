const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000'
const apiPrefix = import.meta.env.VITE_API_PREFIX ?? '/api/v1'
const useMockApi = (import.meta.env.VITE_USE_MOCK_API ?? 'true') === 'true'

/** Backend modules with live FastAPI endpoints — others stay mock when global mock is off. */
const REAL_API_MODULES = new Set([
  'auth',
  'agents',
  'calls',
  'organizations',
  'users',
  'contacts',
  'campaigns',
  'phone-numbers',
  'knowledge',
  'analytics',
  'billing',
  'team',
  'catalog',
  'dashboard',
  'settings',
])

export type ApiModule =
  | 'auth'
  | 'agents'
  | 'calls'
  | 'organizations'
  | 'users'
  | 'contacts'
  | 'campaigns'
  | 'phone-numbers'
  | 'knowledge'
  | 'analytics'
  | 'billing'
  | 'team'
  | 'catalog'
  | 'dashboard'
  | 'settings'

export function shouldMockModule(module: ApiModule): boolean {
  if (useMockApi) return true
  return !REAL_API_MODULES.has(module)
}

export const env = {
  appName: import.meta.env.VITE_APP_NAME ?? 'AI Voice SaaS',
  api: {
    baseUrl: apiBaseUrl,
    prefix: apiPrefix,
  },
  websocket: {
    baseUrl: import.meta.env.VITE_WS_BASE_URL ?? 'ws://localhost:8000',
  },
  appEnv: import.meta.env.VITE_APP_ENV ?? (import.meta.env.DEV ? 'development' : 'production'),
  useMockApi,
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
  /** @deprecated Prefer `API_BASE_URL` export — kept for existing imports. */
  apiBaseUrl: `${apiBaseUrl.replace(/\/$/, '')}${apiPrefix}`,
} as const

export const API_BASE_URL = env.apiBaseUrl
export const WS_BASE_URL = env.websocket.baseUrl

export default env
