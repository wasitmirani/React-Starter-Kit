import { shouldMockModule } from '@/config/env.config'
import { contactsApi } from '@/api/endpoints/contacts.api'
import type { ApiResponse, PaginationParams } from '@/types/api.types'
import type {
  Contact,
  CreateContactPayload,
  UpdateContactPayload,
} from '@/types/contact.types'
import { delay, ok, okPage, paginate, fail } from '@/lib/mock'
import { mockContacts } from '@/services/mock/mock-data'

let contacts = [...mockContacts]

export const contactsService = {
  async list(params?: PaginationParams): Promise<ApiResponse<Contact[]>> {
    if (shouldMockModule('contacts')) {
      await delay()
      let items = [...contacts]
      if (params?.search) {
        const q = params.search.toLowerCase()
        items = items.filter(
          (c) =>
            `${c.firstName} ${c.lastName}`.toLowerCase().includes(q) ||
            c.email.toLowerCase().includes(q) ||
            c.phone.includes(q),
        )
      }
      const { data, meta } = paginate(items, params)
      return okPage(data, meta)
    }
    const res = await contactsApi.list(params)
    return res.data
  },

  async get(id: string): Promise<ApiResponse<Contact>> {
    if (shouldMockModule('contacts')) {
      await delay()
      const contact = contacts.find((c) => c.id === id)
      if (!contact) return fail('Contact not found')
      return ok(contact)
    }
    const res = await contactsApi.get(id)
    return res.data
  },

  async create(payload: CreateContactPayload): Promise<ApiResponse<Contact>> {
    if (shouldMockModule('contacts')) {
      await delay()
      const contact: Contact = {
        ...payload,
        id: `ct_${Date.now()}`,
        createdAt: new Date().toISOString(),
      }
      contacts = [contact, ...contacts]
      return ok(contact, 'Contact created')
    }
    const res = await contactsApi.create(payload)
    return res.data
  },

  async update(
    id: string,
    payload: UpdateContactPayload,
  ): Promise<ApiResponse<Contact>> {
    if (shouldMockModule('contacts')) {
      await delay()
      const idx = contacts.findIndex((c) => c.id === id)
      if (idx < 0) return fail('Contact not found')
      contacts[idx] = { ...contacts[idx], ...payload }
      return ok(contacts[idx], 'Contact updated')
    }
    const res = await contactsApi.update(id, payload)
    return res.data
  },

  async remove(id: string): Promise<ApiResponse<null>> {
    if (shouldMockModule('contacts')) {
      await delay()
      contacts = contacts.filter((c) => c.id !== id)
      return ok(null, 'Contact deleted')
    }
    const res = await contactsApi.remove(id)
    return res.data
  },

  async importCsv(_file?: File): Promise<ApiResponse<{ imported: number }>> {
    if (shouldMockModule('contacts')) {
      await delay(600)
      return ok({ imported: 12 }, 'Imported 12 contacts')
    }
    const form = new FormData()
    if (_file) form.append('file', _file)
    const res = await contactsApi.importCsv(form)
    return res.data
  },
}
