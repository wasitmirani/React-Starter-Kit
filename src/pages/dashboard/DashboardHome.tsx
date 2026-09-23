import BreadCrumb from '@/components/common/BreadCrumb'


export function DashboardHome() {
  return (
  <>
    <BreadCrumb activePage="CRM Dashboard" breadcrumbs={[ {label: "Dashboards", href: "/dashboard"}]} />
      
    <h5 className="mb-5 mt-1 welcome-title d-inline-block fw-bold">Welcome to Dashboard!</h5>

    <div className="row gx-5">
        <div className="col-xxl-8 order-2 order-xxl-1">
            <div className="row row-cols-1 row-cols-md-3 row-cols-lg-5 gx-5">
                <div className="col">
                    <div className="card ecommerce-widget">
                        <div className="card-body">
                            <div className="d-flex flex-wrap gap-4 justify-content-between align-items-start">
                                <div className="avatar size-9 overflow-hidden position-relative rounded-circle bg-primary-subtle text-primary mb-5">
                                    <i data-lucide="badge-dollar-sign" className="size-4 icon-primary"></i>
                                    <div className="size-6 blur-circle bg-primary rounded-circle"></div>
                                </div>
                                <div className="dropdown">
                                    <a href="#!" className="text-muted" data-bs-toggle="dropdown" aria-expanded="false"><i className="mgc_more_1_fill fs-16"></i></a>
                                    <div className="dropdown-menu dropdown-menu-end">
                                        <a className="dropdown-item" href="#!">Weekly</a>
                                        <a className="dropdown-item" href="#!">Monthly</a>
                                        <a className="dropdown-item" href="#!">Yearly</a>
                                    </div>
                                </div>
                            </div>
                            <p className="text-muted mb-2 fs-15">Total Revenue</p>
                            <h5 className="mb-3 fs-xl">$<span className="counter" data-start="0" data-end="2.45" data-duration="1000"></span>L</h5>
                            <span className="fs-sm text-muted"><span className="fw-medium text-success me-2"><i className="ri-arrow-up-line"></i>7.4%</span>Last Month</span>
                        </div>
                    </div>
                </div>
                <div className="col">
                    <div className="card ecommerce-widget">
                        <div className="card-body">
                            <div className="d-flex flex-wrap gap-4 justify-content-between align-items-start">
                                <div className="avatar size-9 overflow-hidden position-relative rounded-circle bg-success-subtle text-success mb-5">
                                    <i data-lucide="users" className="size-4 icon-success"></i>
                                    <div className="size-6 blur-circle bg-success rounded-circle"></div>
                                </div>
                                <div className="dropdown">
                                    <a href="#!" className="text-muted" data-bs-toggle="dropdown"><i className="mgc_more_1_fill fs-16"></i></a>
                                    <div className="dropdown-menu dropdown-menu-end">
                                        <a className="dropdown-item" href="#!">Weekly</a>
                                        <a className="dropdown-item" href="#!">Monthly</a>
                                        <a className="dropdown-item" href="#!">Yearly</a>
                                    </div>
                                </div>
                            </div>
                            <p className="text-muted mb-2 fs-15">Total Customers</p>
                            <h5 className="mb-3 fs-xl"><span className="counter" data-start="0" data-end="3560" data-duration="1000"></span></h5>
                            <span className="fs-sm text-muted"><span className="fw-medium text-success me-2"><i className="ri-arrow-up-line"></i>4.1%</span>Last Month</span>
                        </div>
                    </div>
                </div>
                <div className="col">
                    <div className="card ecommerce-widget">
                        <div className="card-body">
                            <div className="d-flex flex-wrap gap-4 justify-content-between align-items-start">
                                <div className="avatar size-9 overflow-hidden position-relative rounded-circle bg-secondary-subtle text-secondary mb-5">
                                    <i data-lucide="shopping-cart" className="size-4 icon-secondary"></i>
                                    <div className="size-6 blur-circle bg-secondary rounded-circle"></div>
                                </div>
                                <div className="dropdown">
                                    <a href="#!" className="text-muted" data-bs-toggle="dropdown"><i className="mgc_more_1_fill fs-16"></i></a>
                                    <div className="dropdown-menu dropdown-menu-end">
                                        <a className="dropdown-item" href="#!">Weekly</a>
                                        <a className="dropdown-item" href="#!">Monthly</a>
                                        <a className="dropdown-item" href="#!">Yearly</a>
                                    </div>
                                </div>
                            </div>
                            <p className="text-muted mb-2 fs-15">Total Orders</p>
                            <h5 className="mb-3 fs-xl"><span className="counter" data-start="0" data-end="1248" data-duration="1000"></span></h5>
                            <span className="fs-sm text-muted"><span className="fw-medium text-success me-2"><i className="ri-arrow-up-line"></i>6.4%</span>Last Month</span>
                        </div>
                    </div>
                </div>
                <div className="col">
                    <div className="card ecommerce-widget">
                        <div className="card-body">
                            <div className="d-flex flex-wrap gap-4 justify-content-between align-items-start">
                                <div className="avatar size-9 overflow-hidden position-relative rounded-circle bg-info-subtle text-info mb-5">
                                    <i data-lucide="wallet" className="size-4 icon-info"></i>
                                    <div className="size-6 blur-circle bg-info rounded-circle"></div>
                                </div>
                                <div className="dropdown">
                                    <a href="#!" className="text-muted" data-bs-toggle="dropdown"><i className="mgc_more_1_fill fs-16"></i></a>
                                    <div className="dropdown-menu dropdown-menu-end">
                                        <a className="dropdown-item" href="#!">Weekly</a>
                                        <a className="dropdown-item" href="#!">Monthly</a>
                                        <a className="dropdown-item" href="#!">Yearly</a>
                                    </div>
                                </div>
                            </div>
                            <p className="text-muted mb-2 fs-15">Total Profit</p>
                            <h5 className="mb-3 fs-xl">$<span className="counter" data-start="0" data-end="78.4" data-duration="1000"></span>K</h5>
                            <span className="fs-sm text-muted"><span className="fw-medium text-danger me-2"><i className="ri-arrow-down-line"></i>3.9%</span>Last Month</span>
                        </div>
                    </div>
                </div>
                <div className="col">
                    <div className="card ecommerce-widget">
                        <div className="card-body">
                            <div className="d-flex flex-wrap gap-4 justify-content-between align-items-start">
                                <div className="avatar size-9 overflow-hidden position-relative rounded-circle bg-danger-subtle text-danger mb-5">
                                    <i data-lucide="trending-up" className="size-4 icon-danger"></i>
                                    <div className="size-6 blur-circle bg-danger rounded-circle"></div>
                                </div>
                                <div className="dropdown">
                                    <a href="#!" className="text-muted" data-bs-toggle="dropdown"><i className="mgc_more_1_fill fs-16"></i></a>
                                    <div className="dropdown-menu dropdown-menu-end">
                                        <a className="dropdown-item" href="#!">Weekly</a>
                                        <a className="dropdown-item" href="#!">Monthly</a>
                                        <a className="dropdown-item" href="#!">Yearly</a>
                                    </div>
                                </div>
                            </div>
                            <p className="text-muted mb-2 fs-15">Conversion Rate</p>
                            <h5 className="mb-3 fs-xl"><span className="counter" data-start="0" data-end="5.8" data-duration="1000"></span>%</h5>
                            <span className="fs-sm text-muted"><span className="fw-medium text-danger me-2"><i className="ri-arrow-down-line"></i>1.2%</span>Last Month</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div className="col-xxl-4 order-1 order-xxl-2">
            <div className="card bg-primary text-white card-h-100 border-0 mt-md-1 mt-xxl-0 rounded-3">
                <div className="card-body p-md-6">
                    <div className="row g-4">
                        <div className="col-md-6 col-lg-5 col-xxl-7 ps-5">
                            <h6 className="mb-1 fs-17">Hello, Emma Anderson</h6>
                            <p className="text-opacity-60 lh-lg mb-5">Welcome back! Check your latest performance insights.</p>
                            <button type="button" className="btn btn-dark rounded-pill fs-sm px-5 py-2">View Reports</button>
                        </div>
                        <div className="col-md-4 col-xxl-5">
                            <img src="/assets/images/trolly-girl.webp" alt="Trolly Girl" className="img-fluid girl-vector h-56 mx-auto d-block">
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div className="row gx-5">
        <div className="col-xxl-8">
            <div className="card">
                <div className="card-header d-flex flex-wrap gap-4 justify-content-between align-items-center">
                    <h5 className="card-title mb-0">Sales Overview</h5>
                    <div className="d-flex gap-3 flex-wrap">
                        <ul className="nav nav-pills nav-justified rounded border nav-light p-1" id="underlineTabs" role="tablist">
                            <li className="nav-item" role="presentation">
                                <button className="nav-link fs-sm py-1 px-3 rounded-1" id="weekly-tab" data-bs-toggle="tab" data-bs-target="#weekly-tab-pane" type="button" role="tab">Weeky</button>
                            </li>
                            <li className="nav-item" role="presentation">
                                <button className="nav-link fs-sm py-1 px-3 rounded-1 active" id="monthly-tab" data-bs-toggle="tab" data-bs-target="#monthly-tab-pane" type="button" role="tab">Monthly</button>
                            </li>
                            <li className="nav-item" role="presentation">
                                <button className="nav-link fs-sm py-1 px-3 rounded-1" id="yearly-tab" data-bs-toggle="tab" data-bs-target="#yearly-tab-pane" type="button" role="tab">Yearly</button>
                            </li>
                        </ul>
                        <div className="dropdown">
                            <a href="#!" className="btn btn-outline-light size-9 btn-icon" data-bs-toggle="dropdown" aria-expanded="false"><i className="mgc_more_2_fill fs-lg"></i></a>
                            <div className="dropdown-menu dropdown-menu-end">
                                <a className="dropdown-item" href="#!">
                                    <i className="ri-download-2-line me-2 text-muted"></i>Report
                                </a>
                                <a className="dropdown-item" href="#!">
                                    <i className="ri-file-excel-2-line me-2 text-muted"></i>Export as Excel
                                </a>
                                <a className="dropdown-item" href="#!">
                                    <i className="ri-file-pdf-line me-2 text-muted"></i>Export as PDF
                                </a>
                                <a className="dropdown-item" href="#!">
                                    <i className="ri-printer-line me-2 text-muted"></i>Print
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="card-body">
                    <div id="salesOverview"></div>
                </div>
            </div>
        </div>
        <div className="col-lg-6 col-xxl-4">
            <div className="row gx-5">
                <div className="col-md-6">
                    <div className="card">
                        <div className="card-header d-flex flex-wrap gap-4 justify-content-between align-items-start">
                            <div>
                                <h5 className="mb-1 fw-medium fs-21">$<span className="counter" data-start="0" data-end="67.8" data-duration="1000"></span>K</h5>
                                <p className="text-muted">Weekly Profit</p>
                            </div>
                            <div className="dropdown">
                                <a href="#!" className="text-muted" data-bs-toggle="dropdown" aria-expanded="false"><i className="mgc_more_2_fill fs-lg"></i></a>
                                <div className="dropdown-menu dropdown-menu-end">
                                    <a className="dropdown-item" href="#!">Weekly</a>
                                    <a className="dropdown-item" href="#!">Monthly</a>
                                    <a className="dropdown-item" href="#!">Yearly</a>
                                </div>
                            </div>
                        </div>
                        <div className="card-body pt-4">
                            <div id="weeklyProfitChart"></div>
                        </div>
                    </div>
                </div>
                <div className="col-md-6">
                    <div className="card">
                        <div className="card-header d-flex flex-wrap gap-4 justify-content-between align-items-start">
                            <div>
                                <h5 className="mb-1 fw-medium fs-21"><span className="counter" data-start="0" data-end="2158" data-duration="1000"></span></h5>
                                <p className="text-muted">Weekly Sales</p>
                            </div>
                            <div className="dropdown">
                                <a href="#!" className="text-muted" data-bs-toggle="dropdown" aria-expanded="false"><i className="mgc_more_2_fill fs-lg"></i></a>
                                <div className="dropdown-menu dropdown-menu-end">
                                    <a className="dropdown-item" href="#!">Weekly</a>
                                    <a className="dropdown-item" href="#!">Monthly</a>
                                    <a className="dropdown-item" href="#!">Yearly</a>
                                </div>
                            </div>
                        </div>
                        <div className="card-body pt-0">
                            <div id="weeklySalesChart"></div>
                        </div>
                    </div>
                </div>
                <div className="col-12">
                    <div className="card">
                        <div className="card-header d-flex flex-wrap gap-4 justify-content-between align-items-center">
                            <h5 className="card-title fw-medium mb-0">Customer Growth Performance Insights!</h5>
                            <a href="#!" className="text-muted" data-bs-toggle="dropdown" aria-expanded="false"><i className="mgc_right_line fs-lg"></i></a>
                        </div>
                        <div className="card-body pt-6">
                            <div className="d-flex justify-content-between align-items-end mb-4">
                                <h3 className="mb-0"><span className="counter" data-start="0" data-end="70" data-duration="1000"></span>%<span className="text-success fw-medium fs-sm ms-2"><i className="mgc_trending_up_line align-middle me-1"></i>12%</span></h3>
                                <span className="avatar-group">
                                    <a href="#!" className="avatar-group-item"><img src="/assets/images/user-21.webp" alt="User 21" className="size-8"></a>
                                    <a href="#!" className="avatar-group-item"><img src="/assets/images/user-22.webp" alt="User 22" className="size-8"></a>
                                    <a href="#!" className="avatar-group-item"><img src="/assets/images/user-11.webp" alt="User 11" className="size-8"></a>
                                    <a href="#!" className="avatar-group-item"><img src="/assets/images/user-24.webp" alt="User 24" className="size-8"></a>
                                    <a href="#!" className="avatar-group-item size-8 avatar bg-light rounded-circle fs-15 text-muted fw-medium">5+</a>
                                </span>
                            </div>
                            <div className="progress progress-2 custom-progress mb-10px" role="progressbar" aria-label="Example with label" aria-valuenow="50" aria-valuemin="0" aria-valuemax="100">
                                <div className="progress-bar bg-secondary rounded-start-pill" style="width: 70%"></div>
                            </div>
                            <p className="text-muted mb-0">Steady performance increase over time with consistency.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div className="col-md-6 col-lg-6 col-xxl-3">
            <div className="card">
                <div className="card-header d-flex flex-wrap gap-4 justify-content-between align-items-center">
                    <h5 className="card-title mb-0">Top Selling Products</h5>
                    <div className="dropdown">
                        <a href="#!" className="text-muted" data-bs-toggle="dropdown" aria-expanded="false"><i className="mgc_more_1_fill fs-lg"></i></a>
                        <div className="dropdown-menu dropdown-menu-end">
                            <a className="dropdown-item" href="#!">Weekly</a>
                            <a className="dropdown-item" href="#!">Monthly</a>
                            <a className="dropdown-item" href="#!">Yearly</a>
                        </div>
                    </div>
                </div>
                <div className="card-body px-0">
                    <div className="px-5" data-simplebar style="max-height: 320px;">
                        <div className="d-flex flex-column gap-5">
                            <div className="d-flex align-items-end gap-3">
                                <div className="avatar size-16 bg-light rounded-1">
                                    <img src="/assets/images/product-01.webp" className="img-fluid size-14" alt="Product 01">
                                </div>
                                <div className="flex-grow-1 overflow-hidden">
                                    <h6 className="mb-0 fw-medium text-truncate"><a href="apps-ecommerce-product-overview.html" className="text-reset">Wireless Headphones</a></h6>
                                    <p className="text-muted fs-sm mb-1">Electronics</p>
                                    <div className="text-warning fs-sm">
                                        <i className="mgc_star_fill"></i>
                                        <i className="mgc_star_fill"></i>
                                        <i className="mgc_star_fill"></i>
                                        <i className="mgc_star_fill"></i>
                                        <i className="mgc_star_half_fill"></i>
                                    </div>
                                </div>
                                <div className="text-end">
                                    <a href="#!" className="bg-light text-body-secondary px-2 mb-1 fs-13 fw-medium rounded-pill lh-sm badge d-inline-flex align-items-center gap-6px">
                                        <img src="data:image/png;base64,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" alt="SMILE" className="size-4">5
                                    </a>
                                    <h6 className="mb-0 fs-15">$24,800</a></h6>
                                </div>
                            </div>
                            <div className="d-flex align-items-end gap-3">
                                <div className="avatar size-16 bg-light rounded-1">
                                    <img src="/assets/images/product-02.webp" className="img-fluid size-14" alt="Product 02">
                                </div>
                                <div className="flex-grow-1 overflow-hidden">
                                    <h6 className="mb-0 fw-medium text-truncate"><a href="apps-ecommerce-product-overview.html" className="text-reset">Smart Watch Pro</a></h6>
                                    <p className="text-muted fs-sm mb-1">Wearables</p>
                                    <div className="text-warning fs-sm">
                                        <i className="mgc_star_fill"></i>
                                        <i className="mgc_star_fill"></i>
                                        <i className="mgc_star_fill"></i>
                                        <i className="mgc_star_fill"></i>
                                        <i className="mgc_star_line"></i>
                                    </div>
                                </div>
                                <div className="text-end">
                                    <a href="#" className="bg-light text-body-secondary px-2 mb-1 fs-13 fw-medium rounded-pill badge d-inline-flex align-items-center gap-6px">
                                        <img src="data:image/png;base64,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" className="size-4" alt="SMILE">4
                                    </a>
                                    <h6 className="mb-0 fs-15">$19,600</h6>
                                </div>
                            </div>
                            <div className="d-flex align-items-end gap-3">
                                <div className="avatar size-16 bg-light rounded-1">
                                    <img src="/assets/images/product-03.webp" className="img-fluid size-14" alt="Product 03">
                                </div>
                                <div className="flex-grow-1 overflow-hidden">
                                    <h6 className="mb-0 fw-medium text-truncate"><a href="apps-ecommerce-product-overview.html" className="text-reset">Running Shoes</a></h6>
                                    <p className="text-muted fs-sm mb-1">Fashion</p>
                                    <div className="text-warning fs-sm">
                                        <i className="mgc_star_fill"></i>
                                        <i className="mgc_star_fill"></i>
                                        <i className="mgc_star_fill"></i>
                                        <i className="mgc_star_half_fill"></i>
                                        <i className="mgc_star_line"></i>
                                    </div>
                                </div>
                                <div className="text-end">
                                    <a href="#" className="bg-light text-body-secondary px-2 mb-1 fs-13 fw-medium rounded-pill badge d-inline-flex align-items-center gap-6px">
                                        <img src="data:image/png;base64,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" className="size-4" alt="SMILE">3
                                    </a>
                                    <h6 className="mb-0 fs-15">$17,200</h6>
                                </div>
                            </div>
                            <div className="d-flex align-items-end gap-3">
                                <div className="avatar size-16 bg-light rounded-1">
                                    <img src="/assets/images/product-04.webp" className="img-fluid size-14" alt="Product 04">
                                </div>
                                <div className="flex-grow-1 overflow-hidden">
                                    <h6 className="mb-0 fw-medium text-truncate"><a href="apps-ecommerce-product-overview.html" className="text-reset">Bluetooth Speaker</a></h6>
                                    <p className="text-muted fs-sm mb-1">Audio</p>
                                    <div className="text-warning fs-sm">
                                        <i className="mgc_star_fill"></i>
                                        <i className="mgc_star_fill"></i>
                                        <i className="mgc_star_fill"></i>
                                        <i className="mgc_star_fill"></i>
                                        <i className="mgc_star_line"></i>
                                    </div>
                                </div>
                                <div className="text-end">
                                    <a href="#" className="bg-light text-body-secondary px-2 mb-1 fs-13 fw-medium rounded-pill badge d-inline-flex align-items-center gap-6px">
                                        <img src="data:image/png;base64,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" className="size-4" alt="SMILE">7
                                    </a>
                                    <h6 className="mb-0 fs-15">$14,800</h6>
                                </div>
                            </div>
                            <div className="d-flex align-items-end gap-3">
                                <div className="avatar size-16 bg-light rounded-1">
                                    <img src="/assets/images/product-05.webp" className="img-fluid size-14" alt="Product 05">
                                </div>
                                <div className="flex-grow-1 overflow-hidden">
                                    <h6 className="mb-0 fw-medium text-truncate"><a href="apps-ecommerce-product-overview.html" className="text-reset">Gaming Mouse</a></h6>
                                    <p className="text-muted fs-sm mb-1">Accessories</p>
                                    <div className="text-warning fs-sm">
                                        <i className="mgc_star_fill"></i>
                                        <i className="mgc_star_fill"></i>
                                        <i className="mgc_star_fill"></i>
                                        <i className="mgc_star_half_fill"></i>
                                        <i className="mgc_star_line"></i>
                                    </div>
                                </div>
                                <div className="text-end">
                                    <a href="#" className="bg-light text-body-secondary px-2 mb-1 fs-13 fw-medium rounded-pill badge d-inline-flex align-items-center gap-6px">
                                        <img src="data:image/png;base64,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" className="size-4" alt="SMILE">4
                                    </a>
                                    <h6 className="mb-0 fs-15">$12,400</h6>
                                </div>
                            </div>
                            <div className="d-flex align-items-end gap-3">
                                <div className="avatar size-16 bg-light rounded-1">
                                    <img src="/assets/images/product-06.webp" className="img-fluid size-14" alt="Product 06"/>
                                </div>
                                <div className="flex-grow-1 overflow-hidden">
                                    <h6 className="mb-0 fw-medium text-truncate"><a href="apps-ecommerce-product-overview.html" className="text-reset">Laptop Backpack</a></h6>
                                    <p className="text-muted fs-sm mb-1">Bags</p>
                                    <div className="text-warning fs-sm">
                                        <i className="mgc_star_fill"></i>
                                        <i className="mgc_star_fill"></i>
                                        <i className="mgc_star_fill"></i>
                                        <i className="mgc_star_fill"></i>
                                        <i className="mgc_star_half_fill"></i>
                                    </div>
                                </div>
                                <div className="text-end">
                                    <a href="#" className="bg-light text-body-secondary px-2 mb-1 fs-13 fw-medium rounded-pill badge d-inline-flex align-items-center gap-6px">
                                        <img src="data:image/png;base64,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" className="size-4" alt="SMILE">9
                                    </a>
                                    <h6 className="mb-0 fs-15">$9,800</h6>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
  </>
  )
}
