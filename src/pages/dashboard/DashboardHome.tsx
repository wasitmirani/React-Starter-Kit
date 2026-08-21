import { StatsCard } from '@/components/features/dashboard/StatsCard'
import { ActivityFeed } from '@/components/features/dashboard/ActivityFeed'

export function DashboardHome() {
  return (
    <section className="page">
      <h1>Dashboard</h1>
      <p>Overview of your workspace activity.</p>
      <div className="stats-grid">
        <StatsCard>Users</StatsCard>
        <StatsCard>Orders</StatsCard>
        <StatsCard>Revenue</StatsCard>
      </div>
      <ActivityFeed>
        <p>No recent activity yet.</p>
      </ActivityFeed>
    </section>
  )
}
