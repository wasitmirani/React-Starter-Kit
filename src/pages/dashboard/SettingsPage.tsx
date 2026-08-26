import BreadCrumb from '@/components/common/BreadCrumb'

export function SettingsPage() {
  return (
    <>
      <BreadCrumb
        activePage="Settings"
        breadcrumbs={[{ label: 'Dashboards', href: '/dashboard' }]}
      />
      <div className="box">
        <div className="box-header">
          <div className="box-title">Preferences</div>
        </div>
        <div className="box-body">
          <p className="text-textmuted mb-0">
            Manage account preferences and application options.
          </p>
        </div>
      </div>
    </>
  )
}
