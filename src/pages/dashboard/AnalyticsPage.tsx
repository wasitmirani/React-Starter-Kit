import BreadCrumb from '@/components/common/BreadCrumb';
import { Chart } from '@/components/features/dashboard/Chart'

export function AnalyticsPage() {
  return (
    <>
    <BreadCrumb activePage="Analytics" breadcrumbs={[ {label: "Dashboards", href: "/dashboard"}]} />
    
  </>
  )
}
