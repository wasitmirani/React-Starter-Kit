import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { ROUTES } from '@/constants/routes.constants'

/** Route middleware: requires a valid auth session to render child routes. */
export function RequireAuth() {
  const { isAuthenticated, isBootstrapped } = useAuth()
  const location = useLocation()

  if (!isBootstrapped) {
    return <div className="box box-body">Loading session…</div>
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace state={{ from: location }} />
  }

  return <Outlet />
}
