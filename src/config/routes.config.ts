import { ROUTES } from '@/constants/routes.constants'

export const publicRoutes = [
  ROUTES.LOGIN,
  ROUTES.REGISTER,
  ROUTES.FORGOT_PASSWORD,
  ROUTES.RESET_PASSWORD,
  ROUTES.VERIFY_EMAIL,
  ROUTES.ACCEPT_INVITATION,
] as const

export const routeTitles: Record<string, string> = {
  [ROUTES.HOME]: 'Home',
  [ROUTES.LOGIN]: 'Sign in',
  [ROUTES.REGISTER]: 'Create account',
  [ROUTES.FORGOT_PASSWORD]: 'Forgot password',
  [ROUTES.RESET_PASSWORD]: 'Reset password',
  [ROUTES.VERIFY_EMAIL]: 'Verify email',
  [ROUTES.ACCEPT_INVITATION]: 'Accept invitation',
  [ROUTES.DASHBOARD]: 'Dashboard',
  [ROUTES.ANALYTICS]: 'Analytics',
  [ROUTES.SETTINGS_WORKSPACE]: 'Workspace settings',
  [ROUTES.SETTINGS_TEAM]: 'Team',
  [ROUTES.SETTINGS_ROLES]: 'Roles & permissions',
  [ROUTES.SETTINGS_API_KEYS]: 'API keys',
  [ROUTES.SETTINGS_AUDIT_LOG]: 'Audit log',
  [ROUTES.SETTINGS_PROFILE]: 'My profile',
}
