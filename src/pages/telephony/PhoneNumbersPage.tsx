import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import BreadCrumb from '@/components/common/BreadCrumb'
import { DataTable } from '@/components/common/DataTable'
import type { DataTableColumn } from '@/components/common/DataTable'
import { phoneNumbersService } from '@/services/phone-numbers.service'
import { agentsService } from '@/services/agents.service'
import { toDataTableRows } from '@/lib/mock'
import type { PhoneNumber } from '@/types/phone-number.types'
import { ROUTES } from '@/constants/routes.constants'

export function PhoneNumbersPage() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [assigningId, setAssigningId] = useState<string | null>(null)
  const [agentId, setAgentId] = useState('')

  const { data, isLoading, isError } = useQuery({
    queryKey: ['phone-numbers', page],
    queryFn: () => phoneNumbersService.list({ page, per_page: 10 }),
  })

  const agentsQuery = useQuery({
    queryKey: ['agents', 'all'],
    queryFn: () => agentsService.list({ page: 1, per_page: 50 }),
  })

  const assignMutation = useMutation({
    mutationFn: () => phoneNumbersService.assign(assigningId!, agentId || null),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['phone-numbers'] })
      setAssigningId(null)
      setAgentId('')
    },
  })

  const releaseMutation = useMutation({
    mutationFn: (id: string) => phoneNumbersService.release(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['phone-numbers'] })
    },
  })

  const rows = useMemo(() => {
    if (!data?.success || !data.data) {
      return toDataTableRows<PhoneNumber>([], {
        page: 1,
        per_page: 10,
        total: 0,
        total_pages: 1,
      })
    }
    return toDataTableRows(
      data.data,
      data.meta ?? {
        page,
        per_page: 10,
        total: data.data.length,
        total_pages: 1,
      },
    )
  }, [data, page])

  const columns: DataTableColumn<PhoneNumber>[] = [
    {
      key: 'number',
      header: 'Number',
      render: (row) => (
        <div>
          <div className="font-medium">{row.number}</div>
          <div className="text-textmuted fs-12">{row.friendlyName}</div>
        </div>
      ),
    },
    { key: 'country', header: 'Country' },
    {
      key: 'provider',
      header: 'Provider',
      render: (row) => (
        <div>
          <div>{row.provider}</div>
          <div className="text-textmuted fs-12">
            {row.channel ?? 'pstn'}
            {row.providerKind === 'opensource' ? ' · OSS' : ''}
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <span
          className={
            row.status === 'assigned'
              ? 'badge bg-success-transparent'
              : row.status === 'released'
                ? 'badge bg-danger-transparent'
                : 'badge bg-secondary-transparent'
          }
        >
          {row.status}
        </span>
      ),
    },
    {
      key: 'agentName',
      header: 'Assigned Agent',
      render: (row) => row.agentName ?? '—',
    },
    {
      key: 'monthlyCost',
      header: 'Cost',
      align: 'end',
      render: (row) =>
        row.monthlyCost === 0 ? 'BYON / $0' : `$${row.monthlyCost.toFixed(2)}/mo`,
    },
    {
      key: 'id',
      header: 'Actions',
      render: (row) => (
        <div className="flex gap-1">
          <button
            type="button"
            className="ti-btn ti-btn-outline-primary ti-btn-sm"
            disabled={row.status === 'released'}
            onClick={() => {
              setAssigningId(row.id)
              setAgentId(row.agentId ?? '')
            }}
          >
            Assign
          </button>
          <button
            type="button"
            className="ti-btn ti-btn-outline-danger ti-btn-sm"
            disabled={row.status === 'released' || releaseMutation.isPending}
            onClick={() => releaseMutation.mutate(row.id)}
          >
            Release
          </button>
        </div>
      ),
    },
  ]

  return (
    <>
      <BreadCrumb
        activePage="Phone Numbers"
        breadcrumbs={[{ label: 'Telephony', href: ROUTES.PHONE_NUMBERS }]}
      />
      <div className="box">
        <div className="box-header flex items-center justify-between flex-wrap gap-2">
          <div className="box-title">Numbers</div>
          <div className="flex flex-wrap gap-2">
            <Link to={ROUTES.PHONE_PROVIDERS} className="ti-btn ti-btn-outline-light ti-btn-sm">
              Providers
            </Link>
            <Link to={ROUTES.PHONE_WHATSAPP} className="ti-btn ti-btn-outline-success ti-btn-sm">
              WhatsApp
            </Link>
            <Link to={ROUTES.PHONE_BUY} className="ti-btn ti-btn-primary ti-btn-sm">
              Add Number
            </Link>
          </div>
        </div>
        <div className="box-body">
          {isError ? (
            <p className="text-danger mb-0">Failed to load numbers.</p>
          ) : (
            <DataTable
              columns={columns}
              rows={rows}
              isLoading={isLoading}
              fetchData={(p) => setPage(p ?? 1)}
              itemsLabel="numbers"
              emptyMessage="No phone numbers"
            />
          )}
        </div>
      </div>

      {assigningId && (
        <div className="box mt-3">
          <div className="box-header">
            <div className="box-title">Assign to Agent</div>
          </div>
          <div className="box-body flex flex-wrap items-end gap-3">
            <div className="grow" style={{ minWidth: 220 }}>
              <label className="form-label">Agent</label>
              <select
                className="form-control"
                value={agentId}
                onChange={(e) => setAgentId(e.target.value)}
              >
                <option value="">Unassigned</option>
                {(agentsQuery.data?.data ?? []).map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="button"
              className="ti-btn ti-btn-primary"
              disabled={assignMutation.isPending}
              onClick={() => assignMutation.mutate()}
            >
              Save
            </button>
            <button
              type="button"
              className="ti-btn ti-btn-outline-light"
              onClick={() => setAssigningId(null)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  )
}
