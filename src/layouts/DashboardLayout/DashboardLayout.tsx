import { Outlet } from 'react-router-dom'
import { Sidebar } from '@/layouts/MainLayout'

export function DashboardLayout() {
  return (
    <div className="dashboard-layout">
      <Sidebar />
      <section className="dashboard-content">
        <Outlet />
      </section>
    </div>
  )
}
