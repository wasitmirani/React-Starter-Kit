/** Printable document templates (airway bill / shipping label and tax invoice). */

export type LabelSize = '4x6' | 'a6' | '100x100' | 'a4'

export interface AwbTemplate {
  size: LabelSize
  accentColor: string
  showLogo: boolean
  showSender: boolean
  showReturnAddress: boolean
  showCodBox: boolean
  showItems: boolean
  showOrderBarcode: boolean
  showWeight: boolean
  showNotes: boolean
  showArabicLabels: boolean
  notes: string
  footerText: string
}

export interface InvoiceTemplate {
  accentColor: string
  companyName: string
  companyAddress: string
  taxNumber: string
  email: string
  phone: string
  showLogo: boolean
  bilingual: boolean
  showSku: boolean
  showPaymentDetails: boolean
  showSignature: boolean
  terms: string
  footerText: string
}

export interface DocumentTemplates {
  awb: AwbTemplate
  invoice: InvoiceTemplate
  sender: { name: string; phone: string; address: string; city: string; country: string }
}

export const LABEL_SIZES: { value: LabelSize; label: string; widthMm: number; heightMm: number }[] = [
  { value: '4x6', label: '4 × 6 in (thermal)', widthMm: 101.6, heightMm: 152.4 },
  { value: 'a6', label: 'A6 (105 × 148 mm)', widthMm: 105, heightMm: 148 },
  { value: '100x100', label: '100 × 100 mm', widthMm: 100, heightMm: 100 },
  { value: 'a4', label: 'A4 sheet (plain printer)', widthMm: 210, heightMm: 297 },
]

export const DEFAULT_TEMPLATES: DocumentTemplates = {
  awb: {
    size: '4x6', accentColor: '#111827', showLogo: true, showSender: true, showReturnAddress: true, showCodBox: true, showItems: true,
    showOrderBarcode: true, showWeight: true, showNotes: false, showArabicLabels: true, notes: 'Handle with care', footerText: 'Thank you for shopping with us',
  },
  invoice: {
    accentColor: '#4F46E5', companyName: '', companyAddress: 'Logistics District, Dubai South, Dubai, UAE', taxNumber: '100XXXXXXXXX003', email: 'billing@example.com', phone: '+971 4 000 0000',
    showLogo: true, bilingual: true, showSku: true, showPaymentDetails: true, showSignature: false, terms: 'Goods sold are returnable within 14 days in original condition.', footerText: 'This is a computer-generated invoice.',
  },
  sender: { name: '', phone: '+971 4 000 0000', address: 'Dubai South Warehouse, Logistics District', city: 'Dubai', country: 'AE' },
}

export const TEMPLATE_STORAGE_KEY = 'doc-templates.v1'
