import { Outlet } from 'react-router-dom'
import { Sidebar } from '@/layouts/MainLayout'
import Switcher from '@/layouts/MasterLayout/Switcher'
import HeaderMenu from '@/layouts/MasterLayout/Header'

export function MasterLayout() {
  return (
  <>
 <div className="progress-top-bar"></div>

  <Switcher />

  {/* Loader */}
    {/* <div id="loader" >
        <img src="/assets/images/media/loader.svg" alt=""/>
    </div> */}
   {/* Loader */}


   <div className="page">
    <HeaderMenu />

    </div>
   {/* Scroll To Top */}
   <div className="scrollToTop justify-center">
       <span className="arrow leading-none">
           <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="#000000" viewBox="0 0 256 256"><path d="M229.66,114.34l-96-96a8,8,0,0,0-11.32,0l-96,96A8,8,0,0,0,32,128H72v24a8,8,0,0,0,8,8h96a8,8,0,0,0,8-8V128h40a8,8,0,0,0,5.66-13.66ZM176,112a8,8,0,0,0-8,8v24H88V120a8,8,0,0,0-8-8H51.31L128,35.31,204.69,112Zm8,104a8,8,0,0,1-8,8H80a8,8,0,0,1,0-16h96A8,8,0,0,1,184,216Zm0-32a8,8,0,0,1-8,8H80a8,8,0,0,1,0-16h96A8,8,0,0,1,184,184Z"></path></svg>
       </span>
   </div>

   <div id="responsive-overlay"></div>
    </>
  )
}
