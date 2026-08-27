import { useMemo } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import BreadCrumb from '@/components/common/BreadCrumb'
import { catalogService } from '@/services/catalog.service'
import { contactsService } from '@/services/contacts.service'
import { ROUTES } from '@/constants/routes.constants'

/** @deprecated Use LeadsCallingPage */
export { ContactsLeadsPage } from '@/pages/contacts/LeadsCallingPage'

export function ContactsListsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['contacts', 'lists'],
    queryFn: () => contactsService.list({ page: 1, per_page: 50 }),
  })
  const lists = useMemo(() => {
    const map = new Map<string, number>()
    for (const c of data?.data ?? []) {
      for (const t of c.tags) map.set(t, (map.get(t) ?? 0) + 1)
    }
    return [...map.entries()].map(([name, count]) => ({
      id: name,
      name: `${name} list`,
      count,
    }))
  }, [data])

  return (
    <>
      <BreadCrumb
        activePage="Contact Lists"
        breadcrumbs={[{ label: 'Contacts', href: ROUTES.CONTACTS }]}
      />
      {isLoading && <p className="text-textmuted">Loading…</p>}
      <div className="grid grid-cols-12 gap-4">
        {lists.map((l) => (
          <div key={l.id} className="xl:col-span-4 col-span-12">
            <div className="box">
              <div className="box-body">
                <h6 className="font-semibold capitalize">{l.name}</h6>
                <div className="text-textmuted">{l.count} contacts</div>
              </div>
            </div>
          </div>
        ))}
        {!isLoading && lists.length === 0 && (
          <p className="text-textmuted">No tagged lists yet.</p>
        )}
      </div>
    </>
  )
}

export function ContactsTagsPage() {
  const { data } = useQuery({
    queryKey: ['contacts', 'tags'],
    queryFn: () => contactsService.list({ page: 1, per_page: 50 }),
  })
  const tags = useMemo(() => {
    const map = new Map<string, number>()
    for (const c of data?.data ?? []) {
      for (const t of c.tags) map.set(t, (map.get(t) ?? 0) + 1)
    }
    return [...map.entries()]
  }, [data])

  return (
    <>
      <BreadCrumb
        activePage="Contact Tags"
        breadcrumbs={[{ label: 'Contacts', href: ROUTES.CONTACTS }]}
      />
      <div className="flex flex-wrap gap-2">
        {tags.map(([tag, count]) => (
          <span key={tag} className="badge bg-primary-transparent fs-13 p-2">
            {tag} · {count}
          </span>
        ))}
      </div>
    </>
  )
}

export function ContactsExportPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['contacts', 'export'],
    queryFn: () => contactsService.list({ page: 1, per_page: 500 }),
  })

  const download = () => {
    const rows = data?.data ?? []
    const header = 'firstName,lastName,email,phone,company,tags,status'
    const body = rows
      .map((c) =>
        [
          c.firstName,
          c.lastName,
          c.email,
          c.phone,
          c.company ?? '',
          c.tags.join('|'),
          c.status,
        ]
          .map((v) => `"${String(v).replaceAll('"', '""')}"`)
          .join(','),
      )
      .join('\n')
    const blob = new Blob([`${header}\n${body}`], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'contacts-export.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <>
      <BreadCrumb
        activePage="Export Contacts"
        breadcrumbs={[{ label: 'Contacts', href: ROUTES.CONTACTS }]}
      />
      <div className="box">
        <div className="box-body">
          <p className="text-textmuted">
            Export all contacts to CSV including tags and status.
          </p>
          <button
            type="button"
            className="ti-btn ti-btn-primary"
            disabled={isLoading || !(data?.data?.length)}
            onClick={download}
          >
            Download CSV ({data?.data?.length ?? 0})
          </button>
        </div>
      </div>
    </>
  )
}

export function IntegrationsMarketplacePage() {
  const queryClient = useQueryClient()
  const { data, isLoading } = useQuery({
    queryKey: ['integrations', 'all'],
    queryFn: () => catalogService.integrations(),
  })
  const toggle = useMutation({
    mutationFn: (id: string) => catalogService.toggleIntegration(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['integrations'] }),
  })

  return (
    <>
      <BreadCrumb
        activePage="Integrations"
        breadcrumbs={[{ label: 'Integrations', href: ROUTES.INTEGRATIONS }]}
      />
      <div className="grid grid-cols-12 gap-4">
        {isLoading && <p className="text-textmuted">Loading…</p>}
        {(data?.data ?? []).map((item) => (
          <div key={item.id} className="xl:col-span-4 md:col-span-6 col-span-12">
            <div className="box h-full">
              <div className="box-body">
                <div className="flex items-start gap-3 mb-3">
                  <div className="avatar avatar-md bg-primary-transparent">
                    <i className={item.logoIcon} />
                  </div>
                  <div>
                    <h6 className="font-semibold mb-1">{item.name}</h6>
                    <span
                      className={
                        item.status === 'connected'
                          ? 'badge bg-success-transparent'
                          : item.status === 'error'
                            ? 'badge bg-danger-transparent'
                            : 'badge bg-secondary-transparent'
                      }
                    >
                      {item.status}
                    </span>
                  </div>
                </div>
                <p className="text-textmuted fs-12 mb-3">{item.description}</p>
                <button
                  type="button"
                  className="ti-btn ti-btn-sm ti-btn-outline-primary"
                  disabled={toggle.isPending}
                  onClick={() => toggle.mutate(item.id)}
                >
                  {item.status === 'connected' ? 'Disconnect' : 'Connect'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}

function IntegrationsCategoryPage({
  title,
  category,
}: {
  title: string
  category: string
}) {
  const { data, isLoading } = useQuery({
    queryKey: ['integrations', category],
    queryFn: () => catalogService.integrations(category),
  })

  return (
    <>
      <BreadCrumb
        activePage={title}
        breadcrumbs={[{ label: 'Integrations', href: ROUTES.INTEGRATIONS }]}
      />
      <div className="box">
        <div className="box-body space-y-3">
          {isLoading && <p className="text-textmuted">Loading…</p>}
          {(data?.data ?? []).map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-3 border border-defaultborder rounded"
            >
              <div>
                <div className="font-medium">{item.name}</div>
                <div className="fs-12 text-textmuted">{item.description}</div>
              </div>
              <span className="badge bg-primary-transparent">{item.status}</span>
            </div>
          ))}
          {(data?.data?.length ?? 0) === 0 && !isLoading && (
            <p className="text-textmuted mb-0">No integrations in this category.</p>
          )}
        </div>
      </div>
    </>
  )
}

export function IntegrationsCrmPage() {
  return <IntegrationsCategoryPage title="CRM Integrations" category="crm" />
}
export function IntegrationsCalendarPage() {
  return <IntegrationsCategoryPage title="Calendar Integrations" category="calendar" />
}
export function IntegrationsTelephonyPage() {
  return <IntegrationsCategoryPage title="Telephony Integrations" category="telephony" />
}

export function IntegrationsWebhooksPage() {
  return (
    <>
      <BreadCrumb
        activePage="Webhooks"
        breadcrumbs={[{ label: 'Integrations', href: ROUTES.INTEGRATIONS }]}
      />
      <div className="box">
        <div className="box-body">
          <label className="form-label">Endpoint URL</label>
          <input
            className="form-control mb-3"
            defaultValue="https://hooks.example.com/voice"
          />
          <label className="form-label">Events</label>
          <div className="flex flex-wrap gap-2 mb-3">
            {['call.completed', 'campaign.started', 'agent.published'].map((e) => (
              <label key={e} className="badge bg-light text-default">
                <input type="checkbox" className="me-1" defaultChecked />
                {e}
              </label>
            ))}
          </div>
          <button type="button" className="ti-btn ti-btn-primary ti-btn-sm">
            Save webhook
          </button>
        </div>
      </div>
    </>
  )
}

export function IntegrationsApiKeysPage() {
  return (
    <>
      <BreadCrumb
        activePage="API Keys"
        breadcrumbs={[{ label: 'Integrations', href: ROUTES.INTEGRATIONS }]}
      />
      <div className="box">
        <div className="box-body">
          <p className="text-textmuted">
            Secret keys are shown only once at creation. Rotate keys regularly.
          </p>
          <div className="p-3 border border-defaultborder rounded mb-3">
            <div className="font-medium">Production key</div>
            <div className="fs-12 text-textmuted">
              sk_live_••••••••••••4f2a · Created 12 days ago (full key shown only at creation)
            </div>
          </div>
          <button type="button" className="ti-btn ti-btn-primary ti-btn-sm">
            Create API key
          </button>
        </div>
      </div>
    </>
  )
}

export function WorkflowsPage() {
  const queryClient = useQueryClient()
  const { data, isLoading } = useQuery({
    queryKey: ['workflows'],
    queryFn: () => catalogService.workflows(),
  })
  const toggle = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'active' | 'paused' }) =>
      catalogService.setWorkflowStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['workflows'] }),
  })

  return (
    <>
      <BreadCrumb
        activePage="Workflows"
        breadcrumbs={[{ label: 'Automation', href: ROUTES.WORKFLOWS }]}
      />
      <div className="box">
        <div className="box-body table-responsive">
          {isLoading ? (
            <p className="text-textmuted">Loading…</p>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Workflow</th>
                  <th>Trigger</th>
                  <th>Runs</th>
                  <th>Status</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {(data?.data ?? []).map((w) => (
                  <tr key={w.id}>
                    <td className="font-medium">{w.name}</td>
                    <td>{w.trigger}</td>
                    <td>{w.runs}</td>
                    <td>
                      <span className="badge bg-primary-transparent">{w.status}</span>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="ti-btn ti-btn-sm ti-btn-outline-primary"
                        onClick={() =>
                          toggle.mutate({
                            id: w.id,
                            status: w.status === 'active' ? 'paused' : 'active',
                          })
                        }
                      >
                        {w.status === 'active' ? 'Pause' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  )
}

export function AutomationsPage() {
  return <WorkflowsPage />
}

export function AutomationScheduledPage() {
  return (
    <>
      <BreadCrumb
        activePage="Scheduled Calls"
        breadcrumbs={[{ label: 'Automation', href: ROUTES.WORKFLOWS }]}
      />
      <div className="box">
        <div className="box-body">
          <p className="mb-0 text-textmuted">
            Scheduled outbound jobs appear here. Link campaigns with a future start time to
            populate this queue.
          </p>
        </div>
      </div>
    </>
  )
}

export function AutomationFollowupsPage() {
  return (
    <>
      <BreadCrumb
        activePage="Follow-ups"
        breadcrumbs={[{ label: 'Automation', href: ROUTES.WORKFLOWS }]}
      />
      <div className="box">
        <div className="box-body">
          <ul className="list-none mb-0 space-y-2">
            <li>No-answer → SMS after 15 minutes</li>
            <li>Demo booked → calendar invite + CRM note</li>
            <li>Failed call → retry next business day</li>
          </ul>
        </div>
      </div>
    </>
  )
}

export function AutomationTriggersPage() {
  return (
    <>
      <BreadCrumb
        activePage="Triggers"
        breadcrumbs={[{ label: 'Automation', href: ROUTES.WORKFLOWS }]}
      />
      <div className="box">
        <div className="box-body flex flex-wrap gap-2">
          {[
            'call.started',
            'call.completed',
            'call.failed',
            'campaign.started',
            'agent.published',
          ].map((t) => (
            <span key={t} className="badge bg-light text-default fs-13 p-2">
              {t}
            </span>
          ))}
        </div>
      </div>
    </>
  )
}
