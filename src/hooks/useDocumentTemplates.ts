import { useMemo } from 'react'
import { DEFAULT_TEMPLATES, TEMPLATE_STORAGE_KEY, type DocumentTemplates } from '@/constants/documents.constants'
import { useAuth } from '@/hooks/useAuth'
import { useLocalStorage } from '@/hooks/useLocalStorage'

/**
 * Airway bill and invoice templates for the current workspace. Stored in this browser
 * until the documents API exists; missing fields fall back to the defaults.
 */
export function useDocumentTemplates() {
  const { currentMembership } = useAuth()
  const tenantId = currentMembership?.tenant.id ?? 'anonymous'
  const company = currentMembership?.tenant.name ?? 'Your company'
  const [stored, setStored] = useLocalStorage<Partial<DocumentTemplates>>(`${TEMPLATE_STORAGE_KEY}.${tenantId}`, {})

  const templates: DocumentTemplates = useMemo(() => ({
    awb: { ...DEFAULT_TEMPLATES.awb, ...stored.awb },
    invoice: { ...DEFAULT_TEMPLATES.invoice, companyName: company, ...stored.invoice },
    sender: { ...DEFAULT_TEMPLATES.sender, name: company, ...stored.sender },
  }), [stored, company])

  return { templates, save: (next: DocumentTemplates) => setStored(next), reset: () => setStored({}) }
}
