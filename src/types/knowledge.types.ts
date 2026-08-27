export type DocumentStatus =
  | 'uploading'
  | 'processing'
  | 'indexing'
  | 'ready'
  | 'failed'

export type KnowledgeDocumentType =
  | 'pdf'
  | 'docx'
  | 'txt'
  | 'csv'
  | 'url'
  | 'text'

export interface KnowledgeDocument {
  id: string
  knowledgeBaseId: string
  name: string
  type: KnowledgeDocumentType
  status: DocumentStatus
  sizeKb: number
  progress: number
  sourceUrl?: string
  createdAt: string
}

export interface KnowledgeBase {
  id: string
  name: string
  description: string
  documentCount: number
  status: 'ready' | 'processing' | 'empty'
  agentIds: string[]
  createdAt: string
  updatedAt: string
}

export interface KnowledgeFaq {
  id: string
  question: string
  answer: string
  knowledgeBaseId: string
}

export interface KnowledgeWebsite {
  id: string
  url: string
  status: DocumentStatus
  pagesIndexed: number
  knowledgeBaseId: string
}
