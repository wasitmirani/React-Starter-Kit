import { DEFAULT_DESIGN, PADDING_PX, SOCIAL_NETWORKS } from '@/constants/email-builder.constants'
import type { CSSProperties } from 'react'
import type { EmailBlock, EmailDesign } from '@/types/messaging.types'

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
const nl = (s: string) => esc(s).replace(/\n/g, '<br />')
const HEADING = { 1: 26, 2: 21, 3: 17 } as const

function cell(b: EmailBlock, d: EmailDesign): string {
  switch (b.type) {
    case 'heading':
      return `<h${b.level ?? 1} style="margin:0;font-size:${HEADING[b.level ?? 1]}px;line-height:1.25;font-weight:700;color:${b.color ?? d.text}">${nl(b.content)}</h${b.level ?? 1}>`
    case 'text':
      return `<p style="margin:0;font-size:${b.size ?? 15}px;line-height:1.6;color:${b.color ?? d.text}">${nl(b.content)}</p>`
    case 'button':
      return `<a href="${esc(b.href ?? '#')}" style="display:${b.fullWidth ? 'block' : 'inline-block'};padding:12px 24px;background:${b.color ?? d.accent};color:${b.textColor ?? '#ffffff'};border-radius:${Math.min(d.radius, 24)}px;text-decoration:none;font-weight:600">${esc(b.content)}</a>`
    case 'image': {
      const img = `<img src="${esc(b.content)}" alt="${esc(b.alt ?? '')}" width="${Math.round((600 * (b.width ?? 100)) / 100)}" style="max-width:100%;height:auto;border:0;display:inline-block" />`
      return b.href ? `<a href="${esc(b.href)}">${img}</a>` : img
    }
    case 'divider':
      return '<hr style="border:0;border-top:1px solid #e5e7eb;margin:4px 0" />'
    case 'spacer':
      return `<div style="height:${b.height ?? 24}px;line-height:${b.height ?? 24}px">&nbsp;</div>`
    case 'social':
      return SOCIAL_NETWORKS.filter((n) => b.links?.[n.key])
        .map((n) => `<a href="${esc(b.links![n.key]!)}" style="color:${b.color ?? '#6b7280'};text-decoration:none;margin:0 6px">${n.label}</a>`)
        .join(' ')
    case 'footer':
      return `<p style="margin:0;font-size:12px;line-height:1.5;color:${b.color ?? '#6b7280'}">${nl(b.content).replace(/\{\{\s*unsubscribe_url\s*\}\}/g, '<a href="{{unsubscribe_url}}" style="color:inherit">Unsubscribe</a>')}</p>`
    case 'html':
      return b.content
  }
}

/** Table-based, inline-styled HTML that renders the same in Outlook, Gmail and Apple Mail. */
export function blocksToHtml(blocks: EmailBlock[], design: Partial<EmailDesign> = {}, subject = ''): string {
  const d = { ...DEFAULT_DESIGN, ...design }
  const rows = blocks
    .map((b) => `            <tr><td align="${b.align ?? 'left'}" style="padding:${PADDING_PX[b.padding ?? (b.type === 'spacer' || b.type === 'divider' ? 'sm' : 'md')]};${b.bg ? `background:${b.bg};` : ''}text-align:${b.align ?? 'left'}">${cell(b, d)}</td></tr>`)
    .join('\n')
  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${esc(subject)}</title>
  </head>
  <body style="margin:0;background:${d.background};font-family:${d.font}, Arial, sans-serif;color:${d.text}">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center" style="padding:24px">
          <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:${d.paper};border-radius:${d.radius}px">
${rows}
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`
}

/** Inline styles for the email paper, from the design. */
export function paperStyle(design: EmailDesign = DEFAULT_DESIGN): CSSProperties {
  return { background: design.paper, color: design.text, fontFamily: `${design.font}, Arial, sans-serif`, borderRadius: design.radius }
}

/** Padding and background of a block's row. */
export const blockRowStyle = (b: EmailBlock): CSSProperties => ({ textAlign: b.align ?? 'left', padding: PADDING_PX[b.padding ?? (b.type === 'spacer' || b.type === 'divider' ? 'sm' : 'md')], background: b.bg })

