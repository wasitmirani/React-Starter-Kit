import Switcher from "./Switcher";
import HeaderMenu from "./HeaderMenu";
import SideBar from "./SideBar";
import { Outlet } from "react-router-dom";

const MasterLayout = () => {

    return (
        <>

            <div className="body-effect-img"></div>
            <div className="body-top-line"></div>
            <div className="body-bottom-line"></div>
            {/* Header */}
            <HeaderMenu/>

            {/* Switcher */}
            <Switcher />

            {/* SideBar */}
            <SideBar />

      

            <div id="sidebar-backdrop" className="sidebar-backdrop"></div>
            <div className="min-vh-100 position-relative">
                <div className="page-wrapper">
                    <div className="container-fluid">

                    <Outlet />
                    </div>
                </div>
            </div>

        </>
    )
}
export default MasterLayout;