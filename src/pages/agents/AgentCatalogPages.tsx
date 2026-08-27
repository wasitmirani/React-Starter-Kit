import { Link } from 'react-router-dom'
import { useQuery } from '@/hooks/useQuery'
import BreadCrumb from '@/components/common/BreadCrumb'
import { catalogService } from '@/services/catalog.service'
import { ROUTES } from '@/constants/routes.constants'

export function AgentTemplatesPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['catalog', 'templates'],
    queryFn: () => catalogService.templates(),
  })

  return (
    <>
      <BreadCrumb
        activePage="Agent Templates"
        breadcrumbs={[{ label: 'AI Agents', href: ROUTES.AGENTS }]}
      />
      <div className="grid grid-cols-12 gap-4">
        {isLoading && <p className="text-textmuted">Loading…</p>}
        {(data?.data ?? []).map((tpl) => (
          <div key={tpl.id} className="xl:col-span-4 md:col-span-6 col-span-12">
            <div className="box h-full">
              <div className="box-body">
                <span className="badge bg-primary-transparent mb-2">{tpl.category}</span>
                <h6 className="font-semibold">{tpl.name}</h6>
                <p className="text-textmuted fs-12">{tpl.description}</p>
                <div className="fs-12 mb-3">Voice: {tpl.voice}</div>
                <div className="flex flex-wrap gap-1 mb-3">
                  {tpl.useCases.map((u) => (
                    <span key={u} className="badge bg-light text-default">
                      {u}
                    </span>
                  ))}
                </div>
                <Link
                  to={ROUTES.AGENT_CREATE}
                  className="ti-btn ti-btn-primary ti-btn-sm"
                >
                  Use template
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}

export function AgentVoicesPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['catalog', 'voices'],
    queryFn: () => catalogService.voices(),
  })

  return (
    <>
      <BreadCrumb
        activePage="Voice Library"
        breadcrumbs={[{ label: 'AI Agents', href: ROUTES.AGENTS }]}
      />
      <div className="box">
        <div className="box-body table-responsive">
          {isLoading ? (
            <p className="text-textmuted">Loading…</p>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Voice</th>
                  <th>Provider</th>
                  <th>Language</th>
                  <th>Gender</th>
                  <th>Style</th>
                </tr>
              </thead>
              <tbody>
                {(data?.data ?? []).map((v) => (
                  <tr key={v.id}>
                    <td className="font-medium">{v.name}</td>
                    <td>{v.provider}</td>
                    <td>{v.language}</td>
                    <td>{v.gender}</td>
                    <td>{v.sampleLabel}</td>
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

export function AgentPromptsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['catalog', 'prompts'],
    queryFn: () => catalogService.prompts(),
  })

  return (
    <>
      <BreadCrumb
        activePage="Prompt Library"
        breadcrumbs={[{ label: 'AI Agents', href: ROUTES.AGENTS }]}
      />
      <div className="space-y-3">
        {isLoading && <p className="text-textmuted">Loading…</p>}
        {(data?.data ?? []).map((p) => (
          <div key={p.id} className="box mb-0">
            <div className="box-body">
              <div className="flex items-center justify-between mb-2">
                <h6 className="font-semibold mb-0">{p.title}</h6>
                <span className="badge bg-secondary-transparent">{p.category}</span>
              </div>
              <p className="mb-0 text-textmuted">{p.content}</p>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
