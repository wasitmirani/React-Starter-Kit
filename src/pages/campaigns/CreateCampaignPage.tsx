import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import BreadCrumb from '@/components/common/BreadCrumb'
import { campaignsService } from '@/services/campaigns.service'
import { agentsService } from '@/services/agents.service'
import { phoneNumbersService } from '@/services/phone-numbers.service'
import { contactsService } from '@/services/contacts.service'
import {
  campaignFormSchema,
  defaultCampaignFormValues,
  type CampaignFormValues,
} from '@/utils/validators/campaign.schema'
import { ROUTES, campaignDetailPath } from '@/constants/routes.constants'

const STEPS = [
  'Information',
  'Agent',
  'Phone Number',
  'Contacts',
  'Schedule',
  'Review',
] as const

export function CreateCampaignPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CampaignFormValues>({
    // zod v4 + RHF resolver
    resolver: zodResolver(campaignFormSchema) as never,
    defaultValues: defaultCampaignFormValues,
    mode: 'onBlur',
  })
  const values = watch()

  const agentsQuery = useQuery({
    queryKey: ['agents', 'picker'],
    queryFn: () => agentsService.list({ page: 1, per_page: 50 }),
  })
  const phonesQuery = useQuery({
    queryKey: ['phone-numbers', 'picker'],
    queryFn: () => phoneNumbersService.list({ page: 1, per_page: 50 }),
  })
  const contactsQuery = useQuery({
    queryKey: ['contacts', 'picker'],
    queryFn: () => contactsService.list({ page: 1, per_page: 50 }),
  })

  const createMutation = useMutation({
    mutationFn: (payload: CampaignFormValues) =>
      campaignsService.create({
        ...payload,
        scheduleStart: payload.scheduleStart || undefined,
        scheduleEnd: payload.scheduleEnd || undefined,
      }),
    onSuccess: (res) => {
      if (res.success && res.data) navigate(campaignDetailPath(res.data.id))
      else navigate(ROUTES.CAMPAIGNS)
    },
  })

  const toggleContact = (id: string) => {
    const current = values.contactIds ?? []
    setValue(
      'contactIds',
      current.includes(id) ? current.filter((c) => c !== id) : [...current, id],
      { shouldValidate: true },
    )
  }

  const onLaunch = handleSubmit((data) => createMutation.mutate(data))

  return (
    <>
      <BreadCrumb
        activePage="Create Campaign"
        breadcrumbs={[{ label: 'Campaigns', href: ROUTES.CAMPAIGNS }]}
      />

      <div className="box mb-3">
        <div className="box-body flex flex-wrap gap-2">
          {STEPS.map((label, i) => (
            <button
              key={label}
              type="button"
              className={`badge ${i === step ? 'bg-primary' : 'bg-light text-default'}`}
              onClick={() => setStep(i)}
            >
              {i + 1}. {label}
            </button>
          ))}
        </div>
      </div>

      <div className="box">
        <div className="box-header flex items-center justify-between">
          <div className="box-title">{STEPS[step]}</div>
          <div className="flex gap-2">
            <Link to={ROUTES.CAMPAIGNS} className="ti-btn ti-btn-outline-light ti-btn-sm">
              Cancel
            </Link>
            {step > 0 && (
              <button
                type="button"
                className="ti-btn ti-btn-outline-primary ti-btn-sm"
                onClick={() => setStep((s) => s - 1)}
              >
                Back
              </button>
            )}
            {step < STEPS.length - 1 ? (
              <button
                type="button"
                className="ti-btn ti-btn-primary ti-btn-sm"
                onClick={() => setStep((s) => s + 1)}
              >
                Next
              </button>
            ) : (
              <button
                type="button"
                className="ti-btn ti-btn-primary ti-btn-sm"
                disabled={createMutation.isPending}
                onClick={() => void onLaunch()}
              >
                {createMutation.isPending ? 'Launching…' : 'Launch Campaign'}
              </button>
            )}
          </div>
        </div>
        <div className="box-body">
          {step === 0 && (
            <>
              <div className="mb-3">
                <label className="form-label">Campaign Name</label>
                <input className="form-control" {...register('name')} />
                {errors.name && (
                  <div className="text-danger fs-12">{errors.name.message}</div>
                )}
              </div>
              <div className="mb-3">
                <label className="form-label">Description</label>
                <textarea className="form-control" rows={3} {...register('description')} />
                {errors.description && (
                  <div className="text-danger fs-12">{errors.description.message}</div>
                )}
              </div>
            </>
          )}

          {step === 1 && (
            <div className="mb-3">
              <label className="form-label">Select Agent</label>
              <select className="form-control" {...register('agentId')}>
                <option value="">Choose…</option>
                {(agentsQuery.data?.data ?? []).map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
              {errors.agentId && (
                <div className="text-danger fs-12">{errors.agentId.message}</div>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="mb-3">
              <label className="form-label">Select Phone Number</label>
              <select className="form-control" {...register('phoneNumberId')}>
                <option value="">Choose…</option>
                {(phonesQuery.data?.data ?? []).map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.number} · {p.friendlyName}
                  </option>
                ))}
              </select>
              {errors.phoneNumberId && (
                <div className="text-danger fs-12">{errors.phoneNumberId.message}</div>
              )}
            </div>
          )}

          {step === 3 && (
            <div>
              <label className="form-label">Select Contacts</label>
              <div className="table-responsive">
                <table className="table">
                  <tbody>
                    {(contactsQuery.data?.data ?? []).map((c) => (
                      <tr key={c.id}>
                        <td style={{ width: 40 }}>
                          <input
                            type="checkbox"
                            checked={(values.contactIds ?? []).includes(c.id)}
                            onChange={() => toggleContact(c.id)}
                          />
                        </td>
                        <td>
                          {c.firstName} {c.lastName}
                        </td>
                        <td>{c.phone}</td>
                        <td>{c.company ?? '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {errors.contactIds && (
                <div className="text-danger fs-12">{errors.contactIds.message}</div>
              )}
            </div>
          )}

          {step === 4 && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="form-label">Schedule Start</label>
                <input type="datetime-local" className="form-control" {...register('scheduleStart')} />
              </div>
              <div>
                <label className="form-label">Schedule End</label>
                <input type="datetime-local" className="form-control" {...register('scheduleEnd')} />
              </div>
              <div>
                <label className="form-label">Retry Policy</label>
                <Controller
                  name="retryPolicy"
                  control={control}
                  render={({ field }) => (
                    <input
                      type="number"
                      className="form-control"
                      value={field.value}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  )}
                />
              </div>
              <div>
                <label className="form-label">Call Limit</label>
                <Controller
                  name="callLimit"
                  control={control}
                  render={({ field }) => (
                    <input
                      type="number"
                      className="form-control"
                      value={field.value}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  )}
                />
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-textmuted fs-12">Name</div>
                <div>{values.name || '—'}</div>
              </div>
              <div>
                <div className="text-textmuted fs-12">Agent</div>
                <div>{values.agentId || '—'}</div>
              </div>
              <div>
                <div className="text-textmuted fs-12">Phone</div>
                <div>{values.phoneNumberId || '—'}</div>
              </div>
              <div>
                <div className="text-textmuted fs-12">Contacts</div>
                <div>{(values.contactIds ?? []).length}</div>
              </div>
              <div>
                <div className="text-textmuted fs-12">Retries</div>
                <div>{values.retryPolicy}</div>
              </div>
              <div>
                <div className="text-textmuted fs-12">Call limit</div>
                <div>{values.callLimit}</div>
              </div>
            </div>
          )}

          {createMutation.isError && (
            <p className="text-danger mt-3 mb-0">Fix validation errors before launching.</p>
          )}
        </div>
      </div>
    </>
  )
}
