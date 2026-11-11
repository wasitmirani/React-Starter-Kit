import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toApiError } from '@/api/errors'
import { FormAlert } from '@/components/common/FormAlert'
import { FormField } from '@/components/common/FormField'
import { TagInput } from '@/components/common/Misc'
import { Modal } from '@/components/common/Modal'
import { Switch } from '@/components/ui/Controls'
import type { Option } from '@/types/common.types'

export type FieldType = 'text' | 'email' | 'tel' | 'url' | 'number' | 'date' | 'time' | 'textarea' | 'select' | 'switch' | 'tags'

export interface FieldDef {
  name: string
  label: string
  type?: FieldType
  required?: boolean
  options?: Option[]
  hint?: ReactNode
  placeholder?: string
  min?: number
  max?: number
  /** Bootstrap grid width (12 = full row). */
  col?: 3 | 4 | 6 | 8 | 12
}

export type FormValues = Record<string, unknown>

/** Zod schema derived from the field list, so validation and markup never drift. */
function schemaOf(fields: FieldDef[]) {
  const shape: Record<string, z.ZodType> = {}
  for (const f of fields) {
    const type = f.type ?? 'text'
    if (type === 'number') {
      let n = z.coerce.number({ message: 'Enter a number' })
      if (f.min !== undefined) n = n.min(f.min, `Must be at least ${f.min}`)
      if (f.max !== undefined) n = n.max(f.max, `Must be at most ${f.max}`)
      shape[f.name] = n
    } else if (type === 'switch') shape[f.name] = z.boolean()
    else if (type === 'tags') shape[f.name] = f.required ? z.array(z.string()).min(1, 'Add at least one') : z.array(z.string())
    else {
      let s = z.string().trim()
      if (type === 'email') s = s.refine((v) => !v || z.email().safeParse(v).success, 'Enter a valid email') as unknown as z.ZodString
      if (type === 'url') s = s.refine((v) => !v || /^https:\/\//.test(v), 'Use an https:// URL') as unknown as z.ZodString
      shape[f.name] = f.required ? s.min(1, `${f.label} is required`) : s
    }
  }
  return z.object(shape)
}

function defaultsOf(fields: FieldDef[], initial: FormValues = {}): FormValues {
  return Object.fromEntries(
    fields.map((f) => {
      const v = initial[f.name]
      const type = f.type ?? 'text'
      if (type === 'switch') return [f.name, Boolean(v)]
      if (type === 'tags') return [f.name, Array.isArray(v) ? v : []]
      if (type === 'date' && typeof v === 'string') return [f.name, v.slice(0, 10)]
      return [f.name, v ?? (type === 'select' && f.required ? f.options?.[0]?.value ?? '' : '')]
    }),
  )
}

interface EntityFormModalProps {
  open: boolean
  title: string
  fields: FieldDef[]
  initial?: FormValues
  submitLabel: string
  onClose: () => void
  /** Rejects with an API error to show field or form errors; resolves to close. */
  onSubmit: (values: FormValues) => Promise<unknown>
  size?: 'sm' | 'md' | 'lg'
  intro?: ReactNode
}

export function EntityFormModal({ open, title, fields, initial, submitLabel, onClose, onSubmit, size = 'md', intro }: EntityFormModalProps) {
  const formId = useId()
  const schema = useMemo(() => schemaOf(fields), [fields])
  const [formError, setFormError] = useState<string | null>(null)
  const { register, control, handleSubmit, reset, setError, formState: { errors, isSubmitting } } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: defaultsOf(fields, initial) })

  // Reset only when the modal opens: parents pass fresh `initial`/`fields` objects on
  // every render, and a background refetch must not wipe what the user is typing.
  const latest = useRef({ fields, initial })
  latest.current = { fields, initial }
  useEffect(() => {
    if (!open) return
    reset(defaultsOf(latest.current.fields, latest.current.initial))
    setFormError(null)
  }, [open, reset])

  const submit = handleSubmit(async (values) => {
    setFormError(null)
    try {
      await onSubmit(values)
      onClose()
    } catch (e) {
      const err = toApiError(e)
      const known = Object.entries(err.fieldErrors).filter(([k]) => fields.some((f) => f.name === k))
      known.forEach(([k, msgs]) => setError(k, { message: msgs[0] }))
      if (!known.length) setFormError(err.message)
    }
  })

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size={size}
      footer={
        <>
          <button type="button" className="btn btn-light" onClick={onClose} disabled={isSubmitting}>Cancel</button>
          <button type="submit" form={formId} className="btn btn-primary" disabled={isSubmitting}>{isSubmitting ? 'Saving…' : submitLabel}</button>
        </>
      }
    >
      {intro && <div className="text-muted mb-4">{intro}</div>}
      <FormAlert message={formError} onClose={() => setFormError(null)} />
      <form id={formId} onSubmit={submit} noValidate className="row g-4">
        {fields.map((f) => {
          const id = `${formId}-${f.name}`
          const error = errors[f.name]?.message as string | undefined
          const type = f.type ?? 'text'
          const cls = `col-md-${f.col ?? 12}`
          if (type === 'switch') {
            return (
              <div key={f.name} className={cls}>
                <Controller control={control} name={f.name} render={({ field }) => <Switch id={id} checked={Boolean(field.value)} onChange={field.onChange} label={f.label} description={f.hint} />} />
              </div>
            )
          }
          return (
            <FormField key={f.name} id={id} label={f.label} required={f.required} hint={f.hint} error={error} className={cls}>
              {type === 'select' ? (
                <select id={id} className="form-select" {...register(f.name)}>
                  {!f.required && <option value="">—</option>}
                  {f.options?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              ) : type === 'textarea' ? (
                <textarea id={id} rows={3} className="form-control" placeholder={f.placeholder} {...register(f.name)} />
              ) : type === 'tags' ? (
                <Controller control={control} name={f.name} render={({ field }) => <TagInput id={id} value={field.value as string[]} onChange={field.onChange} placeholder={f.placeholder} />} />
              ) : (
                <input id={id} type={type} min={f.min} max={f.max} step={type === 'number' ? 'any' : undefined} className="form-control" placeholder={f.placeholder} {...register(f.name)} />
              )}
            </FormField>
          )
        })}
      </form>
    </Modal>
  )
}
