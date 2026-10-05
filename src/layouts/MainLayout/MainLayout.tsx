import { Outlet } from 'react-router-dom'
import { NavigationProgress } from '@/components/common/NavigationProgress'

export function MainLayout() {
  return (
    <>
      <NavigationProgress />
      <div className="body-effect-img"></div>
      <div className="body-top-line"></div>
      <div className="body-bottom-line"></div>
      <Outlet />
    </>
  )
}
