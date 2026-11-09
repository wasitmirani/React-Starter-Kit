import type { Contact } from '@/types/crm.types'

export const fullName = (c: Pick<Contact, 'firstName' | 'lastName'>) => `${c.firstName} ${c.lastName}`.trim() || 'Unnamed contact'
