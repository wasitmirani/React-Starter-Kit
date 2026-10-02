import { Outlet } from 'react-router-dom'

export function MainLayout() {
  return (
    <>
       <div className="body-effect-img"></div>
      <div className="body-top-line"></div>
      <div className="body-bottom-line"></div>
    <Outlet />
    </>
  )
}
