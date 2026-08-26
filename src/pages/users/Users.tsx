import BreadCrumb from '@/components/common/BreadCrumb'
import { UserListing } from './UserListing'

export function Users() {
  return (
    <>
      <BreadCrumb
        activePage="Users"
        breadcrumbs={[{ label: 'Dashboards', href: '/dashboard' }]}
      />

      <div className="sm:grid grid-cols-12 gap-x-4 gap-y-0">
        <div className="xl:col-span-12 col-span-12">
          <div className="sm:grid grid-cols-12 gap-x-4 gap-y-0">
            <div className="xl:col-span-3 lg:col-span-6 col-span-12">
              <div className="box dashboard-main-card primary">
                <div className="box-body">
                  <div className="flex items-start gap-4">
                    <div className="grow">
                      <div className="mb-1 text-textmuted fs-12">New Users</div>
                      <div className="flex items-center gap-2 mb-1!">
                        <div className="font-semibold fs-22 mb-0!">
                          <span className="count-up" data-count="42">
                            42
                          </span>
                        </div>
                        <span className="badge bg-primary-transparent">12,345</span>
                      </div>
                      <p className="text-textmuted fs-12 mb-0! leading-none">
                        <span className="text-success me-1 font-medium">
                          <i className="ri-arrow-up-s-line me-1 align-middle"></i>3.25%
                        </span>
                        <span>this month</span>
                      </p>
                    </div>
                    <div className="avatar avatar-md bg-primary-transparent svg-primary">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
                        <rect width="256" height="256" fill="none" />
                        <path d="M216,40H40A16,16,0,0,0,24,56V208a8,8,0,0,0,11.58,7.15L64,200.94l28.42,14.21a8,8,0,0,0,7.16,0L128,200.94l28.42,14.21a8,8,0,0,0,7.16,0L192,200.94l28.42,14.21A8,8,0,0,0,232,208V56A16,16,0,0,0,216,40ZM176,144H80a8,8,0,0,1,0-16h96a8,8,0,0,1,0,16Zm0-32H80a8,8,0,0,1,0-16h96a8,8,0,0,1,0,16Z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="xl:col-span-3 lg:col-span-6 col-span-12">
              <div className="box dashboard-main-card secondary">
                <div className="box-body">
                  <div className="flex items-start gap-4">
                    <div className="grow">
                      <div className="mb-1 text-textmuted fs-12">Completed Users</div>
                      <div className="flex items-center gap-2 mb-1!">
                        <div className="font-semibold fs-22 mb-0!">
                          <span className="count-up" data-count="320">
                            320
                          </span>
                        </div>
                        <span className="badge bg-secondary-transparent">4,176</span>
                      </div>
                      <p className="text-textmuted fs-12 mb-0! leading-none">
                        <span className="text-danger me-1 font-medium">
                          <i className="ri-arrow-down-s-line me-1 align-middle"></i>1.16%
                        </span>
                        <span>this month</span>
                      </p>
                    </div>
                    <div className="avatar avatar-md bg-secondary-transparent svg-secondary">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
                        <rect width="256" height="256" fill="none" />
                        <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm45.66,85.66-56,56a8,8,0,0,1-11.32,0l-24-24a8,8,0,0,1,11.32-11.32L112,148.69l50.34-50.35a8,8,0,0,1,11.32,11.32Z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="xl:col-span-3 lg:col-span-6 col-span-12">
              <div className="box dashboard-main-card success">
                <div className="box-body">
                  <div className="flex items-start gap-4">
                    <div className="grow">
                      <div className="mb-1 text-textmuted fs-12">Pending Users</div>
                      <div className="flex items-center gap-2 mb-1!">
                        <div className="font-semibold fs-22 mb-0!">
                          <span className="count-up" data-count="81">
                            81
                          </span>
                        </div>
                        <span className="badge bg-success-transparent">7,064</span>
                      </div>
                      <p className="text-textmuted fs-12 mb-0! leading-none">
                        <span className="text-success me-1 font-medium">
                          <i className="ri-arrow-up-s-line me-1 align-middle"></i>0.25%
                        </span>
                        <span>this month</span>
                      </p>
                    </div>
                    <div className="avatar avatar-md bg-success-transparent svg-success">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
                        <rect width="256" height="256" fill="none" />
                        <path d="M100,116.43a8,8,0,0,0,4-6.93v-72A8,8,0,0,0,93.34,30,104.06,104.06,0,0,0,25.73,147a8,8,0,0,0,4.52,5.81,7.86,7.86,0,0,0,3.35.74,8,8,0,0,0,4-1.07ZM88,49.62v55.26L40.12,132.51C40,131,40,129.48,40,128A88.12,88.12,0,0,1,88,49.62ZM232,128A104,104,0,0,1,38.32,180.7a8,8,0,0,1,2.87-11L120,123.83V32a8,8,0,0,1,8-8,104.05,104.05,0,0,1,89.74,51.48c.11.16.21.32.31.49s.2.37.29.55A103.34,103.34,0,0,1,232,128Z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="xl:col-span-3 lg:col-span-6 col-span-12">
              <div className="box dashboard-main-card warning">
                <div className="box-body">
                  <div className="flex items-start gap-4">
                    <div className="grow">
                      <div className="mb-1 text-textmuted fs-12">In Progress Users</div>
                      <div className="flex items-center gap-2 mb-1!">
                        <div className="font-semibold fs-22 mb-0!">
                          <span className="count-up" data-count="33">
                            33
                          </span>
                          K
                        </div>
                        <span className="badge bg-warning-transparent">1,105</span>
                      </div>
                      <p className="text-textmuted fs-12 mb-0! leading-none">
                        <span className="text-success me-1 font-medium">
                          <i className="ri-arrow-up-s-line me-1 align-middle"></i>0.46%
                        </span>
                        <span>this month</span>
                      </p>
                    </div>
                    <div className="avatar avatar-md bg-warning-transparent svg-warning">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
                        <rect width="256" height="256" fill="none" />
                        <path d="M200,75.64V40a16,16,0,0,0-16-16H72A16,16,0,0,0,56,40V76a16.07,16.07,0,0,0,6.4,12.8L114.67,128,62.4,167.2A16.07,16.07,0,0,0,56,180v36a16,16,0,0,0,16,16H184a16,16,0,0,0,16-16V180.36a16.09,16.09,0,0,0-6.35-12.77L141.27,128l52.38-39.59A16.09,16.09,0,0,0,200,75.64ZM184,40V64H72V40Zm0,176H72V180l56-42,56,42.35Z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-3">
        <UserListing />
      </div>
    </>
  )
}
