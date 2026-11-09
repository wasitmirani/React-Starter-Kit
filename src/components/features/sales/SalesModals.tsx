import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { companiesApi, contactsApi, dealsApi, tasksApi } from '@/api/endpoints/crm.api'
import { FormField } from '@/components/common/FormField'
import { Modal } from '@/components/common/Modal'
import { TEAM_MEMBERS } from '@/constants/crm.constants'
import { useAction, useAll } from '@/hooks/queries/resource.queries'
import {
  companySchema,
  dealSchema,
  taskSchema,
  type CompanySchema,
  type DealSchema,
  type TaskSchema,
} from '@/lib/validation/crm.schemas'
import type { Company, Deal, Pipeline, Task } from '@/types/crm.types'
import { toLocalInput } from '@/utils/formatters/date.formatter'
import { fullName } from '@/utils/helpers/contact'

function Footer({ formId, busy, onClose, label = 'Save' }: { formId: string; busy: boolean; onClose: () => void; label?: string }) {
  return (
    <>
      <button type="button" className="btn btn-light" onClick={onClose}>Cancel</button>
      <button type="submit" form={formId} className="btn btn-primary" disabled={busy}>{busy ? 'Saving…' : label}</button>
    </>
  )
}

const invalid = (error: unknown) => (error ? ' is-invalid' : '')

export function DealModal({ open, deal, pipeline, defaultStageId, onClose }: { open: boolean; deal: Deal | null; pipeline: Pipeline | undefined; defaultStageId?: string; onClose: () => void }) {
  const companies = useAll('companies', companiesApi.list)
  const contacts = useAll('contacts', contactsApi.list)
  const { register, handleSubmit, reset, formState: { errors } } = useForm<DealSchema>({ resolver: zodResolver(dealSchema) })

  useEffect(() => {
    if (!open) return
    reset({
      title: deal?.title ?? '',
      value: deal?.value ?? 0,
      stageId: deal?.stageId ?? defaultStageId ?? pipeline?.stages[0]?.id ?? '',
      companyId: deal?.companyId ?? '',
      contactId: deal?.contactId ?? '',
      ownerName: deal?.ownerName ?? TEAM_MEMBERS[0],
      expectedCloseDate: deal?.expectedCloseDate?.slice(0, 10) ?? '',
    })
  }, [open, deal, pipeline, defaultStageId, reset])

  const save = useAction(
    'deals',
    (raw: DealSchema) => {
      const v = dealSchema.parse(raw)
      const company = companies.data?.data.find((c) => c.id === v.companyId)
      const contact = contacts.data?.data.find((c) => c.id === v.contactId)
      const body = {
        title: v.title,
        value: v.value,
        stageId: v.stageId,
        ownerName: v.ownerName,
        companyId: company?.id ?? null,
        companyName: company?.name ?? null,
        contactId: contact?.id ?? null,
        contactName: contact ? fullName(contact) : null,
        expectedCloseDate: v.expectedCloseDate ? new Date(v.expectedCloseDate).toISOString() : null,
      }
      return deal ? dealsApi.update(deal.id, body) : dealsApi.create({ ...body, currency: 'USD', pipelineId: pipeline!.id, status: 'open' })
    },
    { success: deal ? 'Deal updated' : 'Deal created', invalidates: ['companies'], onSuccess: onClose },
  )

  return (
    <Modal open={open} onClose={onClose} title={deal ? 'Edit deal' : 'New deal'} size="lg" footer={<Footer formId="deal-form" busy={save.isPending} onClose={onClose} />}>
      <form id="deal-form" className="row g-4" noValidate onSubmit={handleSubmit((v) => save.mutate(v))}>
        <FormField id="deal-title" label="Deal name" error={errors.title?.message} className="col-md-8">
          <input id="deal-title" autoFocus className={`form-control${invalid(errors.title)}`} {...register('title')} />
        </FormField>
        <FormField id="deal-value" label="Value (USD)" error={errors.value?.message} className="col-md-4">
          <input id="deal-value" type="number" min={0} step={100} className={`form-control${invalid(errors.value)}`} {...register('value')} />
        </FormField>
        <FormField id="deal-stage" label="Stage" error={errors.stageId?.message} className="col-md-6">
          <select id="deal-stage" className="form-select" {...register('stageId')}>
            {pipeline?.stages.map((s) => <option key={s.id} value={s.id}>{s.name} ({s.probability}%)</option>)}
          </select>
        </FormField>
        <FormField id="deal-owner" label="Owner" error={errors.ownerName?.message} className="col-md-6">
          <select id="deal-owner" className="form-select" {...register('ownerName')}>
            {TEAM_MEMBERS.map((m) => <option key={m}>{m}</option>)}
          </select>
        </FormField>
        <FormField id="deal-company" label="Company" className="col-md-6">
          <select id="deal-company" className="form-select" {...register('companyId')}>
            <option value="">None</option>
            {(companies.data?.data ?? []).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </FormField>
        <FormField id="deal-contact" label="Primary contact" className="col-md-6">
          <select id="deal-contact" className="form-select" {...register('contactId')}>
            <option value="">None</option>
            {(contacts.data?.data ?? []).slice(0, 300).map((c) => <option key={c.id} value={c.id}>{fullName(c)}{c.companyName ? ` — ${c.companyName}` : ''}</option>)}
          </select>
        </FormField>
        <FormField id="deal-close" label="Expected close date" className="col-md-6">
          <input id="deal-close" type="date" className="form-control" {...register('expectedCloseDate')} />
        </FormField>
      </form>
    </Modal>
  )
}

export function CompanyModal({ open, company, onClose }: { open: boolean; company: Company | null; onClose: () => void }) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<CompanySchema>({ resolver: zodResolver(companySchema) })
  useEffect(() => {
    if (open) reset({ name: company?.name ?? '', domain: company?.domain ?? '', industry: company?.industry ?? '', size: company?.size ?? '11-50', country: company?.country ?? '', ownerName: company?.ownerName ?? TEAM_MEMBERS[0] })
  }, [open, company, reset])
  const save = useAction('companies', (v: CompanySchema) => (company ? companiesApi.update(company.id, v) : companiesApi.create({ ...v, contactCount: 0, openDealsValue: 0 })), {
    success: company ? 'Company updated' : 'Company created',
    onSuccess: onClose,
  })
  return (
    <Modal open={open} onClose={onClose} title={company ? 'Edit company' : 'New company'} footer={<Footer formId="company-form" busy={save.isPending} onClose={onClose} />}>
      <form id="company-form" className="row g-4" noValidate onSubmit={handleSubmit((v) => save.mutate(v))}>
        <FormField id="co-name" label="Name" error={errors.name?.message} className="col-12">
          <input id="co-name" autoFocus className={`form-control${invalid(errors.name)}`} {...register('name')} />
        </FormField>
        <FormField id="co-domain" label="Website domain" className="col-md-6">
          <input id="co-domain" className="form-control" placeholder="example.com" {...register('domain')} />
        </FormField>
        <FormField id="co-industry" label="Industry" className="col-md-6">
          <input id="co-industry" className="form-control" {...register('industry')} />
        </FormField>
        <FormField id="co-size" label="Employees" className="col-md-6">
          <select id="co-size" className="form-select" {...register('size')}>
            {['1-10', '11-50', '51-200', '201-1000', '1000+'].map((s) => <option key={s}>{s}</option>)}
          </select>
        </FormField>
        <FormField id="co-country" label="Country" className="col-md-6">
          <input id="co-country" className="form-control" {...register('country')} />
        </FormField>
        <FormField id="co-owner" label="Account owner" className="col-12">
          <select id="co-owner" className="form-select" {...register('ownerName')}>
            {TEAM_MEMBERS.map((m) => <option key={m}>{m}</option>)}
          </select>
        </FormField>
      </form>
    </Modal>
  )
}

export function TaskModal({ open, task, onClose }: { open: boolean; task: Task | null; onClose: () => void }) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<TaskSchema>({ resolver: zodResolver(taskSchema) })
  useEffect(() => {
    if (open) reset({ title: task?.title ?? '', type: task?.type ?? 'todo', priority: task?.priority ?? 'medium', dueAt: toLocalInput(task?.dueAt ?? null), assigneeName: task?.assigneeName ?? TEAM_MEMBERS[0], notes: task?.notes ?? '' })
  }, [open, task, reset])
  const save = useAction(
    'tasks',
    (v: TaskSchema) => {
      const body = { ...v, dueAt: v.dueAt ? new Date(v.dueAt).toISOString() : null }
      return task ? tasksApi.update(task.id, body) : tasksApi.create({ ...body, done: false, related: null })
    },
    { success: task ? 'Task updated' : 'Task created', onSuccess: onClose },
  )
  return (
    <Modal open={open} onClose={onClose} title={task ? 'Edit task' : 'New task'} footer={<Footer formId="task-form" busy={save.isPending} onClose={onClose} />}>
      <form id="task-form" className="row g-4" noValidate onSubmit={handleSubmit((v) => save.mutate(v))}>
        <FormField id="task-title" label="Task" error={errors.title?.message} className="col-12">
          <input id="task-title" autoFocus className={`form-control${invalid(errors.title)}`} {...register('title')} />
        </FormField>
        <FormField id="task-type" label="Type" className="col-md-6">
          <select id="task-type" className="form-select" {...register('type')}>
            <option value="todo">To-do</option>
            <option value="call">Call</option>
            <option value="email">Email</option>
            <option value="meeting">Meeting</option>
          </select>
        </FormField>
        <FormField id="task-priority" label="Priority" className="col-md-6">
          <select id="task-priority" className="form-select" {...register('priority')}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </FormField>
        <FormField id="task-due" label="Due" className="col-md-6">
          <input id="task-due" type="datetime-local" className="form-control" {...register('dueAt')} />
        </FormField>
        <FormField id="task-assignee" label="Assignee" className="col-md-6">
          <select id="task-assignee" className="form-select" {...register('assigneeName')}>
            {TEAM_MEMBERS.map((m) => <option key={m}>{m}</option>)}
          </select>
        </FormField>
        <FormField id="task-notes" label="Notes" className="col-12">
          <textarea id="task-notes" rows={3} className="form-control" {...register('notes')} />
        </FormField>
      </form>
    </Modal>
  )
}
