import { Link } from 'react-router-dom'
import { ROUTES } from '@/constants/routes.constants'
import { Button } from '@/components/common/Button'

export function NotFoundPage() {
  return (
    <section className="page error-page">
      <h1>404</h1>
      <p>The page you are looking for does not exist.</p>
      <Link to={ROUTES.HOME}>
        <Button type="button">Go home</Button>
      </Link>
    </section>
  )
}
