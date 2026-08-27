import BreadCrumb from '@/components/common/BreadCrumb'
import { useOrganizationStore } from '@/store/organization.store'
import { ROUTES } from '@/constants/routes.constants'
import { env } from '@/config/env.config'

export function SettingsPage() {
  const organizations = useOrganizationStore((s) => s.organizations)
  const currentOrganizationId = useOrganizationStore((s) => s.currentOrganizationId)
  const setCurrentOrganization = useOrganizationStore((s) => s.setCurrentOrganization)
  const current = organizations.find((o) => o.id === currentOrganizationId)

  return (
    <>
      <BreadCrumb
        activePage="Settings"
        breadcrumbs={[{ label: 'System', href: ROUTES.SETTINGS }]}
      />
      <div className="grid grid-cols-12 gap-4">
        <div className="xl:col-span-6 col-span-12">
          <div className="box">
            <div className="box-header">
              <div className="box-title">Organization</div>
            </div>
            <div className="box-body">
              <label className="form-label">Current organization</label>
              <select
                className="form-control"
                value={currentOrganizationId ?? ''}
                onChange={(e) => setCurrentOrganization(e.target.value)}
              >
                {organizations.map((org) => (
                  <option key={org.id} value={org.id}>
                    {org.name} ({org.plan})
                  </option>
                ))}
              </select>
              {current && (
                <p className="text-textmuted fs-12 mt-3 mb-0">
                  Slug: {current.slug} · Plan: {current.plan}
                </p>
              )}
            </div>
          </div>
        </div>
        <div className="xl:col-span-6 col-span-12">
          <div className="box">
            <div className="box-header">
              <div className="box-title">Preferences</div>
            </div>
            <div className="box-body">
              <p className="text-textmuted mb-2">
                Manage account preferences and application options.
              </p>
              <div className="fs-12 text-textmuted">
                App: {env.appName} · Env: {env.appEnv} · Mock API:{' '}
                {env.useMockApi ? 'on' : 'off'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
