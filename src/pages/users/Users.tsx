import BreadCrumb from '@/components/common/BreadCrumb'
import { UserListing } from './UserListing'
import { SearchBox } from '@/components/common/SearchBox'
import type { User } from '@/types/user.types';
import { useEffect, useState } from 'react';


export function Users() {

  const [users, setUsers] = useState<User[]>([]);
  useEffect(() => {
    const fetchUsers = async () => {
      const response = await fetch('/api/users');
      const data = await response.json();
      setUsers(data);
    };
    fetchUsers();
  }, []);
  
  return (
    <>
      <BreadCrumb activePage="Users" breadcrumbs={[{ label: 'Dashboards', href: '/dashboard' }]}/>


      <div  className="row gx-5">
        <div  className="col-lg-12">
            <div  className="d-flex align-items-center flex-wrap gap-4 mb-5">
                <div>
                    <h6 className="fs-16 mb-0">Users List {users.length}</h6>
                    <p  className="text-muted">Manage and track users in one place.</p>
                </div>
                <div  className="d-flex align-items-center gap-3 ms-auto flex-wrap">
                    <button type="button"  className="btn btn-dashed-primary avatar"><i  className="mgc_download_2_line me-2"></i>Export Users</button>
                    <a href="apps-invoice-create.html"  className="btn btn-primary avatar" id="addInvoiceButton"><i  className="mgc_add_line me-1 fs-sm"></i> Add User</a>
                </div>
            </div>
            </div>


        </div>


        <UserListing />

    
    </>
  )
}
