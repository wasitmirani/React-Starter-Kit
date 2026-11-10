const ALL_MODULES = ['crm', 'inbox', 'messaging', 'automation', 'channels', 'platform'] as const

function parseMockedModules(raw: string | undefined): ReadonlySet<string> {
  const value = (raw ?? 'false').trim().toLowerCase()
  if (value === 'false' || value === '') return new Set()
  if (value === 'true') return new Set(ALL_MODULES)
  return new Set(value.split(',').map((m) => m.trim()).filter((m) => (ALL_MODULES as readonly string[]).includes(m)))
}

export const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8888/api/v1',
  appName: import.meta.env.VITE_APP_NAME ?? 'BirdCRM',
  /**
   * Product modules served by the in-browser mock API instead of the backend.
   * `VITE_USE_MOCKS=true` mocks every module, `false` none, or a comma list names the
   * modules still mocked (e.g. `automation,platform`). Auth, workspaces, team, roles,
   * API keys and audit always use the real backend.
   */
  mockedModules: parseMockedModules(import.meta.env.VITE_USE_MOCKS),
  /** True while any product module runs on mocks (shows "reset demo data"). */
  useMocks: parseMockedModules(import.meta.env.VITE_USE_MOCKS).size > 0,
  /**
   * Demo sign-in shown on the login page. On in development; in a production build only
   * when VITE_DEMO_MODE=true (e.g. a public demo site), so real deployments never ship it.
   * It also works offline (see api/mock/offline-demo.ts). Match SEED_ADMIN_* in the backend.
   */
  demoAccount:
    (import.meta.env.DEV || import.meta.env.VITE_DEMO_MODE === 'true') && import.meta.env.VITE_DEMO_EMAIL && import.meta.env.VITE_DEMO_PASSWORD
      ? { email: String(import.meta.env.VITE_DEMO_EMAIL), password: String(import.meta.env.VITE_DEMO_PASSWORD) }
      : null,
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
} as const
