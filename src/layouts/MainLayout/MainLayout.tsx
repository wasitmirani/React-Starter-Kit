import { Outlet } from 'react-router-dom'
import { Header } from './Header'
import { Footer } from './Footer'
import { Toast } from '@/components/ui/Toast'
import { useNotification } from '@/contexts/NotificationContext'

export function MainLayout() {
  const { notifications, dismiss } = useNotification()

  return (
    <div className="main-layout">
      <Header />
      <main className="main-content">
        <Outlet />
      </main>
      <Footer />
      <div className="toast-stack" aria-live="polite">
        {notifications.map((item) => (
          <Toast key={item.id} onClick={() => dismiss(item.id)}>
            {item.message}
          </Toast>
        ))}
      </div>
    </div>
  )
}
