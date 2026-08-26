import BreadCrumb from '@/components/common/BreadCrumb'
import { UserListing } from './UserListing'

export function Users() {
  return (
    <>
      <BreadCrumb
        activePage="Users"
        breadcrumbs={[{ label: 'Dashboards', href: '/dashboard' }]}
      />
      <UserListing />
    </>
  )
}
