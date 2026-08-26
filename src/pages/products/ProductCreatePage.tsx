import BreadCrumb from '@/components/common/BreadCrumb'
import { ROUTES } from '@/constants/routes.constants'

export function ProductCreatePage() {
  return (
    <>
      <BreadCrumb
        activePage="Create Product"
        breadcrumbs={[
          { label: 'Dashboards', href: '/dashboard' },
          { label: 'Products', href: ROUTES.PRODUCTS },
        ]}
      />
      <div className="box">
        <div className="box-header">
          <div className="box-title">Product Details</div>
        </div>
        <div className="box-body">
          <form className="sm:grid grid-cols-12 gap-x-6 gap-y-4 mt-0">
            <div className="md:col-span-6 col-span-12">
              <label className="form-label" htmlFor="product-first-name">
                First Name
              </label>
              <input
                type="text"
                id="product-first-name"
                className="ti-form-control"
                placeholder="First name"
                aria-label="First name"
              />
            </div>
            <div className="md:col-span-6 col-span-12">
              <label className="form-label" htmlFor="product-last-name">
                Last Name
              </label>
              <input
                type="text"
                id="product-last-name"
                className="ti-form-control"
                placeholder="Last name"
                aria-label="Last name"
              />
            </div>
            <div className="md:col-span-6 col-span-12">
              <label htmlFor="product-email" className="form-label">
                Email
              </label>
              <input
                type="email"
                className="ti-form-control"
                id="product-email"
                placeholder="Email id"
              />
            </div>
            <div className="md:col-span-6 col-span-12">
              <label htmlFor="product-password" className="form-label">
                Password
              </label>
              <input
                type="password"
                className="ti-form-control"
                id="product-password"
                placeholder="Password"
              />
            </div>
            <div className="col-span-12">
              <label htmlFor="product-address" className="form-label">
                Address
              </label>
              <input
                type="text"
                className="ti-form-control"
                id="product-address"
                placeholder="1234 Main St"
              />
            </div>
            <div className="col-span-12">
              <label htmlFor="product-address2" className="form-label">
                Address 2
              </label>
              <input
                type="text"
                className="ti-form-control"
                id="product-address2"
                placeholder="Apartment, studio, or floor"
              />
            </div>
            <div className="md:col-span-6 col-span-12">
              <label htmlFor="product-city" className="form-label">
                City
              </label>
              <input type="text" className="ti-form-control" id="product-city" />
            </div>
            <div className="md:col-span-4 col-span-12">
              <label htmlFor="product-state" className="form-label">
                State
              </label>
              <select id="product-state" className="form-select">
                <option value="">Choose...</option>
                <option value="...">...</option>
              </select>
            </div>
            <div className="md:col-span-2 col-span-12">
              <label htmlFor="product-zip" className="form-label">
                Zip
              </label>
              <input type="text" className="ti-form-control" id="product-zip" />
            </div>
            <div className="col-span-12">
              <div className="form-check">
                <input className="form-check-input" type="checkbox" id="product-check" />
                <label className="form-check-label" htmlFor="product-check">
                  Check me out
                </label>
              </div>
            </div>
            <div className="col-span-12">
              <button type="submit" className="ti-btn ti-btn-primary">
                Save product
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
