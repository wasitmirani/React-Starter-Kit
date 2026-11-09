import type { ReactNode } from 'react'
import { DEFAULT_DESIGN, SOCIAL_NETWORKS } from '@/constants/email-builder.constants'
import { blockRowStyle } from '@/utils/helpers/email-html'
import type { EmailBlock, EmailDesign } from '@/types/messaging.types'
import { fillSample } from '@/utils/helpers/template'
import { HtmlFrame } from './HtmlFrame'

/** WhatsApp / SMS / push phone mock-up. */
export function PhonePreview({ channel, sender, body }: { channel: 'sms' | 'whatsapp' | 'push' | 'rcs'; sender: string; body: string }) {
  return (
    <div className={`phone-preview${channel === 'whatsapp' ? '' : ' sms'}`} aria-label="Message preview">
      <div className="phone-bar">
        {channel === 'whatsapp' && <i className="ri-whatsapp-line" />}
        <span className="fw-medium">{sender || 'Sender'}</span>
      </div>
      <div className="phone-body">
        {body.trim() ? <div className="phone-bubble">{fillSample(body)}</div> : <p className="text-muted fs-sm text-center mt-5">Your message preview appears here.</p>}
      </div>
    </div>
  )
}

const HEADING_PX = { 1: 26, 2: 21, 3: 17 } as const

/** One block's content as the recipient sees it. */
export function EmailBlockContent({ block: b, design = DEFAULT_DESIGN, examples }: { block: EmailBlock; design?: EmailDesign; examples?: Record<string, string> }) {
  const fill = (s: string) => fillSample(s, examples)
  switch (b.type) {
    case 'heading':
      return <h2 style={{ fontSize: HEADING_PX[b.level ?? 1], margin: 0, fontWeight: 700, lineHeight: 1.25, color: b.color ?? design.text, fontFamily: 'inherit' }}>{fill(b.content)}</h2>
    case 'text':
      return <p style={{ margin: 0, lineHeight: 1.6, whiteSpace: 'pre-wrap', fontSize: b.size ?? 15, color: b.color ?? design.text }}>{fill(b.content)}</p>
    case 'button':
      return (
        <span className="email-btn" style={{ background: b.color ?? design.accent, color: b.textColor ?? '#fff', borderRadius: Math.min(design.radius, 24), display: b.fullWidth ? 'block' : 'inline-block' }}>
          {fill(b.content) || 'Button'}
        </span>
      )
    case 'image':
      return b.content ? <img src={b.content} alt={b.alt ?? ''} style={{ width: `${b.width ?? 100}%`, maxWidth: '100%', height: 'auto', borderRadius: b.padding === 'none' ? 0 : Math.min(design.radius, 12), display: 'inline-block' }} /> : <div className="email-img-empty"><i className="ri-image-add-line" /> Add an image URL</div>
    case 'divider':
      return <hr style={{ border: 0, borderTop: '1px solid #e5e7eb', margin: '4px 0', opacity: 1 }} />
    case 'spacer':
      return <div style={{ height: b.height ?? 24 }} />
    case 'social': {
      const links = SOCIAL_NETWORKS.filter((n) => b.links?.[n.key])
      return (
        <div style={{ display: 'flex', gap: 12, justifyContent: b.align === 'left' ? 'flex-start' : b.align === 'right' ? 'flex-end' : 'center', fontSize: 20, color: b.color ?? '#6b7280' }}>
          {(links.length ? links : SOCIAL_NETWORKS.slice(0, 3)).map((n) => <i key={n.key} className={n.icon} title={n.label} />)}
        </div>
      )
    }
    case 'footer':
      return <p style={{ margin: 0, fontSize: 12, lineHeight: 1.5, color: b.color ?? '#6b7280', whiteSpace: 'pre-wrap' }}>{fill(b.content)}</p>
    case 'html':
      return b.content.trim() ? <HtmlFrame html={fill(b.content)} title="Custom HTML block" /> : <div className="email-img-empty"><i className="ri-code-s-slash-line" /> Write some HTML</div>
  }
}

/** Renders email blocks as the recipient sees them. `onSelect` adds selection hooks. */
export function EmailBlocks({ blocks, selectedId, onSelect, toolbar, design, examples }: { blocks: EmailBlock[]; selectedId?: string | null; onSelect?: (id: string) => void; toolbar?: (block: EmailBlock) => ReactNode; design?: EmailDesign; examples?: Record<string, string> }) {
  return (
    <>
      {blocks.map((b) => (
        <div key={b.id} className={onSelect ? `email-block${selectedId === b.id ? ' selected' : ''}` : ''} style={blockRowStyle(b)} onClick={onSelect ? () => onSelect(b.id) : undefined}>
          {toolbar && <div className="email-block-tools">{toolbar(b)}</div>}
          <EmailBlockContent block={b} design={design} examples={examples} />
        </div>
      ))}
    </>
  )
}
