import { ROUTES } from '@/constants/routes.constants'

export const publicRoutes = [
  ROUTES.LOGIN,
  ROUTES.REGISTER,
  ROUTES.FORGOT_PASSWORD,
] as const

export const protectedRoutes = [
  ROUTES.DASHBOARD,
  ROUTES.ANALYTICS,
  ROUTES.SETTINGS,
  ROUTES.PRODUCTS,
  ROUTES.PRODUCT_CREATE,
] as const

export const routeTitles: Record<string, string> = {
  [ROUTES.HOME]: 'Home',
  [ROUTES.LOGIN]: 'Login',
  [ROUTES.REGISTER]: 'Register',
  [ROUTES.FORGOT_PASSWORD]: 'Forgot Password',
  [ROUTES.DASHBOARD]: 'Dashboard',
  [ROUTES.ANALYTICS]: 'Analytics',
  [ROUTES.SETTINGS]: 'Settings',
  [ROUTES.PRODUCTS]: 'Products',
  [ROUTES.PRODUCT_CREATE]: 'Create Product',
}
