/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string
  readonly VITE_APP_NAME?: string
  /** Public domain; forms, chat and tracking hosts derive from it unless set below. */
  readonly VITE_APP_DOMAIN?: string
  readonly VITE_FORMS_URL?: string
  readonly VITE_CHAT_URL?: string
  readonly VITE_SALES_EMAIL?: string
  readonly VITE_USE_MOCKS?: string
  /** Development only: demo login shown on the sign-in page (matches SEED_ADMIN_* in the backend). */
  readonly VITE_DEMO_EMAIL?: string
  readonly VITE_DEMO_PASSWORD?: string
  /** "true" enables the demo account in production builds. */
  readonly VITE_DEMO_MODE?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
