import { useEffect, useState } from 'react'
import { DataTable } from '@/components/common/DataTable'
import type {
  DataTableAction,  
  DataTableColumn,
} from '@/components/common/DataTable'
import { SearchBox } from '@/components/common/SearchBox'

const actions: DataTableAction<any>[] = [
  { key: 'view', label: 'View', icon: 'ri-eye-line', variant: 'view' },
  { key: 'edit', label: 'Edit', icon: 'ri-edit-line', variant: 'edit' },
  { key: 'delete', label: 'Delete', icon: 'ri-delete-bin-line', variant: 'delete' },
]

const TableHeader: DataTableColumn<any>[] = [
  { key: 'id', label: 'ID', sortable: true },
  { key: 'name', label: 'Name', sortable: true },
  { key: 'email', label: 'Email', sortable: true },
  { key: 'role', label: 'Role', sortable: true },
  { key: 'status', label: 'Status', sortable: true },
  { key: 'createdAt', label: 'Created At', sortable: true },
  { key: 'updatedAt', label: 'Updated At', sortable: true },
  { key: 'action', label: 'Action', sortable: true },
];
export function UserListing() {

  return (

    <>
    
    <div  className="card">
                <div  className="card-header d-flex flex-wrap gap-3 justify-content-between align-items-center">
                    <SearchBox
                      placeholder="Search by User..."
                      apiUrl="/users"
                      onFilterData={(data) => {
                        // TODO: set filtered users from search response
                        console.log(data)
                      }}
                      onReload={() => {
                        // TODO: refetch full users list when search is cleared
                      }}
                    />
                    <div  className="d-flex flex-wrap align-items-center gap-3">
                        
                      
                        <div  className="position-relative w-48">
                            <input type="text"  className="form-control pe-10" data-datepicker="" data-date-format="dd-MM-yyyy" placeholder="Due date"/>
                            <i data-lucide="calendar"  className="size-4 text-muted position-absolute top-50 end-0 me-4 translate-middle-y"></i>
                        </div>
                        <div id="statusFilter"  className="w-40">
                        <button type="button" aria-label="Wrench" className="btn btn-outline-primary btn-icon">
                          
                          <i className="ri-filter-line"></i>
                          </button>

                        </div>
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
                                    {
                                        TableHeader?.map((header)=>{
                                            return (
                                                <th key={header.key}>{header.label}</th>
                                            )
                                        })
                                    }
                                   
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
    </>
  )
}
