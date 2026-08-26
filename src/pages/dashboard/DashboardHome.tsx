import { StatsCard } from '@/components/features/dashboard/StatsCard'
import { ActivityFeed } from '@/components/features/dashboard/ActivityFeed'
import BreadCrumb from '@/components/common/BreadCrumb'

export function DashboardHome() {
  return (
  <>
    <BreadCrumb activePage="CRM Dashboard" breadcrumbs={[ {label: "Dashboards", href: "/dashboards"}]} />
    
  </>
  )
}
