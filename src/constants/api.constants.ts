import { API_BASE_URL as ENV_API_BASE_URL } from '@/config/env.config'

export const API_BASE_URL = ENV_API_BASE_URL

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    ME: '/auth/me',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    VERIFY_EMAIL: '/auth/verify-email',
  },
  DASHBOARD: {
    BASE: '/dashboard',
    STATS: '/dashboard/stats',
    ACTIVITY: '/dashboard/activity',
  },
  AGENTS: {
    BASE: '/agents',
    BY_ID: (id: string) => `/agents/${id}`,
    TEST: (id: string) => `/agents/${id}/test`,
    PUBLISH: (id: string) => `/agents/${id}/publish`,
    UNPUBLISH: (id: string) => `/agents/${id}/unpublish`,
    DUPLICATE: (id: string) => `/agents/${id}/duplicate`,
    VERSIONS: (id: string) => `/agents/${id}/versions`,
  },
  CALLS: {
    BASE: '/calls',
    BY_ID: (id: string) => `/calls/${id}`,
    END: (id: string) => `/calls/${id}/end`,
    TURN: (id: string) => `/calls/${id}/turn`,
    SPEAK: (id: string) => `/calls/${id}/speak`,
    TRANSCRIPT: (id: string) => `/calls/${id}/transcript`,
    EVENTS: (id: string) => `/calls/${id}/events`,
    RECORDING: (id: string) => `/calls/${id}/recording`,
    LIVE: '/calls/live',
    DIAL: '/calls/dial',
  },
  ORGANIZATIONS: {
    ME: '/organizations/me',
  },
  CONTACTS: {
    BASE: '/contacts',
    BY_ID: (id: string) => `/contacts/${id}`,
    IMPORT: '/contacts/import',
    EXPORT: '/contacts/export',
  },
  CAMPAIGNS: {
    BASE: '/campaigns',
    BY_ID: (id: string) => `/campaigns/${id}`,
    START: (id: string) => `/campaigns/${id}/start`,
    PAUSE: (id: string) => `/campaigns/${id}/pause`,
    STOP: (id: string) => `/campaigns/${id}/stop`,
  },
  PHONE_NUMBERS: {
    BASE: '/phone-numbers',
    BY_ID: (id: string) => `/phone-numbers/${id}`,
    SEARCH: '/phone-numbers/search',
    BUY: '/phone-numbers/buy',
    RELEASE: (id: string) => `/phone-numbers/${id}/release`,
    WHATSAPP: '/phone-numbers/whatsapp',
    PROVIDERS: '/phone-numbers/providers',
  },
  KNOWLEDGE_BASES: {
    BASE: '/knowledge-bases',
    BY_ID: (id: string) => `/knowledge-bases/${id}`,
    DOCUMENTS: (id: string) => `/knowledge-bases/${id}/documents`,
    DOCUMENT: (id: string, documentId: string) =>
      `/knowledge-bases/${id}/documents/${documentId}`,
  },
  ANALYTICS: {
    OVERVIEW: '/analytics/overview',
    CALLS: '/analytics/calls',
    AGENTS: '/analytics/agents',
    CAMPAIGNS: '/analytics/campaigns',
    USAGE: '/analytics/usage',
  },
  BILLING: {
    SUBSCRIPTION: '/billing/subscription',
    USAGE: '/billing/usage',
    INVOICES: '/billing/invoices',
    CHECKOUT: '/billing/checkout',
    PORTAL: '/billing/portal',
  },
  TEAM: {
    MEMBERS: '/team/members',
    ROLES: '/team/roles',
    INVITATIONS: '/team/invitations',
    ACTIVITY: '/team/activity',
  },
  USERS: {
    BASE: '/users',
    ME: '/users/me',
  },
  PRODUCTS: {
    BASE: '/products',
  },
} as const

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  UNPROCESSABLE: 422,
  RATE_LIMIT: 429,
  SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const
