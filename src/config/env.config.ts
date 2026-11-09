export const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8888/api/v1',
  appName: import.meta.env.VITE_APP_NAME ?? 'BirdCRM',
  /**
   * Serve product modules (CRM, campaigns, inbox…) from the in-browser mock API.
   * Auth, workspaces, team, roles, API keys and audit always use the real backend.
   * Set `VITE_USE_MOCKS=false` once the backend implements the module endpoints.
   */
  useMocks: import.meta.env.VITE_USE_MOCKS !== 'false',
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
