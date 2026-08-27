import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import BreadCrumb from '@/components/common/BreadCrumb'
import { knowledgeService } from '@/services/knowledge.service'
import { ROUTES } from '@/constants/routes.constants'

const STATUS_BADGE: Record<string, string> = {
  ready: 'badge bg-success-transparent',
  processing: 'badge bg-warning-transparent',
  indexing: 'badge bg-info-transparent',
  uploading: 'badge bg-primary-transparent',
  failed: 'badge bg-danger-transparent',
}

export function KnowledgeDetailPage() {
  const { id = '' } = useParams()
  const queryClient = useQueryClient()
  const [uploadName, setUploadName] = useState('')

  const kbQuery = useQuery({
    queryKey: ['knowledge-base', id],
    queryFn: () => knowledgeService.get(id),
    enabled: Boolean(id),
  })
  const docsQuery = useQuery({
    queryKey: ['knowledge-docs', id],
    queryFn: () => knowledgeService.documents(id),
    enabled: Boolean(id),
  })

  const uploadMutation = useMutation({
    mutationFn: () => knowledgeService.uploadDocument(id, uploadName || 'New Document.pdf'),
    onSuccess: () => {
      setUploadName('')
      queryClient.invalidateQueries({ queryKey: ['knowledge-docs', id] })
      queryClient.invalidateQueries({ queryKey: ['knowledge-base', id] })
      queryClient.invalidateQueries({ queryKey: ['knowledge-bases'] })
    },
  })

  if (kbQuery.isLoading) return <div className="box box-body">Loading…</div>
  if (!kbQuery.data?.success || !kbQuery.data.data) {
    return <div className="box box-body text-danger">Knowledge base not found.</div>
  }

  const kb = kbQuery.data.data

  return (
    <>
      <BreadCrumb
        activePage={kb.name}
        breadcrumbs={[{ label: 'Knowledge Bases', href: ROUTES.KNOWLEDGE }]}
      />
      <div className="box mb-3">
        <div className="box-header flex items-center justify-between">
          <div>
            <div className="box-title">{kb.name}</div>
            <p className="text-textmuted fs-12 mb-0">{kb.description}</p>
          </div>
          <Link to={ROUTES.KNOWLEDGE} className="ti-btn ti-btn-outline-light ti-btn-sm">
            Back
          </Link>
        </div>
        <div className="box-body flex flex-wrap gap-3 items-end">
          <div className="grow" style={{ minWidth: 220 }}>
            <label className="form-label">Upload document</label>
            <input
              className="form-control"
              placeholder="Filename.pdf"
              value={uploadName}
              onChange={(e) => setUploadName(e.target.value)}
            />
          </div>
          <button
            type="button"
            className="ti-btn ti-btn-primary"
            disabled={uploadMutation.isPending}
            onClick={() => uploadMutation.mutate()}
          >
            {uploadMutation.isPending ? 'Uploading…' : 'Upload'}
          </button>
        </div>
      </div>

      <div className="box">
        <div className="box-header">
          <div className="box-title">Documents</div>
        </div>
        <div className="box-body table-responsive">
          <table className="table table-hover">
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Status</th>
                <th>Progress</th>
                <th>Size</th>
              </tr>
            </thead>
            <tbody>
              {(docsQuery.data?.data ?? []).map((doc) => (
                <tr key={doc.id}>
                  <td>{doc.name}</td>
                  <td>{doc.type}</td>
                  <td>
                    <span className={STATUS_BADGE[doc.status] ?? 'badge bg-light'}>
                      {doc.status}
                    </span>
                  </td>
                  <td>
                    <div className="progress progress-xs">
                      <div
                        className="progress-bar bg-primary"
                        style={{ width: `${doc.progress}%` }}
                      />
                    </div>
                    <span className="fs-11 text-textmuted">{doc.progress}%</span>
                  </td>
                  <td>{doc.sizeKb ? `${doc.sizeKb} KB` : '—'}</td>
                </tr>
              ))}
              {(docsQuery.data?.data?.length ?? 0) === 0 && (
                <tr>
                  <td colSpan={5} className="text-center text-textmuted">
                    No documents yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
