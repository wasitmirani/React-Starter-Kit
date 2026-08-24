import { Outlet } from 'react-router-dom'
import { Sidebar } from '@/layouts/MainLayout'
import Switcher from '@/layouts/MasterLayout/Switcher'

export function DashboardLayout() {
  return (
  <>

 <div className="progress-top-bar"></div>
 <Switcher />
    </>
  )
}
