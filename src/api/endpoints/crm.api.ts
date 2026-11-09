import { AppError } from '@/api/errors'
import { latency, paginate } from '@/api/mock/collection'
import { db } from '@/api/mock/db'
import { matchesSegment } from '@/api/mock/segment-engine'
import { call, createResourceApi, http, toParams } from '@/api/resource'
import type { ListQuery, Page } from '@/types/common.types'
import type { Activity, Contact, ImportJob, SegmentRuleGroup } from '@/types/crm.types'

/** Contacts list query: `listId`, `segmentId` and `tag` narrow the audience before paging. */
function queryContacts(q: ListQuery = {}): Contact[] {
  const { listId, segmentId, tag, consent, ...filters } = q.filters ?? {}
  let rows = db.contacts.query({ ...q, filters })
  if (listId) rows = rows.filter((c) => c.listIds.includes(listId))
  if (tag) rows = rows.filter((c) => c.tags.includes(tag))
  if (consent) rows = rows.filter((c) => c.consents.email === consent)
  if (segmentId) {
    const segment = db.segments.find(segmentId)
    rows = rows.filter((c) => matchesSegment(c, segment.rules))
  }
  return rows
}

export interface BulkContactUpdate {
  ids: string[]
  addTags?: string[]
  removeTags?: string[]
  addListIds?: string[]
  removeListIds?: string[]
  blocklisted?: boolean
}

export interface ImportRequest {
  fileName: string
  /** Parsed CSV rows keyed by the CSV header. */
  rows: Record<string, string>[]
  /** CSV header → contact field (`email`, `firstName`, `attributes.plan`…). Unmapped headers are skipped. */
  mapping: Record<string, string>
  listId: string | null
  /** Update existing contacts matched by email or phone instead of skipping them. */
  updateExisting: boolean
}

const contactsResource = createResourceApi('/contacts', db.contacts)

export const contactsApi = {
  ...contactsResource,
  list: (q?: ListQuery) =>
    call<Page<Contact>>(
      async () => {
        await latency()
        return paginate(queryContacts(q), q?.page, q?.perPage)
      },
      () => http.get('/contacts', toParams(q)),
    ),

  create: (input: Parameters<typeof contactsResource.create>[0]) =>
    call(
      async () => {
        const email = input.email?.toLowerCase()
        if (email && db.contacts.rows().some((c) => c.email?.toLowerCase() === email)) {
          throw new AppError(409, 'CONTACT_EXISTS', 'A contact with this email already exists.', { email: ['Already in use'] })
        }
        return db.contacts.create(input)
      },
      () => http.post<Contact>('/contacts', input),
    ),

  bulkUpdate: (body: BulkContactUpdate) =>
    call(
      async () => {
        await latency()
        const ids = new Set(body.ids)
        const unique = (items: string[]) => [...new Set(items)]
        db.contacts.replaceAll(
          db.contacts.rows().map((c) =>
            !ids.has(c.id)
              ? c
              : {
                  ...c,
                  tags: unique([...c.tags, ...(body.addTags ?? [])]).filter((t) => !body.removeTags?.includes(t)),
                  listIds: unique([...c.listIds, ...(body.addListIds ?? [])]).filter((l) => !body.removeListIds?.includes(l)),
                  blocklisted: body.blocklisted ?? c.blocklisted,
                  updatedAt: new Date().toISOString(),
                },
          ),
        )
        return { updated: ids.size }
      },
      () => http.post<{ updated: number }>('/contacts/bulk-update', body),
    ),

  bulkDelete: (ids: string[]) =>
    call(
      async () => {
        await latency()
        const remove = new Set(ids)
        db.contacts.replaceAll(db.contacts.rows().filter((c) => !remove.has(c.id)))
        return { deleted: remove.size }
      },
      () => http.post<{ deleted: number }>('/contacts/bulk-delete', { ids }),
    ),

  /** Returns every matching contact; the UI turns it into a CSV download. Real API runs this as an async export job. */
  export: (q?: ListQuery) =>
    call<Contact[]>(
      async () => {
        await latency(300, 600)
        return queryContacts(q)
      },
      () => http.post('/contacts/exports', toParams(q)),
    ),

  import: (body: ImportRequest) =>
    call<ImportJob>(
      async () => {
        await latency(600, 1200)
        const existing = db.contacts.rows()
        const byEmail = new Map(existing.filter((c) => c.email).map((c) => [c.email!.toLowerCase(), c]))
        let created = 0
        let updated = 0
        let skipped = 0
        const next = [...existing]
        const at = new Date().toISOString()
        for (const raw of body.rows) {
          const mapped: Record<string, string> = {}
          for (const [header, field] of Object.entries(body.mapping)) if (field) mapped[field] = raw[header]?.trim() ?? ''
          const email = mapped.email?.toLowerCase() || null
          if (!email && !mapped.phone) {
            skipped++
            continue
          }
          const attributes = Object.fromEntries(
            Object.entries(mapped).filter(([k]) => k.startsWith('attributes.')).map(([k, v]) => [k.slice(11), v]),
          )
          const match = email ? byEmail.get(email) : undefined
          if (match) {
            if (!body.updateExisting) {
              skipped++
              continue
            }
            const merged: Contact = {
              ...match,
              firstName: mapped.firstName || match.firstName,
              lastName: mapped.lastName || match.lastName,
              phone: mapped.phone || match.phone,
              listIds: body.listId ? [...new Set([...match.listIds, body.listId])] : match.listIds,
              attributes: { ...match.attributes, ...attributes },
              updatedAt: at,
            }
            next[next.indexOf(match)] = merged
            updated++
            continue
          }
          const contact: Contact = {
            id: crypto.randomUUID(),
            firstName: mapped.firstName ?? '',
            lastName: mapped.lastName ?? '',
            email,
            phone: mapped.phone || null,
            companyId: null,
            companyName: mapped.companyName || null,
            jobTitle: mapped.jobTitle || null,
            country: mapped.country || null,
            city: mapped.city || null,
            lifecycleStage: 'subscriber',
            source: 'import',
            ownerName: null,
            score: 0,
            tags: [],
            listIds: body.listId ? [body.listId] : [],
            consents: { email: email ? 'subscribed' : 'none' },
            blocklisted: false,
            attributes,
            lastActivityAt: null,
            createdAt: at,
            updatedAt: at,
          }
          next.unshift(contact)
          if (email) byEmail.set(email, contact)
          created++
        }
        db.contacts.replaceAll(next)
        return db.imports.create({
          fileName: body.fileName,
          status: 'completed',
          totalRows: body.rows.length,
          created,
          updated,
          skipped,
          listId: body.listId,
        })
      },
      () => http.post<ImportJob>('/contacts/imports', body),
    ),

  activities: (contactId: string) =>
    call<Activity[]>(
      async () => {
        await latency()
        return db.activities.query({ sort: 'at', order: 'desc' }).filter((a) => a.contactId === contactId)
      },
      () => http.get(`/contacts/${contactId}/activities`),
    ),

  addNote: (contactId: string, text: string) =>
    call<Activity>(
      () => db.activities.create({ contactId, type: 'note', channel: null, title: `Note: ${text}`, description: '', at: new Date().toISOString() }),
      () => http.post(`/contacts/${contactId}/notes`, { text }),
    ),
}

export const importsApi = createResourceApi('/contacts/imports', db.imports)

export const listsApi = createResourceApi('/lists', db.lists, {
  decorate: (list) => ({ ...list, contactCount: db.contacts.rows().filter((c) => c.listIds.includes(list.id)).length }),
})

export const segmentsApi = {
  ...createResourceApi('/segments', db.segments, {
    decorate: (segment) => ({
      ...segment,
      contactCount: db.contacts.rows().filter((c) => matchesSegment(c, segment.rules)).length,
    }),
  }),
  /** Count and first matching contacts for unsaved rules. */
  preview: (rules: SegmentRuleGroup) =>
    call<{ count: number; sample: Contact[] }>(
      async () => {
        await latency(200, 450)
        const matches = db.contacts.rows().filter((c) => matchesSegment(c, rules))
        return { count: matches.length, sample: matches.slice(0, 5) }
      },
      () => http.post('/segments/preview', { rules }),
    ),
}

export const attributesApi = createResourceApi('/contact-attributes', db.attributes)

export const companiesApi = createResourceApi('/companies', db.companies, {
  decorate: (company) => ({
    ...company,
    contactCount: db.contacts.rows().filter((c) => c.companyId === company.id).length,
    openDealsValue: db.deals
      .rows()
      .filter((d) => d.companyId === company.id && d.status === 'open')
      .reduce((sum, d) => sum + d.value, 0),
  }),
})

export const pipelinesApi = createResourceApi('/pipelines', db.pipelines)
export const dealsApi = createResourceApi('/deals', db.deals)
export const tasksApi = createResourceApi('/tasks', db.tasks)
