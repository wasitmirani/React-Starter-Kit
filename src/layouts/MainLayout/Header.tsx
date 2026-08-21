import { Link } from 'react-router-dom'
import { ROUTES } from '@/constants/routes.constants'
import { appConfig } from '@/config/app.config'
import { useTheme } from '@/contexts/ThemeContext'
import { Button } from '@/components/common/Button'

export function Header() {
  const { theme, toggleTheme } = useTheme()

  return (
    <header className="main-header">
      <Link to={ROUTES.HOME} className="brand">
        {appConfig.name}
      </Link>
      <nav className="main-nav">
        <Link to={ROUTES.DASHBOARD}>Dashboard</Link>
        <Link to={ROUTES.PRODUCTS}>Products</Link>
        <Link to={ROUTES.LOGIN}>Login</Link>
        <Button type="button" variant="ghost" size="sm" onClick={toggleTheme}>
          {theme === 'light' ? 'Dark' : 'Light'}
        </Button>
      </nav>
    </header>
  )
}
