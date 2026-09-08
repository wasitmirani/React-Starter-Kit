import { NavLink } from 'react-router-dom'
import { ROUTES } from '@/constants/routes.constants'

const links = [
  { to: ROUTES.DASHBOARD, label: 'Overview' },
  { to: ROUTES.ANALYTICS, label: 'Analytics' },
  { to: ROUTES.PRODUCTS, label: 'Products' },
  { to: ROUTES.SETTINGS, label: 'Settings' },
]

export function Sidebar() {
  return (
    <>
    Sidebar
    </>
  )
}
