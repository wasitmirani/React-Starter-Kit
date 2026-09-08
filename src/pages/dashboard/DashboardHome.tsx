import BreadCrumb from '@/components/common/BreadCrumb'


export function DashboardHome() {
  return (
  <>
    <BreadCrumb activePage="CRM Dashboard" breadcrumbs={[ {label: "Dashboards", href: "/dashboard"}]} />
    {/* Start:: row-1 */}
   
                {/* End:: row-3 */}
  </>
  )
}
