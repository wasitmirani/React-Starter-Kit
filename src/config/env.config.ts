export const ALL_MODULES = ['commerce', 'inventory', 'warehouse', 'procurement', 'shipping', 'threepl', 'integrations', 'platform'] as const

function parseMockedModules(raw: string | undefined): ReadonlySet<string> {
  const value = (raw ?? 'false').trim().toLowerCase()
  if (value === 'false' || value === '') return new Set()
  if (value === 'true') return new Set(ALL_MODULES)
  return new Set(value.split(',').map((m) => m.trim()).filter((m) => (ALL_MODULES as readonly string[]).includes(m)))
}

const APP_NAME = (import.meta.env.VITE_APP_NAME ?? 'LinqWorks').trim()
/** Lowercase letters and digits: storage keys, drag types, header names. */
const APP_SLUG = APP_NAME.toLowerCase().replace(/[^a-z0-9]+/g, '').slice(0, 32) || 'app'
const APP_DOMAIN = (import.meta.env.VITE_APP_DOMAIN ?? `${APP_SLUG}.app`).trim()

export const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8888/api/v1',
  /** Product name from VITE_APP_NAME; everything below derives from it and VITE_APP_DOMAIN. */
  appName: APP_NAME,
  appSlug: APP_SLUG,
  appDomain: APP_DOMAIN,
  /** Prefix for environment variables in code snippets, e.g. LINQWORKS_API_KEY. */
  envPrefix: APP_SLUG.toUpperCase(),
  /** Signature header on incoming workflow webhooks (the backend derives the same one). */
  signatureHeader: `X-${APP_NAME.replace(/[^A-Za-z0-9]+/g, '')}-Signature`,
  formsBaseUrl: import.meta.env.VITE_FORMS_URL ?? `https://forms.${APP_DOMAIN}`,
  chatBaseUrl: import.meta.env.VITE_CHAT_URL ?? `https://chat.${APP_DOMAIN}`,
  trackingHost: `track.${APP_DOMAIN}`,
  salesEmail: import.meta.env.VITE_SALES_EMAIL ?? `sales@${APP_DOMAIN}`,
  /**
   * Product modules served by the in-browser mock API instead of the backend.
   * `VITE_USE_MOCKS=true` mocks every module, `false` none, or a comma list names the
   * modules still mocked (e.g. `integrations,platform`). Auth, workspaces, team, roles,
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
