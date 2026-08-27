import { useParams } from 'react-router-dom'
import { useQuery } from '@/hooks/useQuery'
import BreadCrumb from '@/components/common/BreadCrumb'
import { contactsService } from '@/services/contacts.service'
import { CallLeadPanel } from '@/components/features/calls/CallLeadPanel'
import { Can } from '@/components/common/Can'
import { PERMISSIONS } from '@/config/permissions'
import { ROUTES } from '@/constants/routes.constants'

export function ContactDetailPage() {
  const { id = '' } = useParams()
  const { data, isLoading, isError } = useQuery({
    queryKey: ['contact', id],
    queryFn: () => contactsService.get(id),
    enabled: Boolean(id),
  })

  if (isLoading) return <div className="box box-body">Loading…</div>
  if (isError || !data?.success || !data.data) {
    return <div className="box box-body text-danger">Contact not found.</div>
  }

  const c = data.data
  const fullName = `${c.firstName} ${c.lastName}`.trim()

  return (
    <>
      <BreadCrumb
        activePage={fullName}
        breadcrumbs={[{ label: 'Contacts', href: ROUTES.CONTACTS }]}
      />

      <div className="grid grid-cols-12 gap-4">
        <div className="xl:col-span-5 col-span-12">
          <div className="box">
            <div className="box-header">
              <div className="box-title">{fullName}</div>
            </div>
            <div className="box-body grid grid-cols-2 gap-4">
              <div>
                <div className="text-textmuted fs-12">Email</div>
                <div>{c.email}</div>
              </div>
              <div>
                <div className="text-textmuted fs-12">Phone</div>
                <div>{c.phone}</div>
              </div>
              <div>
                <div className="text-textmuted fs-12">Company</div>
                <div>{c.company ?? '—'}</div>
              </div>
              <div>
                <div className="text-textmuted fs-12">Status</div>
                <div>{c.status}</div>
              </div>
              <div className="col-span-2">
                <div className="text-textmuted fs-12 mb-1">Tags</div>
                <div className="flex flex-wrap gap-1">
                  {c.tags.map((t) => (
                    <span key={t} className="badge bg-primary-transparent">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="xl:col-span-7 col-span-12">
          <Can permission={PERMISSIONS.CAMPAIGNS_START}>
            <CallLeadPanel target={{ name: fullName, phone: c.phone }} />
          </Can>
        </div>
      </div>
    </>
  )
}
