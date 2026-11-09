import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { attributesApi, segmentsApi } from '@/api/endpoints/crm.api'
import { FormField } from '@/components/common/FormField'
import { PageHeader } from '@/components/common/PageHeader'
import { Panel } from '@/components/common/Panel'
import { ContactCell } from '@/components/features/contacts/ContactBits'
import { SegmentRuleEditor } from '@/components/features/contacts/SegmentRuleEditor'
import { SkeletonLines } from '@/components/ui/EmptyState'
import { ROUTES, to } from '@/constants/routes.constants'
import { useAction, useAll, useOne, useTenantQuery } from '@/hooks/queries/resource.queries'
import { useDebounce } from '@/hooks/useDebounce'
import type { SegmentRuleGroup } from '@/types/crm.types'
import { describeRules } from '@/utils/helpers/segment'

const STARTER: SegmentRuleGroup = { match: 'all', rules: [{ id: 'r1', field: 'consents.email', operator: 'equals', value: 'subscribed' }] }

export function SegmentBuilderPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const existing = useOne('segments', segmentsApi.get, id)
  const attributes = useAll('attributes', attributesApi.list)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [rules, setRules] = useState<SegmentRuleGroup>(STARTER)
  const [nameError, setNameError] = useState('')

  useEffect(() => {
    if (existing.data) {
      setName(existing.data.name)
      setDescription(existing.data.description)
      setRules(existing.data.rules)
    }
  }, [existing.data])

  const debouncedRules = useDebounce(rules, 400)
  const preview = useTenantQuery('segments', { preview: debouncedRules }, () => segmentsApi.preview(debouncedRules), { placeholderData: (prev) => prev })

  const save = useAction(
    'segments',
    () => {
      const body = { name: name.trim(), description: description.trim(), rules }
      return id ? segmentsApi.update(id, body) : segmentsApi.create({ ...body, contactCount: 0, lastComputedAt: null })
    },
    { success: 'Segment saved', invalidates: ['contacts'], onSuccess: (s) => navigate(to(ROUTES.SEGMENT, { id: s.id }), { replace: true }) },
  )

  const submit = () => {
    if (!name.trim()) return setNameError('Give the segment a name')
    setNameError('')
    save.mutate(undefined)
  }

  if (id && existing.isLoading) return <SkeletonLines lines={8} />

  const extraFields = (attributes.data?.data ?? []).filter((a) => !a.system).map((a) => ({ value: `attributes.${a.key}`, label: a.label }))

  return (
    <>
      <PageHeader
        back={{ label: 'Segments', to: ROUTES.SEGMENTS }}
        title={id ? name || 'Segment' : 'New segment'}
        description={describeRules({ rules })}
        actions={
          <>
            {id && <button type="button" className="btn btn-light" onClick={() => navigate(`${ROUTES.CONTACTS}?segmentId=${id}`)}>View contacts</button>}
            <button type="button" className="btn btn-primary" onClick={submit} disabled={save.isPending}>{save.isPending ? 'Saving…' : 'Save segment'}</button>
          </>
        }
      />
      <div className="row g-4">
        <div className="col-xl-8">
          <Panel title="Details" className="mb-4">
            <div className="row g-4">
              <FormField id="seg-name" label="Name" error={nameError} className="col-md-6">
                <input id="seg-name" className={`form-control${nameError ? ' is-invalid' : ''}`} value={name} onChange={(e) => setName(e.target.value)} />
              </FormField>
              <FormField id="seg-desc" label="Description" className="col-md-6">
                <input id="seg-desc" className="form-control" value={description} onChange={(e) => setDescription(e.target.value)} />
              </FormField>
            </div>
          </Panel>
          <Panel title="Conditions">
            <SegmentRuleEditor value={rules} onChange={setRules} extraFields={extraFields} />
          </Panel>
        </div>
        <div className="col-xl-4">
          <Panel title="Live preview" description="Updates as you edit conditions." className="position-sticky" bodyClassName="">
            {!preview.data ? (
              <SkeletonLines lines={5} />
            ) : (
              <>
                <div className="d-flex align-items-baseline gap-2 mb-4">
                  <span className={`fs-2 fw-semibold tabular-nums${preview.isFetching ? ' opacity-50' : ''}`}>{preview.data.count.toLocaleString()}</span>
                  <span className="text-muted">matching contacts</span>
                </div>
                <div className="d-flex flex-column gap-3">
                  {preview.data.sample.map((c) => <ContactCell key={c.id} contact={c} />)}
                  {preview.data.count > preview.data.sample.length && <span className="text-muted fs-sm">and {(preview.data.count - preview.data.sample.length).toLocaleString()} more</span>}
                </div>
              </>
            )}
          </Panel>
        </div>
      </div>
    </>
  )
}
