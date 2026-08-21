import { appConfig } from '@/config/app.config'

export function Footer() {
  return (
    <footer className="main-footer">
      <p>
        © {new Date().getFullYear()} {appConfig.name}
      </p>
    </footer>
  )
}
