import { z } from 'zod'

const optionalText = z.string().trim().max(200).optional().or(z.literal(''))
/** E.164: + and 8–15 digits. Spaces and dashes are stripped before checking. */
const phone = z
  .string()
  .trim()
  .transform((v) => v.replace(/[\s-()]/g, ''))
  .refine((v) => v === '' || /^\+[1-9]\d{7,14}$/.test(v), 'Use international format, e.g. +14155550123')

export const contactSchema = z
  .object({
    firstName: z.string().trim().min(1, 'First name is required').max(100),
    lastName: z.string().trim().max(100),
    email: z.string().trim().toLowerCase().email('Enter a valid email').or(z.literal('')),
    phone,
    companyName: optionalText,
    jobTitle: optionalText,
    country: optionalText,
    city: optionalText,
    lifecycleStage: z.enum(['subscriber', 'lead', 'qualified', 'customer', 'churned']),
    emailConsent: z.enum(['subscribed', 'unsubscribed', 'pending', 'none']),
    smsConsent: z.enum(['subscribed', 'unsubscribed', 'pending', 'none']),
    whatsappConsent: z.enum(['subscribed', 'unsubscribed', 'pending', 'none']),
    tags: z.array(z.string()),
  })
  .refine((v) => v.email || v.phone, { message: 'Add an email or a phone number', path: ['email'] })

export type ContactSchema = z.input<typeof contactSchema>
export type ContactValues = z.output<typeof contactSchema>

export const listSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(120),
  description: z.string().trim().max(500),
  folder: z.string().trim().max(60),
})
export type ListSchema = z.infer<typeof listSchema>

export const attributeSchema = z.object({
  label: z.string().trim().min(1, 'Label is required').max(80),
  key: z
    .string()
    .trim()
    .regex(/^[a-z][a-z0-9_]{1,40}$/, 'Lowercase letters, digits and _ ; start with a letter'),
  type: z.enum(['text', 'number', 'date', 'boolean', 'select']),
  options: z.string(),
})
export type AttributeSchema = z.infer<typeof attributeSchema>

export const companySchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(160),
  domain: z.string().trim().max(160),
  industry: z.string().trim().max(80),
  size: z.string(),
  country: z.string().trim().max(80),
  ownerName: z.string(),
})
export type CompanySchema = z.infer<typeof companySchema>

export const dealSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(160),
  value: z.coerce.number().min(0, 'Must be 0 or more'),
  stageId: z.string().min(1, 'Choose a stage'),
  companyId: z.string(),
  contactId: z.string(),
  ownerName: z.string().min(1, 'Choose an owner'),
  expectedCloseDate: z.string(),
})
export type DealSchema = z.input<typeof dealSchema>

export const taskSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(200),
  type: z.enum(['todo', 'call', 'email', 'meeting']),
  priority: z.enum(['low', 'medium', 'high']),
  dueAt: z.string(),
  assigneeName: z.string().min(1, 'Choose an assignee'),
  notes: z.string().max(2000),
})
export type TaskSchema = z.infer<typeof taskSchema>
