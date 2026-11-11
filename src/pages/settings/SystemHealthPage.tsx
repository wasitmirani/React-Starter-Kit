import { systemApi } from '@/api/endpoints/platform.api'
import { errorMessage } from '@/api/errors'
import { QueryError } from '@/components/common/Misc'
import { PageHeader } from '@/components/common/PageHeader'
import { Panel } from '@/components/common/Panel'
import { SkeletonLines } from '@/components/ui/EmptyState'
import { StatusBadge, ToneBadge } from '@/components/ui/StatusBadge'
import { useTenantQuery } from '@/hooks/queries/resource.queries'
import type { ServiceHealth } from '@/types/platform.types'
import { formatPercent } from '@/utils/formatters/number.formatter'

const OWNER_LABEL: Record<ServiceHealth['owner'], string> = { nestjs: 'NestJS core', go: 'Go service', fastapi: 'FastAPI', infra: 'Infrastructure' }

export function SystemHealthPage() {
  const health = useTenantQuery('system', 'health', systemApi.health, { refetchInterval: 30_000 })
  const services = health.data ?? []
  const worst = services.some((s) => s.status === 'down') ? 'down' : services.some((s) => s.status === 'degraded') ? 'degraded' : 'operational'
  return (
    <>
      <PageHeader title="System health" description="Status of the services this workspace depends on. Refreshes every 30 seconds." meta={services.length > 0 && <StatusBadge status={worst} />} actions={<button type="button" className="btn btn-light" onClick={() => health.refetch()} disabled={health.isFetching}><i className="ri-refresh-line" /> Refresh</button>} />
      {health.isError && <QueryError message={errorMessage(health.error)} onRetry={() => health.refetch()} />}
      <Panel flush>
        {health.isLoading ? <div className="p-4"><SkeletonLines lines={7} /></div> : (
          <table className="table align-middle mb-0">
            <thead><tr className="text-muted fs-sm"><th>Service</th><th>Owner</th><th>Status</th><th className="text-end">Latency</th><th className="text-end">Uptime (30d)</th></tr></thead>
            <tbody>
              {services.map((s) => (
                <tr key={s.name}>
                  <td><div className="fw-medium">{s.name}</div><div className="text-muted fs-sm">{s.detail}</div></td>
                  <td><ToneBadge tone="light">{OWNER_LABEL[s.owner]}</ToneBadge></td>
                  <td><StatusBadge status={s.status} /></td>
                  <td className="text-end tabular-nums">{s.latencyMs} ms</td>
                  <td className="text-end tabular-nums">{formatPercent(s.uptime30d)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Panel>
    </>
  )
}
