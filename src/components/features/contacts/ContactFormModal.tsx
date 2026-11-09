import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { contactsApi } from '@/api/endpoints/crm.api'
import { toApiError } from '@/api/errors'
import { FormField } from '@/components/common/FormField'
import { TagInput } from '@/components/common/Misc'
import { Modal } from '@/components/common/Modal'
import { CONSENT_OPTIONS, LIFECYCLE_STAGES } from '@/constants/crm.constants'
import { useAction } from '@/hooks/queries/resource.queries'
import { contactSchema, type ContactSchema, type ContactValues } from '@/lib/validation/crm.schemas'
import type { Contact } from '@/types/crm.types'

const EMPTY: ContactSchema = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  companyName: '',
  jobTitle: '',
  country: '',
  city: '',
  lifecycleStage: 'subscriber',
  emailConsent: 'subscribed',
  smsConsent: 'none',
  whatsappConsent: 'none',
  tags: [],
}

function toForm(c: Contact): ContactSchema {
  return {
    firstName: c.firstName,
    lastName: c.lastName,
    email: c.email ?? '',
    phone: c.phone ?? '',
    companyName: c.companyName ?? '',
    jobTitle: c.jobTitle ?? '',
    country: c.country ?? '',
    city: c.city ?? '',
    lifecycleStage: c.lifecycleStage,
    emailConsent: c.consents.email ?? 'none',
    smsConsent: c.consents.sms ?? 'none',
    whatsappConsent: c.consents.whatsapp ?? 'none',
    tags: c.tags,
  }
}

function toPayload(v: ContactValues) {
  return {
    firstName: v.firstName,
    lastName: v.lastName,
    email: v.email || null,
    phone: v.phone || null,
    companyName: v.companyName || null,
    jobTitle: v.jobTitle || null,
    country: v.country || null,
    city: v.city || null,
    lifecycleStage: v.lifecycleStage,
    consents: { email: v.emailConsent, sms: v.smsConsent, whatsapp: v.whatsappConsent },
    tags: v.tags,
  }
}

interface ContactFormModalProps {
  open: boolean
  onClose: () => void
  /** Edit this contact; omit to create. */
  contact?: Contact | null
  onSaved?: (contact: Contact) => void
}

export function ContactFormModal({ open, onClose, contact, onSaved }: ContactFormModalProps) {
  const form = useForm<ContactSchema, unknown, ContactValues>({ resolver: zodResolver(contactSchema), defaultValues: EMPTY })
  const { register, handleSubmit, reset, setError, control, formState: { errors, isSubmitting } } = form

  useEffect(() => {
    if (open) reset(contact ? toForm(contact) : EMPTY)
  }, [open, contact, reset])

  const save = useAction(
    'contacts',
    (values: ContactValues) =>
      contact
        ? contactsApi.update(contact.id, toPayload(values))
        : contactsApi.create({
            ...toPayload(values),
            companyId: null,
            source: 'manual',
            ownerName: null,
            score: 0,
            listIds: [],
            blocklisted: false,
            attributes: {},
            lastActivityAt: null,
          }),
    { success: contact ? 'Contact updated' : 'Contact created', onSuccess: (c) => { onSaved?.(c); onClose() } },
  )

  const onSubmit = handleSubmit(async (values) => {
    try {
      await save.mutateAsync(values)
    } catch (err) {
      const e = toApiError(err)
      for (const [field, messages] of Object.entries(e.fieldErrors)) setError(field as keyof ContactSchema, { message: messages[0] })
    }
  })

  const field = (name: keyof ContactSchema, label: string, type = 'text', col = 'col-md-6', placeholder?: string) => (
    <FormField id={`contact-${name}`} label={label} error={errors[name]?.message as string | undefined} className={col}>
      <input id={`contact-${name}`} type={type} placeholder={placeholder} className={`form-control${errors[name] ? ' is-invalid' : ''}`} {...register(name)} />
    </FormField>
  )

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={contact ? 'Edit contact' : 'New contact'}
      size="lg"
      footer={
        <>
          <button type="button" className="btn btn-light" onClick={onClose}>Cancel</button>
          <button type="submit" form="contact-form" className="btn btn-primary" disabled={isSubmitting}>
            {isSubmitting ? 'Saving…' : contact ? 'Save changes' : 'Create contact'}
          </button>
        </>
      }
    >
      <form id="contact-form" onSubmit={onSubmit} noValidate className="row g-4">
        {field('firstName', 'First name')}
        {field('lastName', 'Last name')}
        {field('email', 'Email', 'email')}
        {field('phone', 'Phone', 'tel', 'col-md-6', '+14155550123')}
        {field('companyName', 'Company')}
        {field('jobTitle', 'Job title')}
        {field('country', 'Country')}
        {field('city', 'City')}
        <FormField id="contact-stage" label="Lifecycle stage" className="col-md-6">
          <select id="contact-stage" className="form-select" {...register('lifecycleStage')}>
            {LIFECYCLE_STAGES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </FormField>
        <FormField id="contact-tags" label="Tags" className="col-md-6">
          <Controller control={control} name="tags" render={({ field: f }) => <TagInput id="contact-tags" value={f.value} onChange={f.onChange} />} />
        </FormField>
        <div className="col-12">
          <h6 className="fs-sm text-muted text-uppercase mb-3">Consent</h6>
          <div className="row g-4">
            {(['emailConsent', 'smsConsent', 'whatsappConsent'] as const).map((name) => (
              <FormField key={name} id={`contact-${name}`} label={{ emailConsent: 'Email', smsConsent: 'SMS', whatsappConsent: 'WhatsApp' }[name]} className="col-md-4">
                <select id={`contact-${name}`} className="form-select" {...register(name)}>
                  {CONSENT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </FormField>
            ))}
          </div>
          <p className="form-text mb-0">Only mark a contact as subscribed if you have their documented permission.</p>
        </div>
      </form>
    </Modal>
  )
}
