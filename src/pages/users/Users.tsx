import BreadCrumb from '@/components/common/BreadCrumb'
import { UserListing } from './UserListing'

export function Users() {
  return (
    <>
      <BreadCrumb activePage="Users" breadcrumbs={[{ label: 'Dashboards', href: '/dashboard' }]}/>


      <div  className="row gx-5">
        <div  className="col-lg-12">
            <div  className="d-flex align-items-center flex-wrap gap-4 mb-5">
                <div>
                    <h6 className="fs-16 mb-0">Users List</h6>
                    <p  className="text-muted">Manage and track users in one place.</p>
                </div>
                <div  className="d-flex align-items-center gap-3 ms-auto flex-wrap">
                    <button type="button"  className="btn btn-dashed-primary avatar"><i  className="mgc_download_2_line me-2"></i>Export Users</button>
                    <a href="apps-invoice-create.html"  className="btn btn-primary avatar" id="addInvoiceButton"><i  className="mgc_add_line me-1 fs-sm"></i> Add User</a>
                </div>
            </div>
            </div>

        <div  className="card">
                <div  className="card-header d-flex flex-wrap gap-3 justify-content-between align-items-center">
                    <div  className="flex-shrink-0">
                        <div  className="position-relative">
                            <input type="text"  className="form-control bg-light-subtle border-0 pe-9" placeholder="Search by User..."/>
                            <i  className="mgc_search_ai_line position-absolute top-50 end-0 me-3 translate-middle-y text-muted"></i>
                        </div>
                    </div>
                    <div  className="d-flex flex-wrap align-items-center gap-3">
                        <div  className="d-flex flex-wrap align-items-center gap-2">
                            <span  className="text-muted">Amount :</span>
                            <input type="number"  className="form-control w-28" placeholder="$0.00"/>
                            <span  className="text-muted">-</span>
                            <input type="number"  className="form-control w-28" placeholder="$0.00"/>
                        </div>
                        <div  className="position-relative w-48">
                            <input type="text"  className="form-control pe-10" data-datepicker="" data-date-format="dd-MM-yyyy" placeholder="Created date"/>
                            <i data-lucide="calendar"  className="size-4 text-muted position-absolute top-50 end-0 me-4 translate-middle-y"></i>
                        </div>
                        <div  className="position-relative w-48">
                            <input type="text"  className="form-control pe-10" data-datepicker="" data-date-format="dd-MM-yyyy" placeholder="Due date"/>
                            <i data-lucide="calendar"  className="size-4 text-muted position-absolute top-50 end-0 me-4 translate-middle-y"></i>
                        </div>
                        <div id="statusFilter"  className="w-40"></div>
                    </div>
                </div>
                <div  className="card-body">
                    <div  className="table-card table-responsive custom-scroll">
                        <table  className="table align-middle mb-0 text-nowrap">
                            <thead  className="bg-body-custom">
                                <tr>
                                    <th  className="w-10">
                                        <div  className="form-check check-primary">
                                            <input  className="form-check-input" type="checkbox" id="allCheck"/>
                                        </div>
                                    </th>
                                    <th>Invoice ID</th>
                                    <th>Customer</th>
                                    <th>Created By</th>
                                    <th>Invoice Date</th>
                                    <th>Due Date</th>
                                    <th>Amount</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>
                                        <div  className="form-check check-primary">
                                            <input  className="form-check-input" type="checkbox"/>
                                        </div>
                                    </td>
                                    <td><a href="apps-invoice-overview.html"  className="link link-custom-primary">#INV-10251</a></td>
                                    <td>
                                        <div  className="d-flex align-items-center gap-2">
                                            <img src="assets/images/user-1.webp"  className="size-9 rounded-circle" alt="User 1"/>
                                            <div>
                                                <h6  className="mb-0 fs-15">Robert Fox</h6>
                                                <p  className="text-muted fs-15">robert.fox@gmail.com</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div  className="d-flex align-items-center gap-2">
                                            <img src="assets/images/user-2.webp"  className="size-9 rounded-circle" alt="User 2"/>
                                            <div>
                                                <h6  className="mb-0 fs-15">Robert Fox</h6>
                                                <p  className="text-muted fs-15">Sales Executive</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td>05 Feb, 2026 <span  className="text-muted fs-sm ms-1">10:00 AM</span></td>
                                    <td>12 Feb, 2026 <span  className="text-muted fs-sm ms-1">10:00 AM</span></td>
                                    <td>$1,250.00</td>
                                    <td>
                                        <span  className="badge bg-success-subtle text-success border border-success-subtle rounded-1">
                                            Paid
                                        </span>
                                    </td>

                                    <td>
                                        <div  className="d-flex gap-2">
                                            <button type="button"  className="btn btn-outline-light btn-icon size-7-5" aria-label="Preview">
                                                <i  className="mgc_eye_line"></i>
                                            </button>
                                            <button type="button"  className="btn btn-outline-light btn-icon size-7-5" aria-label="Edit">
                                                <i  className="mgc_pencil_2_ai_line"></i>
                                            </button>
                                            <button type="button"  className="btn btn-outline-light btn-icon size-7-5" data-bs-toggle="modal" data-bs-target="#deleteModal" aria-label="Delete">
                                                <i  className="mgc_delete_2_line"></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>


                            
                            </tbody>
                        </table>
                    </div>
                    <div  className="row align-items-center g-3 mt-2">
                        <div  className="col-md-6">
                            <p  className="text-muted text-center text-md-start mb-0">Showing <b  className="me-1">1-10</b> of <b  className="ms-1">38</b> Results</p>
                        </div>
                        <div  className="col-md-6">
                          {/* <Pagination /> */}
                        </div>
                    </div>
                </div>
            </div>

        </div>
        {/* <UserListing /> */}
    
    </>
  )
}
