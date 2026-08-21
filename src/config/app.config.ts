import { env } from './env.config'

export const appConfig = {
  name: env.appName,
  version: '0.0.0',
  defaultLocale: 'en-US',
  defaultPageSize: 10,
  toastDurationMs: 4000,
} as const
