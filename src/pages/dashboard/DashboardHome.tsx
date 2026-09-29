export function DashboardHome() {
  return (
  <>
   <div className="gap-2 page-heading mb-4 flex-column flex-md-row">
        <h6 className="flex-grow-1 mb-0">HRM</h6>
        <ul className="breadcrumb flex-shrink-0 mb-0">
            <li className="breadcrumb-item"><a href="#!">Dashboard</a></li>
            <li className="breadcrumb-item active">HRM</li>
        </ul>
    </div>

    <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 row-cols-xxl-5 gx-5">
        <div className="col">
            <div className="card hrm-widget-card position-relative rounded-4">
                <div className="size-8 bg-primary position-absolute top-0 square-1"></div>
                <div className="size-8 bg-gradient-t-primary bg-opacity-75 position-absolute square-2"></div>
                <div className="hrm-widget-curve">
                    <div className="size-10 bg-primary avatar text-white">
                        <i className="ri-group-line fs-lg"></i>
                    </div>
                </div>
                <div className="card-body">
                    <h6 className="fs-17 mb-7 ps-10 mt-n1">Total Employees</h6>
                    <div className="d-flex justify-content-between align-items-end mb-3">
                        <h3 className="mb-0"><span className="counter" data-start="0" data-end="245" data-duration="1000">245</span></h3>
                        <span className="badge bg-success-subtle text-success border border-success-subtle"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" data-lucide="trending-up" aria-hidden="true" className="lucide lucide-trending-up size-3 me-1"><path d="M16 7h6v6"></path><path d="m22 7-8.5 8.5-5-5L2 17"></path></svg>0.05%</span>
                    </div>
                    <span className="text-muted fs-15"><span className="text-success me-1 fw-medium">10%</span> Increased this month</span>
                </div>
            </div>
        </div>
        <div className="col">
            <div className="card hrm-widget-card position-relative rounded-4">
                <div className="size-8 bg-secondary position-absolute top-0 square-1"></div>
                <div className="size-8 bg-gradient-t-secondary bg-opacity-75 position-absolute square-2"></div>
                <div className="hrm-widget-curve">
                    <div className="size-10 bg-secondary avatar text-white">
                        <i className="ri-calendar-check-line fs-lg"></i>
                    </div>
                </div>
                <div className="card-body">
                    <h6 className="fs-17 mb-7 ps-10 mt-n1">Attendance</h6>
                    <div className="d-flex justify-content-between align-items-end mb-3">
                        <h3 className="mb-0"><span className="counter" data-start="0" data-end="210" data-duration="1000">210</span></h3>
                        <span className="badge bg-success-subtle text-success border border-success-subtle">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" data-lucide="trending-up" aria-hidden="true" className="lucide lucide-trending-up size-3 me-1"><path d="M16 7h6v6"></path><path d="m22 7-8.5 8.5-5-5L2 17"></path></svg>2.1%
                        </span>
                    </div>
                    <span className="text-muted fs-15"><span className="text-success me-1 fw-medium">12%</span> employees today</span>
                </div>
            </div>
        </div>
        <div className="col">
            <div className="card hrm-widget-card position-relative rounded-4">
                <div className="size-8 bg-danger position-absolute top-0 square-1"></div>
                <div className="size-8 bg-gradient-t-danger bg-opacity-75 position-absolute square-2"></div>
                <div className="hrm-widget-curve">
                    <div className="size-10 bg-danger avatar text-white">
                        <i className="ri-plane-line fs-lg"></i>
                    </div>
                </div>
                <div className="card-body">
                    <h6 className="fs-17 mb-7 ps-10 mt-n1">Employees Leave</h6>
                    <div className="d-flex justify-content-between align-items-end mb-3">
                        <h3 className="mb-0"><span className="counter" data-start="0" data-end="8" data-duration="1000">8</span></h3>
                        <span className="badge bg-danger-subtle text-danger border border-danger-subtle">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" data-lucide="trending-down" aria-hidden="true" className="lucide lucide-trending-down size-3 me-1"><path d="M16 17h6v-6"></path><path d="m22 17-8.5-8.5-5 5L2 7"></path></svg>1.2%
                        </span>
                    </div>
                    <span className="text-muted fs-15"><span className="text-danger me-1 fw-medium">0.5%</span> requests today</span>
                </div>
            </div>
        </div>
        <div className="col">
            <div className="card hrm-widget-card position-relative rounded-4">
                <div className="size-8 bg-success position-absolute top-0 square-1"></div>
                <div className="size-8 bg-gradient-t-success bg-opacity-75 position-absolute square-2"></div>
                <div className="hrm-widget-curve">
                    <div className="size-10 bg-success avatar text-white">
                        <i className="ri-user-add-line fs-lg"></i>
                    </div>
                </div>
                <div className="card-body">
                    <h6 className="fs-17 mb-7 ps-10 mt-n1">New Hires</h6>
                    <div className="d-flex justify-content-between align-items-end mb-3">
                        <h3 className="mb-0"><span className="counter" data-start="0" data-end="12" data-duration="1000">12</span></h3>
                        <span className="badge bg-success-subtle text-success border border-success-subtle">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" data-lucide="trending-up" aria-hidden="true" className="lucide lucide-trending-up size-3 me-1"><path d="M16 7h6v6"></path><path d="m22 7-8.5 8.5-5-5L2 17"></path></svg>4.6%
                        </span>
                    </div>
                    <span className="text-muted fs-15"><span className="text-success me-1 fw-medium">11%</span> this month</span>
                </div>
            </div>
        </div>
        <div className="col">
            <div className="card hrm-widget-card position-relative rounded-4">
                <div className="size-8 bg-info position-absolute top-0 square-1"></div>
                <div className="size-8 bg-gradient-t-info bg-opacity-75 position-absolute square-2"></div>
                <div className="hrm-widget-curve">
                    <div className="size-10 bg-info avatar text-white">
                        <i className="ri-building-line fs-lg"></i>
                    </div>
                </div>
                <div className="card-body">
                    <h6 className="fs-17 mb-7 ps-10 mt-n1">Departments</h6>
                    <div className="d-flex justify-content-between align-items-end mb-3">
                        <h3 className="mb-0"><span className="counter" data-start="0" data-end="9" data-duration="1000">9</span></h3>
                        <span className="badge bg-success-subtle text-success border border-success-subtle">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" data-lucide="trending-up" aria-hidden="true" className="lucide lucide-trending-up size-3 me-1"><path d="M16 7h6v6"></path><path d="m22 7-8.5 8.5-5-5L2 17"></path></svg>0.8%
                        </span>
                    </div>
                    <span className="text-muted fs-15"><span className="text-success me-1 fw-medium">0.8%</span> the organization</span>
                </div>
            </div>
        </div>
    </div>

   </>
    
 
  )
}
