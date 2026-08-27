import { useQuery } from '@/hooks/useQuery'
import BreadCrumb from '@/components/common/BreadCrumb'
import { knowledgeService } from '@/services/knowledge.service'
import { ROUTES } from '@/constants/routes.constants'

export function KnowledgeDocumentsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['knowledge-docs', 'all'],
    queryFn: () => knowledgeService.documents(),
  })

  return (
    <>
      <BreadCrumb
        activePage="Documents"
        breadcrumbs={[{ label: 'Knowledge', href: ROUTES.KNOWLEDGE }]}
      />
      <div className="box">
        <div className="box-header">
          <div className="box-title">All Documents</div>
        </div>
        <div className="box-body table-responsive">
          {isLoading ? (
            <p className="text-textmuted">Loading…</p>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>KB</th>
                  <th>Progress</th>
                </tr>
              </thead>
              <tbody>
                {(data?.data ?? []).map((doc) => (
                  <tr key={doc.id}>
                    <td>{doc.name}</td>
                    <td>{doc.type}</td>
                    <td>
                      <span className="badge bg-primary-transparent">{doc.status}</span>
                    </td>
                    <td>{doc.knowledgeBaseId}</td>
                    <td>{doc.progress}%</td>
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

export function KnowledgeFaqsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['knowledge-faqs'],
    queryFn: () => knowledgeService.faqs(),
  })

  return (
    <>
      <BreadCrumb
        activePage="FAQs"
        breadcrumbs={[{ label: 'Knowledge', href: ROUTES.KNOWLEDGE }]}
      />
      <div className="box">
        <div className="box-header">
          <div className="box-title">FAQ Library</div>
        </div>
        <div className="box-body space-y-3">
          {isLoading && <p className="text-textmuted">Loading…</p>}
          {(data?.data ?? []).map((faq) => (
            <div key={faq.id} className="p-3 border border-defaultborder rounded">
              <div className="font-medium mb-1">{faq.question}</div>
              <div className="text-textmuted">{faq.answer}</div>
              <div className="fs-11 text-textmuted mt-2">{faq.knowledgeBaseId}</div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

export function KnowledgeWebsitesPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['knowledge-websites'],
    queryFn: () => knowledgeService.websites(),
  })

  return (
    <>
      <BreadCrumb
        activePage="Websites"
        breadcrumbs={[{ label: 'Knowledge', href: ROUTES.KNOWLEDGE }]}
      />
      <div className="box">
        <div className="box-header">
          <div className="box-title">Crawled Websites</div>
        </div>
        <div className="box-body table-responsive">
          {isLoading ? (
            <p className="text-textmuted">Loading…</p>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>URL</th>
                  <th>Status</th>
                  <th>Pages</th>
                  <th>KB</th>
                </tr>
              </thead>
              <tbody>
                {(data?.data ?? []).map((w) => (
                  <tr key={w.id}>
                    <td>{w.url}</td>
                    <td>
                      <span className="badge bg-primary-transparent">{w.status}</span>
                    </td>
                    <td>{w.pagesIndexed}</td>
                    <td>{w.knowledgeBaseId}</td>
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

export function KnowledgeInsightsPage() {
  return (
    <>
      <BreadCrumb
        activePage="AI Insights"
        breadcrumbs={[{ label: 'Knowledge', href: ROUTES.KNOWLEDGE }]}
      />
      <div className="grid grid-cols-12 gap-4">
        {[
          { title: 'Top unanswered questions', body: 'Pricing for enterprise SSO' },
          { title: 'Most cited document', body: 'Pricing Guide.pdf' },
          { title: 'Coverage gaps', body: 'Refund policy not indexed' },
        ].map((card) => (
          <div key={card.title} className="xl:col-span-4 col-span-12">
            <div className="box">
              <div className="box-body">
                <div className="text-textmuted fs-12 mb-1">{card.title}</div>
                <div className="font-medium">{card.body}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
