import { Skeleton } from '@/components/ui/Skeleton'

export type PageSkeletonVariant = 'dashboard' | 'table' | 'default'

type PageSkeletonProps = {
  variant?: PageSkeletonVariant
}

function StatCardSkeleton() {
  return (
    <div className="box saas-skeleton-card">
      <div className="box-body">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <Skeleton width="40%" height={10} className="mb-3" />
            <Skeleton width="55%" height={22} className="mb-3" />
            <Skeleton width="70%" height={12} />
          </div>
          <Skeleton variant="circular" width={40} height={40} />
        </div>
      </div>
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="saas-page-skeleton" aria-busy="true" aria-label="Loading page">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <Skeleton width={160} height={18} className="mb-2" />
          <Skeleton width={100} height={10} />
        </div>
        <Skeleton variant="rounded" width={110} height={32} />
      </div>
      <div className="grid grid-cols-12 gap-x-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="xl:col-span-3 lg:col-span-6 col-span-12">
            <StatCardSkeleton />
          </div>
        ))}
        <div className="xl:col-span-8 col-span-12">
          <div className="box saas-skeleton-card">
            <div className="box-header">
              <Skeleton width={140} height={14} />
            </div>
            <div className="box-body">
              <Skeleton variant="rounded" width="100%" height={220} />
            </div>
          </div>
        </div>
        <div className="xl:col-span-4 col-span-12">
          <div className="box saas-skeleton-card">
            <div className="box-header">
              <Skeleton width={120} height={14} />
            </div>
            <div className="box-body flex flex-col gap-3">
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton variant="circular" width={32} height={32} />
                  <div className="flex-1">
                    <Skeleton width="80%" height={10} className="mb-2" />
                    <Skeleton width="45%" height={8} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function TableSkeleton() {
  return (
    <div className="saas-page-skeleton" aria-busy="true" aria-label="Loading page">
      <div className="mb-4 flex items-center justify-between gap-3">
        <Skeleton width={140} height={18} />
        <Skeleton variant="rounded" width={120} height={32} />
      </div>
      <div className="box saas-skeleton-card">
        <div className="box-header flex items-center justify-between gap-3">
          <Skeleton width={160} height={14} />
          <Skeleton variant="rounded" width={200} height={32} />
        </div>
        <div className="box-body flex flex-col gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton variant="circular" width={28} height={28} />
              <Skeleton width="22%" height={10} />
              <Skeleton width="18%" height={10} />
              <Skeleton width="14%" height={10} />
              <Skeleton width="12%" height={10} className="ms-auto" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function DefaultSkeleton() {
  return (
    <div className="saas-page-skeleton" aria-busy="true" aria-label="Loading page">
      <div className="mb-4">
        <Skeleton width={180} height={18} className="mb-2" />
        <Skeleton width={120} height={10} />
      </div>
      <div className="box saas-skeleton-card">
        <div className="box-body flex flex-col gap-4">
          <Skeleton width="40%" height={12} />
          <Skeleton variant="rounded" width="100%" height={48} />
          <Skeleton width="35%" height={12} />
          <Skeleton variant="rounded" width="100%" height={48} />
          <Skeleton width="30%" height={12} />
          <Skeleton variant="rounded" width="100%" height={96} />
          <div className="flex gap-2 justify-end mt-2">
            <Skeleton variant="rounded" width={88} height={36} />
            <Skeleton variant="rounded" width={88} height={36} />
          </div>
        </div>
      </div>
    </div>
  )
}

export function PageSkeleton({ variant = 'default' }: PageSkeletonProps) {
  if (variant === 'dashboard') return <DashboardSkeleton />
  if (variant === 'table') return <TableSkeleton />
  return <DefaultSkeleton />
}
