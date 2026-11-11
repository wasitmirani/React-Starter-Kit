export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8888/api/v1'

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    ME: '/auth/me',
    SESSIONS: '/auth/sessions',
    FORGOT_PASSWORD: '/auth/password/forgot',
    RESET_PASSWORD: '/auth/password/reset',
    CHANGE_PASSWORD: '/auth/password/change',
    VERIFY_EMAIL: '/auth/email/verify',
    RESEND_VERIFICATION: '/auth/email/resend',
  },
  USERS: {
    ME: '/users/me',
  },
  TENANTS: '/tenants',
  PERMISSIONS: '/permissions',
  ROLES: '/roles',
  INVITATIONS: '/invitations',
  API_KEYS: '/api-keys',
  AUDIT_LOGS: '/audit-logs',
} as const

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  SERVER_ERROR: 500,
} as const
