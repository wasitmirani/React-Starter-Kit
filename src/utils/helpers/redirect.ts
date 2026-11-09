import { ROUTES } from '@/constants/routes.constants'

/** Only same-app paths are allowed as post-login destinations (no open redirects). */
export function safeRedirect(target: string | null | undefined): string {
  return target && target.startsWith('/') && !target.startsWith('//') ? target : ROUTES.DASHBOARD
}
