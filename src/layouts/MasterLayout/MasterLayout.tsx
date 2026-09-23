import Switcher from "./Switcher";
import HeaderMenu from "./HeaderMenu";
import SideBar from "./SideBar";

const MasterLayout = () => {

  return (
    <>
    
       <div className="body-effect-img"></div>
    <div className="body-top-line"></div>
    <div className="body-bottom-line"></div>
      {/* Header */}
        <HeaderMenu></HeaderMenu>

{/* Switcher */}
<Switcher />

<SideBar />


<div id="sidebar-backdrop" className="sidebar-backdrop"></div>
<div className="min-vh-100 position-relative">
    <div className="page-wrapper">
<div className="container-fluid">

        <div className="col-md-6 col-lg-5 col-xxl-3">
            <div className="card">
                <div className="card-header d-flex flex-wrap gap-4 justify-content-between align-items-center">
                    <h5 className="card-title mb-0">Live Users</h5>
                    <div className="dropdown">
                        <a href="#!" className="text-muted" data-bs-toggle="dropdown" aria-expanded="false"><i className="mgc_more_1_fill fs-lg"></i></a>
                        <div className="dropdown-menu dropdown-menu-end">
                            <a className="dropdown-item" href="#!">Weekly</a>
                            <a className="dropdown-item" href="#!">Monthly</a>
                            <a className="dropdown-item" href="#!">Yearly</a>
                        </div>
                    </div>
                </div>
                <div className="card-body">
                    <div className="bg-server-gradient h-64 rounded-4 avatar overflow-hidden mb-6">
                        <span className="avatar-group position-absolute z-2 mt-10">
                            <a href="#!" className="avatar-group-item"><img src="/assets/images/user-5.webp" alt="User 5" className="size-10"></a>
                            <a href="#!" className="avatar-group-item z-1"><img src="/assets/images/user-2.webp" alt="User 2" className="size-14"></a>
                            <a href="#!" className="avatar-group-item"><img src="/assets/images/user-1.webp" alt="User 1" className="size-10"></a>
                        </span>
                        <div className="orbit-wrapper">
                            <div className="orbit orbit-1">
                                <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyRpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDcuMS1jMDAwIDc5LmRhYmFjYmIsIDIwMjEvMDQvMTQtMDA6Mzk6NDQgICAgICAgICI+IDxyZGY6UkRGIHhtbG5zOnJkZj0iaHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyI+IDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PSIiIHhtbG5zOnhtcD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLyIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bXA6Q3JlYXRvclRvb2w9IkFkb2JlIFBob3Rvc2hvcCAyMi41IChXaW5kb3dzKSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDo1MzI5Q0I4QzYyMEQxMUYwQjI5REEzNzlBRjgyNzE3MiIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDo1MzI5Q0I4RDYyMEQxMUYwQjI5REEzNzlBRjgyNzE3MiI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOjUzMjlDQjhBNjIwRDExRjBCMjlEQTM3OUFGODI3MTcyIiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOjUzMjlDQjhCNjIwRDExRjBCMjlEQTM3OUFGODI3MTcyIi8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+Ng9hKAAABexJREFUeNrsW1tv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" alt="Img 07" className="server size-8">
                                <img src="/assets/images/img-10.webp" alt="Img 10" className="server size-8">
                                <img src="data:image/png;base64,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" alt="Img 11" className="server size-8">
                                <img src="data:image/png;base64,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" alt="Img 31" className="server size-8">
                            </div>
                            <div className="orbit orbit-2">
                                <img src="data:image/png;base64,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" alt="Img 14" className="server size-8">
                                <div className="server size-5 bg-orange opacity-50"></div>
                                <img src="data:image/png;base64,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" alt="Img 15" className="server size-8">
                                <img src="data:image/png;base64,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" alt="Img 17" className="server size-8">
                            </div>
                        </div>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                        <img src="/assets/images/user-17.webp" alt="User 17" className="rounded-circle size-9">
                        <div className="flex-grow-1">
                            <h6 className="mb-0 lh-sm">Erik Kovalsky</h6>
                            <a href="#!" className="text-muted fs-sm">erikkovalsky@gmail.com</a>
                        </div>
                        <a href="#!" className="btn btn-primary btn-sm fs-15 py-1 px-3">Join</a>
                    </div>
                </div>
            </div>
        </div>
        <div className="col-lg-7 col-xxl-6">
            <div className="card card-h-100">
                <div className="card-header d-flex flex-wrap gap-4 justify-content-between align-items-center">
                    <h5 className="card-title mb-0">Top Sellers</h5>
                    <a href="apps-ecommerce-sellers-list.html" className="link link-custom-primary fs-15">View All <i className="ri-arrow-right-line ms-1"></i></a>
                </div>
                <div className="card-body">
                    <div className="table-card table-responsive custom-scroll">
                        <table className="table mb-0 table-borderless text-nowrap align-middle">
                            <thead className="border-top border-bottom">
                                <tr>
                                    <th className="text-muted fw-medium">Seller</th>
                                    <th className="text-muted fw-medium">Products</th>
                                    <th className="text-muted fw-medium">Orders</th>
                                    <th className="text-muted fw-medium">Revenue</th>
                                    <th className="text-muted fw-medium">Performance</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>
                                        <div className="d-flex align-items-center gap-3">
                                            <div className="avatar size-10 border rounded-1">
                                                <img src="data:image/png;base64,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" className="size-6" alt="Img 09">
                                            </div>
                                            <div>
                                                <h6 className="mb-0 fw-medium"><a href="apps-ecommerce-sellers-overview.html" className="text-reset">Apparel Studio</a></h6>
                                                <p className="text-muted fs-sm">India</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="text-muted">Fashion</td>
                                    <td>320</td>
                                    <td>$84.6K</td>
                                    <td>
                                        <div className="d-flex align-items-center gap-2">
                                            <div className="progress h-6px w-7 progress-vertical bg-primary-subtle" role="progressbar" aria-label="Example with label" aria-valuenow="50" aria-valuemin="0" aria-valuemax="100">
                                                <div className="progress-bar" style="width: 78%"></div>
                                            </div>
                                            <span className="ms-n2 fw-semibold">78%</span>
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <div className="d-flex align-items-center gap-3">
                                            <div className="avatar size-10 border rounded-1">
                                                <img src="data:image/png;base64,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" className="size-6" alt="Img 02">
                                            </div>
                                            <div>
                                                <h6 className="mb-0 fw-medium"><a href="#" className="text-reset">Tech Gadgets Inc.</a></h6>
                                                <p className="text-muted fs-sm">USA</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="text-muted">Electronics</td>
                                    <td>540</td>
                                    <td>$120.3K</td>
                                    <td>
                                        <div className="d-flex align-items-center gap-2">
                                            <div className="progress h-6px w-7 progress-vertical bg-success-subtle" role="progressbar" aria-label="Example with label" aria-valuenow="50" aria-valuemin="0" aria-valuemax="100">
                                                <div className="progress-bar bg-success" style="width: 71%"></div>
                                            </div>
                                            <span className="ms-n2 fw-semibold">71%</span>
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <div className="d-flex align-items-center gap-3">
                                            <div className="avatar size-10 border rounded-1">
                                                <img src="data:image/png;base64,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" className="size-6" alt="Img 04">
                                            </div>
                                            <div>
                                                <h6 className="mb-0 fw-medium"><a href="#" className="text-reset">Home Decor Hub</a></h6>
                                                <p className="text-muted fs-sm">Canada</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="text-muted">Home</td>
                                    <td>210</td>
                                    <td>$45.8K</td>
                                    <td>
                                        <div className="d-flex align-items-center gap-2">
                                            <div className="progress h-6px w-7 progress-vertical bg-danger-subtle" role="progressbar" aria-label="Example with label" aria-valuenow="50" aria-valuemin="0" aria-valuemax="100">
                                                <div className="progress-bar bg-danger" style="width: 64%"></div>
                                            </div>
                                            <span className="ms-n2 fw-semibold">64%</span>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div className="row align-items-center g-3 mt-2">
                        <div className="col-md-5">
                            <p className="text-muted text-center text-md-start mb-0">Showing <b className="me-1">1-3</b>of<b className="ms-1">27</b> Results</p>
                        </div>
                        <div className="col-md-7">
                            <nav aria-label="Page navigation example">
                                <ul className="pagination justify-content-center justify-content-md-end mb-0 products-pagination">
                                    <li className="page-item disabled"><a className="page-link" href="#!"><i data-lucide="chevron-left" className="size-4"></i> Previous</a></li>
                                    <li className="page-item active"><a className="page-link" href="#!">1</a></li>
                                    <li className="page-item"><a className="page-link" href="#!">2</a></li>
                                    <li className="page-item"><a className="page-link" href="#!">Next <i data-lucide="chevron-right" className="size-4"></i></a></li>
                                </ul>
                            </nav>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div className="col-xxl-8">
            <div className="row gx-5">
                <div className="col-lg-7">
                    <div className="card">
                        <div className="card-header d-flex flex-wrap gap-4 justify-content-between align-items-center">
                            <h5 className="card-title mb-0">Traffic</h5>
                            <a href="#!" className="link link-custom-primary fs-15">View All <i className="ri-arrow-right-line ms-1"></i></a>
                        </div>
                        <div className="card-body">
                            <ul className="nav nav-pills traffic-tab gap-5 gap-md-4 mb-3" id="traffic-tab" role="tablist">
                                <li className="nav-item rounded" role="presentation">
                                    <button className="nav-link w-40 active" id="traffic-visits-tab" data-bs-toggle="pill" data-bs-target="#traffic-visits" type="button" role="tab">
                                        <span className="fs-12 p-1 px-2 lh-1 bg-body-secondary mt-n4 ms-n1 d-table">Website Visits</span>
                                        <span className="d-flex align-items-start gap-10px mt-6px">
                                            <span className="size-8 avatar bg-light text-success rounded-circle">
                                                <i data-lucide="arrow-up" className="size-4"></i>
                                            </span>
                                            <span className="text-start">
                                                <span className="fw-semibold fs-lg">18.2K</span>
                                                <span className="text-success fw-normal fs-sm d-block mt-1">+8.4%</span>
                                            </span>
                                        </span>
                                    </button>
                                </li>
                                <li className="nav-item rounded" role="presentation">
                                    <button className="nav-link w-40" id="traffic-conversion-tab" data-bs-toggle="pill" data-bs-target="#traffic-conversion" type="button" role="tab">
                                        <span className="fs-12 p-1 px-2 lh-1 bg-body-secondary mt-n4 ms-n1 d-table">Conversions</span>
                                        <span className="d-flex align-items-start gap-10px mt-6px">
                                            <span className="size-8 avatar bg-light text-danger rounded-circle">
                                                <i data-lucide="arrow-down" className="size-4"></i>
                                            </span>
                                            <span className="text-start">
                                                <span className="fw-semibold fs-lg">1.2K</span>
                                                <span className="text-danger fw-normal fs-sm d-block mt-1">-1.8%</span>
                                            </span>
                                        </span>
                                    </button>
                                </li>
                            </ul>
                            <div className="tab-content mt-4" id="traffic-tabContent">
                                <div className="tab-pane fade show active" id="traffic-visits" role="tabpanel">
                                    <div id="websiteVisitChart"></div>
                                </div>
                                <div className="tab-pane fade" id="traffic-conversion" role="tabpanel">
                                    <div id="conversionChart"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-lg-5">
                    <div className="card card-h-100">
                        <div className="card-header d-flex flex-wrap gap-4 justify-content-between align-items-center">
                            <h5 className="card-title mb-0">Top 5 Country Sales Overview</h5>
                            <div className="dropdown">
                                <a href="#!" className="text-muted" data-bs-toggle="dropdown" aria-expanded="false"><i className="mgc_more_1_fill fs-lg"></i></a>
                                <div className="dropdown-menu dropdown-menu-end">
                                    <a className="dropdown-item" href="#!">Weekly</a>
                                    <a className="dropdown-item" href="#!">Monthly</a>
                                    <a className="dropdown-item" href="#!">Yearly</a>
                                </div>
                            </div>
                        </div>
                        <div className="card-body">
                            <h4 className="mb-6px"><span className="counter" data-start="0" data-end="4125.05" data-duration="1000"></span><span className="text-success fw-medium fs-sm ms-2"><i className="mgc_trending_up_line align-middle me-1"></i>15.5%</span></h4>
                            <p className="text-muted text-truncate mb-7 fs-15">Strong sales growth across top 5 countries.</p>
                            <div className="d-flex flex-column gap-5">
                                <div className="row align-items-center">
                                    <div className="col-4">
                                        <div className="d-flex align-items-center gap-2">
                                            <img src="data:image/svg+xml,%3csvg%20xmlns='http://www.w3.org/2000/svg'%20xmlns:xlink='http://www.w3.org/1999/xlink'%20viewBox='0%200%207410%203900'%3e%3cpath%20fill='%23b22234'%20d='M0%200h7410v3900H0z'/%3e%3cpath%20d='M0%20450h7410m0%20600H0m0%20600h7410m0%20600H0m0%20600h7410m0%20600H0'%20stroke='%23fff'%20stroke-width='300'/%3e%3cpath%20fill='%233c3b6e'%20d='M0%200h2964v2100H0z'/%3e%3cg%20fill='%23fff'%3e%3cg%20id='d'%3e%3cg%20id='c'%3e%3cg%20id='e'%3e%3cg%20id='b'%3e%3cpath%20id='a'%20d='M247%2090l70.534%20217.082-184.66-134.164h228.253L176.466%20307.082z'/%3e%3cuse%20xlink:href='%23a'%20y='420'/%3e%3cuse%20xlink:href='%23a'%20y='840'/%3e%3cuse%20xlink:href='%23a'%20y='1260'/%3e%3c/g%3e%3cuse%20xlink:href='%23a'%20y='1680'/%3e%3c/g%3e%3cuse%20xlink:href='%23b'%20x='247'%20y='210'/%3e%3c/g%3e%3cuse%20xlink:href='%23c'%20x='494'/%3e%3c/g%3e%3cuse%20xlink:href='%23d'%20x='988'/%3e%3cuse%20xlink:href='%23c'%20x='1976'/%3e%3cuse%20xlink:href='%23e'%20x='2470'/%3e%3c/g%3e%3c/svg%3e" alt="US" className="object-fit-cover rounded-circle size-5">
                                            <h6 className="mb-0 fw-medium fs-sm"><a href="#!" className="text-reset">USA</a></h6>
                                        </div>
                                    </div>
                                    <div className="col-8">
                                        <div className="progress-stacked progress-2 bg-light-subtle rounded-xs gap-1">
                                            <div className="progress progress-2" role="progressbar" aria-label="Segment one" aria-valuenow="15" aria-valuemin="0" aria-valuemax="100" style="width: 45%">
                                                <div className="progress-bar rounded-xs"></div>
                                            </div>
                                            <div className="progress progress-2" role="progressbar" aria-label="Segment two" aria-valuenow="30" aria-valuemin="0" aria-valuemax="100" style="width: 30%">
                                                <div className="progress-bar rounded-xs bg-primary bg-opacity-50"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="row align-items-center">
                                    <div className="col-4">
                                        <div className="d-flex align-items-center gap-2">
                                            <img src="data:image/svg+xml,%3csvg%20xmlns='http://www.w3.org/2000/svg'%20xmlns:xlink='http://www.w3.org/1999/xlink'%20viewBox='0%200%20900%20600'%3e%3cpath%20fill='%23f93'%20d='M0%200h900v200H0z'/%3e%3cpath%20fill='%23fff'%20d='M0%20200h900v200H0z'/%3e%3cpath%20fill='%23128807'%20d='M0%20400h900v200H0z'/%3e%3cg%20transform='translate(450%20300)'%3e%3ccircle%20r='92.5'%20fill='%23008'/%3e%3ccircle%20r='80'%20fill='%23fff'/%3e%3ccircle%20r='16'%20fill='%23008'/%3e%3cg%20id='d'%3e%3cg%20id='c'%3e%3cg%20id='b'%3e%3cg%20id='a'%20fill='%23008'%3e%3ccircle%20r='3.5'%20transform='rotate(7.5%20-40%20610.282)'/%3e%3cpath%20d='m0%2080%203-48-2-16.031V15h-2v.969L-3%2032l3%2048z'/%3e%3c/g%3e%3cuse%20xlink:href='%23a'%20transform='rotate(15)'/%3e%3c/g%3e%3cuse%20xlink:href='%23b'%20transform='rotate(30)'/%3e%3c/g%3e%3cuse%20xlink:href='%23c'%20transform='rotate(60)'/%3e%3c/g%3e%3cuse%20xlink:href='%23d'%20transform='rotate(120)'/%3e%3cuse%20xlink:href='%23d'%20transform='rotate(-120)'/%3e%3c/g%3e%3c/svg%3e" className="object-fit-cover rounded-circle size-5" alt="IN">
                                            <h6 className="mb-0 fw-medium fs-sm"><a href="#!" className="text-reset">India</a></h6>
                                        </div>
                                    </div>
                                    <div className="col-8">
                                        <div className="progress-stacked progress-2 bg-light-subtle rounded-xs gap-1">
                                            <div className="progress progress-2" role="progressbar" aria-label="Segment one" aria-valuenow="15" aria-valuemin="0" aria-valuemax="100" style="width: 72%">
                                                <div className="progress-bar rounded-xs"></div>
                                            </div>
                                            <div className="progress progress-2" role="progressbar" aria-label="Segment two" aria-valuenow="30" aria-valuemin="0" aria-valuemax="100" style="width: 25%">
                                                <div className="progress-bar rounded-xs bg-primary bg-opacity-50"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="row align-items-center">
                                    <div className="col-4">
                                        <div className="d-flex align-items-center gap-2">
                                            <img src="data:image/svg+xml,%3csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%203%202'%3e%3cpath%20fill='%23EC1920'%20d='M0%200h3v2H0z'/%3e%3cpath%20fill='%23fff'%20d='M0%200h2v2H0z'/%3e%3cpath%20fill='%23051440'%20d='M0%200h1v2H0z'/%3e%3c/svg%3e" className="object-fit-cover rounded-circle size-5" alt="FR">
                                            <h6 className="mb-0 fw-medium fs-sm"><a href="#!" className="text-reset">France</a></h6>
                                        </div>
                                    </div>
                                    <div className="col-8">
                                        <div className="progress-stacked progress-2 bg-light-subtle rounded-xs gap-1">
                                            <div className="progress progress-2" role="progressbar" aria-label="Segment one" aria-valuenow="15" aria-valuemin="0" aria-valuemax="100" style="width: 40%">
                                                <div className="progress-bar rounded-xs"></div>
                                            </div>
                                            <div className="progress progress-2" role="progressbar" aria-label="Segment two" aria-valuenow="30" aria-valuemin="0" aria-valuemax="100" style="width: 35%">
                                                <div className="progress-bar rounded-xs bg-primary bg-opacity-50"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="row align-items-center">
                                    <div className="col-4">
                                        <div className="d-flex align-items-center gap-2">
                                            <img src="data:image/svg+xml,%3csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%209600%204800'%3e%3cpath%20fill='%23d52b1e'%20d='M0%200h2400l99%2099h4602l99-99h2400v4800H7200l-99-99H2499l-99%2099H0z'/%3e%3cpath%20fill='%23fff'%20d='M2400%200h4800v4800H2400zm2490%204430l-45-863a95%2095%200%2001111-98l859%20151-116-320a65%2065%200%200120-73l941-762-212-99a65%2065%200%2001-34-79l186-572-542%20115a65%2065%200%2001-73-38l-105-247-423%20454a65%2065%200%2001-111-57l204-1052-327%20189a65%2065%200%2001-91-27l-332-652-332%20652a65%2065%200%2001-91%2027l-327-189%20204%201052a65%2065%200%2001-111%2057l-423-454-105%20247a65%2065%200%2001-73%2038l-542-115%20186%20572a65%2065%200%2001-34%2079l-212%2099%20941%20762a65%2065%200%200120%2073l-116%20320%20859-151a95%2095%200%2001111%2098l-45%20863z'/%3e%3c/svg%3e" className="object-fit-cover rounded-circle size-5" alt="CA">
                                            <h6 className="mb-0 fw-medium fs-sm"><a href="#!" className="text-reset">Canada</a></h6>
                                        </div>
                                    </div>
                                    <div className="col-8">
                                        <div className="progress-stacked progress-2 bg-light-subtle rounded-xs gap-1">
                                            <div className="progress progress-2" role="progressbar" aria-label="Segment one" aria-valuenow="15" aria-valuemin="0" aria-valuemax="100" style="width: 57%">
                                                <div className="progress-bar rounded-xs"></div>
                                            </div>
                                            <div className="progress progress-2" role="progressbar" aria-label="Segment two" aria-valuenow="30" aria-valuemin="0" aria-valuemax="100" style="width: 24%">
                                                <div className="progress-bar rounded-xs bg-primary bg-opacity-50"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="row align-items-center">
                                    <div className="col-4">
                                        <div className="d-flex align-items-center gap-2">
                                            <img src="data:image/svg+xml,%3csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%205%203'%3e%3cpath%20d='M0%200h5v3H0z'/%3e%3cpath%20fill='%23D00'%20d='M0%201h5v2H0z'/%3e%3cpath%20fill='%23FFCE00'%20d='M0%202h5v1H0z'/%3e%3c/svg%3e" className="object-fit-cover rounded-circle size-5" alt="DE">
                                            <h6 className="mb-0 fw-medium fs-sm"><a href="#!" className="text-reset">Germany</a></h6>
                                        </div>
                                    </div>
                                    <div className="col-8">
                                        <div className="progress-stacked progress-2 bg-light-subtle rounded-xs gap-1">
                                            <div className="progress progress-2" role="progressbar" aria-label="Segment one" aria-valuenow="15" aria-valuemin="0" aria-valuemax="100" style="width: 45%">
                                                <div className="progress-bar rounded-xs"></div>
                                            </div>
                                            <div className="progress progress-2" role="progressbar" aria-label="Segment two" aria-valuenow="30" aria-valuemin="0" aria-valuemax="100" style="width: 20%">
                                                <div className="progress-bar rounded-xs bg-primary bg-opacity-50"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="row align-items-center">
                                    <div className="col-4">
                                    </div>
                                    <div className="col-8">
                                        <div className="fs-13 text-muted d-flex justify-content-between">
                                            <span>0K</span>
                                            <span>1K</span>
                                            <span>3K</span>
                                            <span>5K</span>
                                            <span>7K</span>
                                            <span>9K</span>
                                            <span>11K</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="card-footer border-top py-4">
                            <div className="d-flex flex-wrap align-items-center justify-content-center gap-3 gap-md-6">
                                <a href="#!" className="d-flex align-items-center text-reset gap-2">
                                    <div className="size-2 rounded bg-primary"></div>
                                    <span className="fs-15">Total Sales</span>
                                </a>
                                <a href="#!" className="d-flex align-items-center text-reset gap-2">
                                    <div className="size-2 rounded bg-primary bg-opacity-50"></div>
                                    <span className="fs-15">Growth Rate</span>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div className="col-xxl-4">
            <div className="row gx-5">
                <div className="col-lg-6 col-xxl-12">
                    <div className="card">
                        <div className="card-body">
                            <div className="row g-3 h-100">
                                <div className="col-md-3">
                                    <div className="d-flex h-100 flex-column justify-content-between">
                                        <div>
                                            <p className="text-muted mb-2 fs-15">Revenue</p>
                                            <h4 className="mb-6px">$<span className="counter" data-start="0" data-end="71.5" data-duration="1000"></span>K</h4>
                                        </div>
                                        <div className="fs-sm">
                                            <span className="fw-semibold me-1 text-danger"><i className="ri-arrow-down-line"></i>5.3%</span>
                                            <p className="text-muted">Last Month</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-9">
                                    <div id="revenueChart"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-lg-6 col-xxl-12">
                    <div className="card card-h-100">
                        <div className="card-body">
                            <div className="row g-3 h-100">
                                <div className="col-md-3">
                                    <div className="d-flex h-100 flex-column justify-content-between">
                                        <div>
                                            <p className="text-muted mb-2 fs-15">Expense</p>
                                            <h4 className="mb-6px">$<span className="counter" data-start="0" data-end="4.56" data-duration="1000"></span>K</h4>
                                        </div>
                                        <div className="fs-sm">
                                            <span className="fw-semibold me-1 text-success"><i className="ri-arrow-up-line"></i>8%</span>
                                            <p className="text-muted">Last Month</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-9">
                                    <div id="expenseChart"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div className="col-md-6 col-lg-5 col-xxl-3">
            <div className="card mt-5">
                <div className="card-header">
                    <h5 className="card-title mb-md-16 fs-17">Discover Pro</h5>
                    <button type="button" className="btn btn-primary px-4 py-2 fs-15 rounded-1">Upgrade</button>
                </div>
                <div className="card-body">
                    <p className="text-muted mb-2 mb-md-0">Unlock features. Boost performance!</p>
                    <img src="/assets/images/upgrade.webp" alt="Upgrade" className="img-fluid h-44 upgrade-img mx-auto d-block">
                </div>
            </div>
            <div className="card">
                <div className="card-header d-flex flex-wrap flex-md-nowrap gap-4 justify-content-between align-items-start">
                    <h5 className="card-title mb-0">Low Stock</h5>
                    <div className="dropdown flex-shrink-0">
                        <a href="#!" className="link link-custom-primary badge border avatar bg-body-custom fw-normal fs-13 py-6px px-3 gap-1 dropdown-toggle" aria-label="Dropdown" data-bs-toggle="dropdown" aria-expanded="false">
                            Monthly
                        </a>
                        <div className="dropdown-menu dropdown-menu-end">
                            <a className="dropdown-item" href="#!">Monthly</a>
                            <a className="dropdown-item" href="#!">Weekly</a>
                            <a className="dropdown-item" href="#!">Yearly</a>
                        </div>
                    </div>
                </div>
                <div className="card-body">
                    <div id="lowStockChart"></div>
                </div>
            </div>
        </div>
        <div className="col-md-6 col-lg-7 col-xxl-3">
            <div className="card card-h-100">
                <div className="card-header d-flex flex-wrap gap-4 justify-content-between align-items-center">
                    <h5 className="card-title mb-0">Transactions</h5>
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
                    <div className="px-5" data-simplebar style="max-height: 410px;">
                        <div className="d-flex flex-column gap-5">
                            <div className="d-flex align-items-center gap-3">
                                <div className="size-9 avatar flex-shrink-0 bg-gradient-s-info border border-info-subtle border-dashed text-info rounded">
                                    <i data-lucide="wallet" className="size-4-5"></i>
                                </div>
                                <div className="overflow-hidden flex-grow-1">
                                    <p className="text-muted fs-sm">Wallet</p>
                                    <h6 className="fw-medium mb-0 fs-15 text-truncate">Starbucks</h6>
                                </div>
                                <div className="d-flex gap-5 align-items-center">
                                    <h6 className="fw-medium text-end mb-0">+$250.00</h6>
                                    <p className="text-muted fs-15">USD</p>
                                </div>
                            </div>
                            <div className="d-flex align-items-center gap-3">
                                <div className="size-9 avatar flex-shrink-0 bg-gradient-s-success border border-success-subtle border-dashed text-success rounded">
                                    <i data-lucide="shopping-cart" className="size-4-5"></i>
                                </div>
                                <div className="overflow-hidden flex-grow-1">
                                    <p className="text-muted fs-sm">Shopping</p>
                                    <h6 className="fw-medium mb-0 fs-15 text-truncate">Amazon</h6>
                                </div>
                                <div className="d-flex gap-5 align-items-center">
                                    <h6 className="fw-medium text-end mb-0">-$120.00</h6>
                                    <p className="text-muted fs-15">USD</p>
                                </div>
                            </div>
                            <div className="d-flex align-items-center gap-3">
                                <div className="size-9 avatar flex-shrink-0 bg-gradient-s-warning border border-warning-subtle border-dashed text-warning rounded">
                                    <i data-lucide="credit-card" className="size-4-5"></i>
                                </div>
                                <div className="overflow-hidden flex-grow-1">
                                    <p className="text-muted fs-sm">Payment</p>
                                    <h6 className="fw-medium mb-0 fs-15 text-truncate">Netflix</h6>
                                </div>
                                <div className="d-flex gap-5 align-items-center">
                                    <h6 className="fw-medium text-end mb-0">-$15.99</h6>
                                    <p className="text-muted fs-15">USD</p>
                                </div>
                            </div>
                            <div className="d-flex align-items-center gap-3">
                                <div className="size-9 avatar flex-shrink-0 bg-gradient-s-primary border border-primary-subtle border-dashed text-primary rounded">
                                    <i data-lucide="briefcase" className="size-4-5"></i>
                                </div>
                                <div className="overflow-hidden flex-grow-1">
                                    <p className="text-muted fs-sm">Salary</p>
                                    <h6 className="fw-medium mb-0 fs-15 text-truncate">Company Inc.</h6>
                                </div>
                                <div className="d-flex gap-5 align-items-center">
                                    <h6 className="fw-medium text-end mb-0">+$250.12</h6>
                                    <p className="text-muted fs-15">USD</p>
                                </div>
                            </div>
                            <div className="d-flex align-items-center gap-3">
                                <div className="size-9 avatar flex-shrink-0 bg-gradient-s-danger border border-danger-subtle border-dashed text-danger rounded">
                                    <i data-lucide="home" className="size-4-5"></i>
                                </div>
                                <div className="overflow-hidden flex-grow-1">
                                    <p className="text-muted fs-sm">Rent</p>
                                    <h6 className="fw-medium mb-0 fs-15 text-truncate">Apartment Rent</h6>
                                </div>
                                <div className="d-flex gap-5 align-items-center">
                                    <h6 className="fw-medium text-end mb-0">-$750.00</h6>
                                    <p className="text-muted fs-15">USD</p>
                                </div>
                            </div>
                            <div className="d-flex align-items-center gap-3">
                                <div className="size-9 avatar flex-shrink-0 bg-gradient-s-info border border-info-subtle border-dashed text-info rounded">
                                    <i data-lucide="coffee" className="size-4-5"></i>
                                </div>
                                <div className="overflow-hidden flex-grow-1">
                                    <p className="text-muted fs-sm">Food</p>
                                    <h6 className="fw-medium mb-0 fs-15 text-truncate">Cafe Coffee Day</h6>
                                </div>
                                <div className="d-flex gap-5 align-items-center">
                                    <h6 className="fw-medium text-end mb-0">-$12.50</h6>
                                    <p className="text-muted fs-15">USD</p>
                                </div>
                            </div>
                            <div className="d-flex align-items-center gap-3">
                                <div className="size-9 avatar flex-shrink-0 bg-gradient-s-primary border border-primary-subtle border-dashed text-primary rounded">
                                    <i data-lucide="smartphone" className="size-4-5"></i>
                                </div>
                                <div className="overflow-hidden flex-grow-1">
                                    <p className="text-muted fs-sm">Recharge</p>
                                    <h6 className="fw-medium mb-0 fs-15 text-truncate">Jio Prepaid</h6>
                                </div>
                                <div className="d-flex gap-5 align-items-center">
                                    <h6 className="fw-medium text-end mb-0">-$9.99</h6>
                                    <p className="text-muted fs-15">USD</p>
                                </div>
                            </div>
                            <div className="d-flex align-items-center gap-3">
                                <div className="size-9 avatar flex-shrink-0 bg-gradient-s-success border border-success-subtle border-dashed text-success rounded">
                                    <i data-lucide="dollar-sign" className="size-4-5"></i>
                                </div>
                                <div className="overflow-hidden flex-grow-1">
                                    <p className="text-muted fs-sm">Freelance</p>
                                    <h6 className="fw-medium mb-0 fs-15 text-truncate">Upwork Payment</h6>
                                </div>
                                <div className="d-flex gap-5 align-items-center">
                                    <h6 className="fw-medium text-end mb-0">+$320.00</h6>
                                    <p className="text-muted fs-15">USD</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div className="col-xxl-6">
            <div className="card card-h-100">
                <div className="card-header d-flex flex-wrap gap-4 justify-content-between align-items-center">
                    <h5 className="card-title mb-0">Recent Orders</h5>
                    <a href="apps-ecommerce-orders-list.html" className="link link-custom-primary fs-15">View All <i className="ri-arrow-right-line ms-1"></i></a>
                </div>
                <div className="card-body">
                    <div className="table-card table-responsive custom-scroll">
                        <table className="table mb-0 table-hover text-nowrap align-middle">
                            <thead>
                                <tr>
                                    <th className="text-muted fw-medium">Order ID</th>
                                    <th className="text-muted fw-medium">Customer</th>
                                    <th className="text-muted fw-medium">Items</th>
                                    <th className="text-muted fw-medium">Price</th>
                                    <th className="text-muted fw-medium">Status</th>
                                    <th className="text-muted fw-medium text-end">Created</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>
                                        <a href="#!" className="link link-custom-primary">#003413</a>
                                    </td>
                                    <td>
                                        <div className="d-flex align-items-center gap-2">
                                            <img src="/assets/images/user-2.webp" className="img-fluid size-8 rounded-circle" alt="User 2">
                                            <a href="#!" className="link link-custom fw-medium">Robert Harris</a>
                                        </div>
                                    </td>
                                    <td>3</td>
                                    <td>$1,115.00</td>
                                    <td>
                                        <span className="badge bg-danger-subtle text-danger border border-danger-subtle">Cancelled</span>
                                    </td>
                                    <td className="text-end">12 Apr, 2022 <span className="text-muted fs-sm ms-1">03:00 AM</span></td>
                                </tr>
                                <tr>
                                    <td>
                                        <a href="#!" className="link link-custom-primary">#003414</a>
                                    </td>
                                    <td>
                                        <div className="d-flex align-items-center gap-2">
                                            <img src="/assets/images/user-3.webp" className="img-fluid size-8 rounded-circle" alt="User 3">
                                            <a href="#!" className="link link-custom fw-medium">Jane Doe</a>
                                        </div>
                                    </td>
                                    <td>1</td>
                                    <td>$120.00</td>
                                    <td>
                                        <span className="badge bg-success-subtle text-success border border-success-subtle">Delivered</span>
                                    </td>
                                    <td className="text-end">15 Apr, 2022 <span className="text-muted fs-sm ms-1">10:30 AM</span></td>
                                </tr>
                                <tr>
                                    <td>
                                        <a href="#!" className="link link-custom-primary">#003415</a>
                                    </td>
                                    <td>
                                        <div className="d-flex align-items-center gap-2">
                                            <img src="/assets/images/user-4.webp" className="img-fluid size-8 rounded-circle" alt="User 4">
                                            <a href="#!" className="link link-custom fw-medium">John Smith</a>
                                        </div>
                                    </td>
                                    <td>2</td>
                                    <td>$846.66</td>
                                    <td>
                                        <span className="badge bg-success-subtle text-success border border-success-subtle">Delivered</span>
                                    </td>
                                    <td className="text-end">15 Apr, 2022 <span className="text-muted fs-sm ms-1">10:30 AM</span></td>
                                </tr>
                                <tr>
                                    <td>
                                        <a href="#!" className="link link-custom-primary">#003416</a>
                                    </td>
                                    <td>
                                        <div className="d-flex align-items-center gap-2">
                                            <img src="/assets/images/user-5.webp" className="img-fluid size-8 rounded-circle" alt="User 5">
                                            <a href="#!" className="link link-custom fw-medium">Alice Green</a>
                                        </div>
                                    </td>
                                    <td>1</td>
                                    <td>$296.66</td>
                                    <td>
                                        <span className="badge bg-danger-subtle text-danger border border-danger-subtle">Cancelled</span>
                                    </td>
                                    <td className="text-end">15 Apr, 2022 <span className="text-muted fs-sm ms-1">10:30 AM</span></td>
                                </tr>
                                <tr>
                                    <td>
                                        <a href="#!" className="link link-custom-primary">#003417</a>
                                    </td>
                                    <td>
                                        <div className="d-flex align-items-center gap-2">
                                            <img src="/assets/images/user-6.webp" className="img-fluid size-8 rounded-circle" alt="User 6">
                                            <a href="#!" className="link link-custom fw-medium">Bob Brown</a>
                                        </div>
                                    </td>
                                    <td>3</td>
                                    <td>$1,541.66</td>
                                    <td>
                                        <span className="badge bg-warning-subtle text-warning border border-warning-subtle">Pending</span>
                                    </td>
                                    <td className="text-end">17 Apr, 2022 <span className="text-muted fs-sm ms-1">09:45 AM</span></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div className="row align-items-center g-3 mt-2">
                        <div className="col-md-5">
                            <p className="text-muted text-center text-md-start mb-0">Showing <b className="me-1">1-5</b>of<b className="ms-1">30</b> Results</p>
                        </div>
                        <div className="col-md-7">
                            <nav aria-label="Page navigation example">
                                <ul className="pagination justify-content-center justify-content-md-end mb-0 products-pagination">
                                    <li className="page-item disabled"><a className="page-link" href="#!"><i data-lucide="chevron-left" className="size-4"></i> Previous</a></li>
                                    <li className="page-item active"><a className="page-link" href="#!">1</a></li>
                                    <li className="page-item"><a className="page-link" href="#!">2</a></li>
                                    <li className="page-item"><a className="page-link" href="#!">Next <i data-lucide="chevron-right" className="size-4"></i></a></li>
                                </ul>
                            </nav>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div className="main-footer">
        <div className="w-100">
            <div className="row align-items-center">
                <div className="col-lg-6 d-none d-lg-block">
                    <ul className="d-flex align-items-center mb-0 list-unstyled gap-4">
                        <li><a href="#!" className="fw-medium link link-custom-primary">About</a></li>
                        <li><a href="#!" className="fw-medium link link-custom-primary">Support</a></li>
                        <li><a href="#!" className="fw-medium link link-custom-primary">Purchase Now</a></li>
                    </ul>
                </div>
                <div className="col-lg-6 text-muted text-center text-lg-end">
                    <div>
                        &copy; <span id="currentYearFooter"></span> Alloce. Crafted by <a href="https://1.envato.market/srbthemes" target="_blank" className="fw-semibold text-reset">SRBThemes</a>
                    </div>
                </div>
            </div>
        </div>
    </div></div>
</div>
</div>
      <Switcher />

    
        <HeaderMenu />
        <SideBar />
       


      
    </>
  )
}
export default MasterLayout;