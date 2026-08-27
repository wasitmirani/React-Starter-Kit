export interface Contact {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  company?: string
  tags: string[]
  status: 'active' | 'unsubscribed' | 'bounced'
  lastContactedAt?: string
  createdAt: string
  customFields?: Record<string, string>
}

export type CreateContactPayload = Omit<Contact, 'id' | 'createdAt'>
export type UpdateContactPayload = Partial<CreateContactPayload>
