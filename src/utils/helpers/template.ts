import type { BrandKit, EmailBlock, Template } from '@/types/messaging.types'

/** The blocks a recipient gets: brand header + template content + brand footer (blocks mode). */
export function composeEmail(t: Pick<Template, 'blocks'> & Partial<Pick<Template, 'brandHeader' | 'brandFooter'>>, kit: BrandKit | null | undefined): EmailBlock[] {
  if (!kit) return t.blocks
  return [...(t.brandHeader ? kit.header.map((b) => ({ ...b, id: `brand-${b.id}` })) : []), ...t.blocks, ...(t.brandFooter ? kit.footer.map((b) => ({ ...b, id: `brand-${b.id}` })) : [])]
}

/** Readable text of an HTML email, for the plain-text part and checks. */
export const htmlToText = (html: string) =>
  html
    .replace(/<(style|script|head)[\s\S]*?<\/\1>/gi, '')
    .replace(/<br\s*\/?>|<\/(p|div|tr|h\d|li)>/gi, '\n')
    .replace(/<a [^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi, '$2 ($1)')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\n\s*\n+/g, '\n\n')
    .trim()

const DEFAULT_SAMPLES: Record<string, string> = { first_name: 'Olivia', last_name: 'Smith', order_id: '10482', code: '482913', tracking_url: 'nwd.io/t/8f2k', reset_link: 'nwd.io/r/k29x', email: 'olivia@example.com', company: 'Acme Inc.', city: 'Austin', unsubscribe_url: 'Unsubscribe', '1': 'Olivia', '2': '#10482', '3': 'nwd.io/t/8f2k' }

/** Replaces `{{first_name}}` style placeholders with sample values for previews. Template examples win over defaults. */
export function fillSample(text: string, examples: Record<string, string> = {}): string {
  return text.replace(/{{\s*([\w.]+)\s*}}/g, (_, key: string) => examples[key] || DEFAULT_SAMPLES[key] || `[${key}]`)
}

/** Inserts text at the caret of an input or textarea and returns the new value. */
export function insertAtCaret(el: HTMLInputElement | HTMLTextAreaElement | null, value: string, token: string): { next: string; caret: number } {
  const start = el?.selectionStart ?? value.length
  const end = el?.selectionEnd ?? value.length
  return { next: value.slice(0, start) + token + value.slice(end), caret: start + token.length }
}

/** Plain-text part of an email, generated from its blocks. */
export const emailText = (blocks: EmailBlock[]) =>
  blocks.filter((b) => ['heading', 'text', 'button', 'footer'].includes(b.type)).map((b) => (b.type === 'button' ? `${b.content}: ${b.href ?? ''}` : b.content)).join('\n\n')

/** Numbered WhatsApp variables in a text, sorted: "Hi {{1}}, {{2}}" → [1, 2]. */
export const numberedVars = (text: string) => [...new Set([...text.matchAll(/{{\s*(\d+)\s*}}/g)].map((m) => Number(m[1])))].sort((a, b) => a - b)
