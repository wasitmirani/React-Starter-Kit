import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { templatesApi } from '@/api/endpoints/marketplace.api'
import { PageHeader } from '@/components/common/PageHeader'
import { AppLogo, RegionFlags } from '@/components/features/apps/AppLogo'
import { FlowPreview } from '@/components/features/automation/FlowPreview'
import { Drawer } from '@/components/ui/Drawer'
import { ToneBadge } from '@/components/ui/StatusBadge'
import { appById } from '@/constants/apps.constants'
import { AUTOMATION_TEMPLATES, TEMPLATE_CATEGORIES, type AutomationTemplate } from '@/constants/automation.constants'
import { TARGET_REGIONS } from '@/constants/regions.constants'
import { ROUTES, to } from '@/constants/routes.constants'
import { useAction } from '@/hooks/queries/resource.queries'

export function AutomationTemplatesPage() {
  const navigate = useNavigate()
  const [category, setCategory] = useState('')
  const [region, setRegion] = useState('')
  const [preview, setPreview] = useState<AutomationTemplate | null>(null)
  const apply = useAction('rules', templatesApi.use, { success: (r) => `"${r.name}" added as a draft. Review and publish it.`, onSuccess: (r) => navigate(to(ROUTES.AUTOMATION_RULE, { id: r.id })) })
  const list = useMemo(() => AUTOMATION_TEMPLATES.filter((t) => (!category || t.category === category) && (!region || t.regions.includes(region))), [category, region])

  return (
    <>
      <PageHeader
        back={{ label: 'Automation rules', to: ROUTES.AUTOMATION_RULES }}
        title="Automation templates"
        description="Proven flows for multi-channel sellers in the GCC, US, UK and Australia. Each template becomes a draft rule you can dry-run on recent orders before publishing."
        actions={<button type="button" className="btn btn-light" onClick={() => navigate(to(ROUTES.AUTOMATION_RULE, { id: 'new' }))}><i className="ri-add-line me-1" />Start from scratch</button>}
      />
      <div className="d-flex flex-column gap-2 mb-4">
        <div className="chip-row">
          <button type="button" className={`chip ${!category ? 'active' : ''}`} onClick={() => setCategory('')}>All</button>
          {TEMPLATE_CATEGORIES.map((c) => <button key={c} type="button" className={`chip ${category === c ? 'active' : ''}`} onClick={() => setCategory(c)}>{c}<span className="chip-count">{AUTOMATION_TEMPLATES.filter((t) => t.category === c).length}</span></button>)}
        </div>
        <div className="chip-row">
          <button type="button" className={`chip ${!region ? 'active' : ''}`} onClick={() => setRegion('')}>All markets</button>
          {TARGET_REGIONS.map((r) => <button key={r.code} type="button" className={`chip ${region === r.code ? 'active' : ''}`} onClick={() => setRegion(r.code)}>{r.flag} {r.short}</button>)}
        </div>
      </div>
      <div className="row g-3">
        {list.map((t) => (
          <div key={t.id} className="col-md-6 col-xxl-4">
            <div className="card app-card h-100 mb-0">
              <div className="card-body">
                <div className="d-flex align-items-start gap-3 mb-3">
                  <span className="icon-tile bg-primary-subtle text-primary"><i className={t.icon} /></span>
                  <div className="flex-1 min-w-0"><h6 className="mb-0">{t.name}</h6><div className="text-muted fs-xs">{t.category}</div></div>
                  {t.popular && <span className="badge bg-warning-subtle text-warning app-ribbon">Popular</span>}
                </div>
                <p className="text-muted fs-sm mb-3">{t.summary}</p>
                <ToneBadge tone="success" icon="ri-line-chart-line">{t.impact}</ToneBadge>
                <div className="d-flex justify-content-between align-items-center mt-3">
                  <div className="d-flex gap-1">{t.apps.slice(0, 4).map((a) => appById(a) && <span key={a} title={appById(a)!.name}><AppLogo appId={a} size="sm" /></span>)}</div>
                  <RegionFlags regions={t.regions} />
                </div>
              </div>
              <div className="card-footer d-flex gap-2">
                <button type="button" className="btn btn-sm btn-light" onClick={() => setPreview(t)}><i className="ri-flow-chart" /> Preview flow</button>
                <button type="button" className="btn btn-sm btn-primary ms-auto" disabled={apply.isPending} onClick={() => apply.mutate(t.id)}>Use template</button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <Drawer open={preview !== null} onClose={() => setPreview(null)} title={preview?.name} subtitle={preview?.impact} footer={preview && <><button type="button" className="btn btn-light" onClick={() => setPreview(null)}>Close</button><button type="button" className="btn btn-primary" disabled={apply.isPending} onClick={() => apply.mutate(preview.id)}>Use template</button></>}>
        {preview && (
          <>
            <p className="text-muted">{preview.summary}</p>
            <FlowPreview rule={preview.rule} />
            {preview.apps.length > 0 && <><h6 className="mt-4">Works with</h6><div className="d-flex flex-wrap gap-2">{preview.apps.map((a) => appById(a) && <span key={a} className="d-inline-flex align-items-center gap-2 border rounded-pill pe-3"><AppLogo appId={a} size="sm" />{appById(a)!.name}</span>)}</div></>}
          </>
        )}
      </Drawer>
    </>
  )
}
