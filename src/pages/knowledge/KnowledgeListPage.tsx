import { Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@/hooks/useQuery'
import BreadCrumb from '@/components/common/BreadCrumb'
import { knowledgeService } from '@/services/knowledge.service'
import { ROUTES, knowledgeDetailPath } from '@/constants/routes.constants'

export function KnowledgeListPage() {
  const navigate = useNavigate()
  const { data, isLoading, isError } = useQuery({
    queryKey: ['knowledge-bases'],
    queryFn: () => knowledgeService.list(),
  })

  return (
    <>
      <BreadCrumb
        activePage="Knowledge Bases"
        breadcrumbs={[{ label: 'AI & Knowledge', href: ROUTES.KNOWLEDGE }]}
      />
      <div className="box mb-3">
        <div className="box-header flex items-center justify-between">
          <div className="box-title">Knowledge Bases</div>
          <div className="flex gap-2">
            <Link to={ROUTES.KNOWLEDGE_DOCUMENTS} className="ti-btn ti-btn-outline-primary ti-btn-sm">
              Documents
            </Link>
            <Link to={ROUTES.KNOWLEDGE_FAQS} className="ti-btn ti-btn-outline-light ti-btn-sm">
              FAQs
            </Link>
          </div>
        </div>
        <div className="box-body">
          {isLoading && <p className="text-textmuted">Loading…</p>}
          {isError && <p className="text-danger">Failed to load knowledge bases.</p>}
          <div className="grid grid-cols-12 gap-4">
            {(data?.data ?? []).map((kb) => (
              <div key={kb.id} className="xl:col-span-4 md:col-span-6 col-span-12">
                <button
                  type="button"
                  className="box mb-0 w-full text-start hover:border-primary"
                  onClick={() => navigate(knowledgeDetailPath(kb.id))}
                >
                  <div className="box-body">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h6 className="font-semibold mb-0">{kb.name}</h6>
                      <span
                        className={
                          kb.status === 'ready'
                            ? 'badge bg-success-transparent'
                            : kb.status === 'processing'
                              ? 'badge bg-warning-transparent'
                              : 'badge bg-secondary-transparent'
                        }
                      >
                        {kb.status}
                      </span>
                    </div>
                    <p className="text-textmuted fs-12 mb-3">{kb.description}</p>
                    <div className="fs-12 text-textmuted">
                      {kb.documentCount} documents · {kb.agentIds.length} agents
                    </div>
                  </div>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
