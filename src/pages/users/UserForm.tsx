import BreadCrumb from '@/components/common/BreadCrumb'
import { ROUTES } from '@/constants/routes.constants'

export function UserForm() {
  return (
    <>
      <BreadCrumb
        activePage="Create User"
        breadcrumbs={[
          { label: 'Dashboards', href: '/dashboard' },
          { label: 'Users', href: ROUTES.USERS },
        ]}
      />
      <div className="box">
        <div className="box-header">
          <div className="box-title">User Details</div>
        </div>
        <div className="box-body">
          <form className="sm:grid grid-cols-12 gap-x-6 gap-y-4 mt-0">
            <div className="md:col-span-6 col-span-12">
              <label className="form-label" htmlFor="user-first-name">
                First Name
              </label>
              <input
                type="text"
                id="user-first-name"
                className="ti-form-control"
                placeholder="First name"
                aria-label="First name"
              />
            </div>
            <div className="md:col-span-6 col-span-12">
              <label className="form-label" htmlFor="user-last-name">
                Last Name
              </label>
              <input
                type="text"
                id="user-last-name"
                className="ti-form-control"
                placeholder="Last name"
                aria-label="Last name"
              />
            </div>
            <div className="md:col-span-6 col-span-12">
              <label htmlFor="user-email" className="form-label">
                Email
              </label>
              <input
                type="email"
                className="ti-form-control"
                id="user-email"
                placeholder="Email id"
              />
            </div>
            <div className="md:col-span-6 col-span-12">
              <label htmlFor="user-password" className="form-label">
                Password
              </label>
              <input
                type="password"
                className="ti-form-control"
                id="user-password"
                placeholder="Password"
              />
            </div>
            <div className="col-span-12">
              <label htmlFor="user-address" className="form-label">
                Address
              </label>
              <input
                type="text"
                className="ti-form-control"
                id="user-address"
                placeholder="1234 Main St"
              />
            </div>
            <div className="col-span-12">
              <label htmlFor="user-address2" className="form-label">
                Address 2
              </label>
              <input
                type="text"
                className="ti-form-control"
                id="user-address2"
                placeholder="Apartment, studio, or floor"
              />
            </div>
            <div className="md:col-span-6 col-span-12">
              <label htmlFor="user-city" className="form-label">
                City
              </label>
              <input type="text" className="ti-form-control" id="user-city" />
            </div>
            <div className="md:col-span-4 col-span-12">
              <label htmlFor="user-state" className="form-label">
                State
              </label>
              <select id="user-state" className="form-select">
                <option value="">Choose...</option>
                <option value="...">...</option>
              </select>
            </div>
            <div className="md:col-span-2 col-span-12">
              <label htmlFor="user-zip" className="form-label">
                Zip
              </label>
              <input type="text" className="ti-form-control" id="user-zip" />
            </div>
            <div className="col-span-12">
              <div className="form-check">
                <input className="form-check-input" type="checkbox" id="user-check" />
                <label className="form-check-label" htmlFor="user-check">
                  Check me out
                </label>
              </div>
            </div>
            <div className="col-span-12">
              <button type="submit" className="ti-btn ti-btn-primary">
                Save user
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
