/** Workspace the user last worked in; restored on reload. */
export const CURRENT_TENANT_STORAGE_KEY = 'current_tenant_id'

/** Error codes returned by the API that mean "sign in again". */
export const SESSION_ENDED_CODES = [
  'SESSION_ENDED',
  'INVALID_REFRESH_TOKEN',
  'REFRESH_TOKEN_REUSED',
  'ACCOUNT_DISABLED',
] as const
