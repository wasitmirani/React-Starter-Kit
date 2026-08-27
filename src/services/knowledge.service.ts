import { shouldMockModule } from '@/config/env.config'
import { knowledgeApi } from '@/api/endpoints/knowledge.api'
import type { ApiResponse } from '@/types/api.types'
import type {
  KnowledgeBase,
  KnowledgeDocument,
  KnowledgeFaq,
  KnowledgeWebsite,
} from '@/types/knowledge.types'
import { delay, ok, fail } from '@/lib/mock'
import {
  mockKnowledgeBases,
  mockKnowledgeDocuments,
  mockKnowledgeFaqs,
  mockKnowledgeWebsites,
} from '@/services/mock/mock-data'

let bases = [...mockKnowledgeBases]
let documents = [...mockKnowledgeDocuments]

export const knowledgeService = {
  async list(): Promise<ApiResponse<KnowledgeBase[]>> {
    if (shouldMockModule('knowledge')) {
      await delay()
      return ok(bases)
    }
    const res = await knowledgeApi.list()
    return res.data
  },

  async get(id: string): Promise<ApiResponse<KnowledgeBase>> {
    if (shouldMockModule('knowledge')) {
      await delay()
      const kb = bases.find((b) => b.id === id)
      if (!kb) return fail('Knowledge base not found')
      return ok(kb)
    }
    const res = await knowledgeApi.get(id)
    return res.data
  },

  async documents(knowledgeBaseId?: string): Promise<ApiResponse<KnowledgeDocument[]>> {
    if (shouldMockModule('knowledge')) {
      await delay()
      const items = knowledgeBaseId
        ? documents.filter((d) => d.knowledgeBaseId === knowledgeBaseId)
        : documents
      return ok(items)
    }
    if (!knowledgeBaseId) {
      return ok([])
    }
    const res = await knowledgeApi.documents(knowledgeBaseId)
    return res.data
  },

  async faqs(knowledgeBaseId?: string): Promise<ApiResponse<KnowledgeFaq[]>> {
    if (shouldMockModule('knowledge')) {
      await delay()
      const items = knowledgeBaseId
        ? mockKnowledgeFaqs.filter((f) => f.knowledgeBaseId === knowledgeBaseId)
        : mockKnowledgeFaqs
      return ok(items)
    }
    const res = await knowledgeApi.faqs(knowledgeBaseId)
    return res.data
  },

  async websites(knowledgeBaseId?: string): Promise<ApiResponse<KnowledgeWebsite[]>> {
    if (shouldMockModule('knowledge')) {
      await delay()
      const items = knowledgeBaseId
        ? mockKnowledgeWebsites.filter((w) => w.knowledgeBaseId === knowledgeBaseId)
        : mockKnowledgeWebsites
      return ok(items)
    }
    const res = await knowledgeApi.websites(knowledgeBaseId)
    return res.data
  },

  async uploadDocument(
    knowledgeBaseId: string,
    name: string,
    file?: File,
  ): Promise<ApiResponse<KnowledgeDocument>> {
    if (shouldMockModule('knowledge')) {
      await delay(500)
      const doc: KnowledgeDocument = {
        id: `doc_${Date.now()}`,
        knowledgeBaseId,
        name,
        type: 'pdf',
        status: 'processing',
        sizeKb: 120,
        progress: 15,
        createdAt: new Date().toISOString(),
      }
      documents = [doc, ...documents]
      bases = bases.map((b) =>
        b.id === knowledgeBaseId
          ? {
              ...b,
              documentCount: b.documentCount + 1,
              status: 'processing',
              updatedAt: new Date().toISOString(),
            }
          : b,
      )
      return ok(doc, 'Upload started')
    }
    const form = new FormData()
    form.append('name', name)
    if (file) form.append('file', file)
    const res = await knowledgeApi.upload(knowledgeBaseId, form)
    return res.data
  },
}
