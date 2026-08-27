import { ROUTES } from '@/constants/routes.constants'

export const publicRoutes = [
  ROUTES.LOGIN,
  ROUTES.REGISTER,
  ROUTES.FORGOT_PASSWORD,
  ROUTES.RESET_PASSWORD,
  ROUTES.VERIFY_EMAIL,
] as const

export const protectedRoutes = [
  ROUTES.DASHBOARD,
  ROUTES.AGENTS,
  ROUTES.CALLS,
  ROUTES.CAMPAIGNS,
  ROUTES.CONTACTS,
  ROUTES.PHONE_NUMBERS,
  ROUTES.ANALYTICS,
  ROUTES.SETTINGS,
  ROUTES.BILLING,
  ROUTES.TEAM_MEMBERS,
  ROUTES.PRODUCTS,
  ROUTES.USERS,
] as const

export const routeTitles: Record<string, string> = {
  [ROUTES.HOME]: 'Home',
  [ROUTES.LOGIN]: 'Login',
  [ROUTES.REGISTER]: 'Register',
  [ROUTES.FORGOT_PASSWORD]: 'Forgot Password',
  [ROUTES.RESET_PASSWORD]: 'Reset Password',
  [ROUTES.VERIFY_EMAIL]: 'Verify Email',
  [ROUTES.ONBOARDING]: 'Onboarding',
  [ROUTES.DASHBOARD]: 'Dashboard',
  [ROUTES.ANALYTICS]: 'Analytics',
  [ROUTES.AGENTS]: 'AI Agents',
  [ROUTES.AGENT_CREATE]: 'Create Agent',
  [ROUTES.CALLS]: 'Calls',
  [ROUTES.CALLS_LIVE]: 'Live Calls',
  [ROUTES.CAMPAIGNS]: 'Campaigns',
  [ROUTES.CAMPAIGN_CREATE]: 'Create Campaign',
  [ROUTES.CONTACTS]: 'Contacts',
  [ROUTES.PHONE_NUMBERS]: 'Phone Numbers',
  [ROUTES.SETTINGS]: 'Settings',
  [ROUTES.BILLING]: 'Billing',
  [ROUTES.TEAM_MEMBERS]: 'Team',
  [ROUTES.PRODUCTS]: 'Products',
  [ROUTES.PRODUCT_CREATE]: 'Create Product',
  [ROUTES.USERS]: 'Users',
}
