import { Navigate, createBrowserRouter } from 'react-router-dom'
import { ROUTES } from '@/constants/routes.constants'
import { MainLayout } from '@/layouts/MainLayout'
import { AuthLayout } from '@/layouts/AuthLayout'
import { DashboardLayout } from '@/layouts/MasterLayout'
import {
  LoginPage,
  RegisterPage,
  ForgotPasswordPage,
  DashboardHome,
  AnalyticsPage,
  SettingsPage,
  ProductListPage,
  ProductDetailPage,
  ProductCreatePage,
  NotFoundPage,
} from '@/pages'

export const router = createBrowserRouter([
  {
    path: ROUTES.HOME,
    element: <MainLayout />,
    children: [
      { index: true, element: <Navigate to={ROUTES.DASHBOARD} replace /> },
      {
        element: <AuthLayout />,
        children: [
          { path: ROUTES.LOGIN.slice(1), element: <LoginPage /> },
          { path: ROUTES.REGISTER.slice(1), element: <RegisterPage /> },
          { path: ROUTES.FORGOT_PASSWORD.slice(1), element: <ForgotPasswordPage /> },
        ],
      },
      {
        element: <DashboardLayout />,
        children: [
          { path: ROUTES.DASHBOARD.slice(1), element: <DashboardHome /> },
          { path: ROUTES.ANALYTICS.slice(1), element: <AnalyticsPage /> },
          { path: ROUTES.SETTINGS.slice(1), element: <SettingsPage /> },
          { path: ROUTES.PRODUCTS.slice(1), element: <ProductListPage /> },
          { path: 'products/:id', element: <ProductDetailPage /> },
          { path: ROUTES.PRODUCT_CREATE.slice(1), element: <ProductCreatePage /> },
        ],
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
