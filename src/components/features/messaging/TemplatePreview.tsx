import { brandKitApi } from '@/api/endpoints/messaging.api'
import { DEFAULT_DESIGN } from '@/constants/email-builder.constants'
import { useTenantQuery } from '@/hooks/queries/resource.queries'
import type { Template } from '@/types/messaging.types'
import { composeEmail, fillSample } from '@/utils/helpers/template'
import { HtmlFrame } from './HtmlFrame'
import { paperStyle } from '@/utils/helpers/email-html'
import { EmailBlocks } from './MessagePreview'

type Previewable = Pick<Template, 'channel' | 'subject' | 'body' | 'blocks' | 'examples' | 'name'> & Partial<Pick<Template, 'previewText' | 'design' | 'whatsapp' | 'push' | 'editor' | 'html' | 'brandHeader' | 'brandFooter'>>

const SENDER = 'Northwind'

/** Renders WhatsApp's *bold* _italic_ ~strike~ markers. */
function waFormat(text: string) {
  const parts = text.split(/(\*[^*\n]+\*|_[^_\n]+_|~[^~\n]+~)/g)
  return parts.map((p, i) =>
    /^\*.+\*$/.test(p) ? <strong key={i}>{p.slice(1, -1)}</strong> : /^_.+_$/.test(p) ? <em key={i}>{p.slice(1, -1)}</em> : /^~.+~$/.test(p) ? <s key={i}>{p.slice(1, -1)}</s> : p,
  )
}

const BUTTON_ICON = { quick_reply: 'ri-reply-line', url: 'ri-external-link-line', phone: 'ri-phone-fill' } as const

/**
 * How the recipient sees a template, per channel: an inbox email, a WhatsApp
 * chat bubble, an SMS thread or a lock-screen push. `thumb` is the card size.
 */
export function TemplatePreview({ template, size = 'thumb', device = 'desktop' }: { template: Previewable; size?: 'thumb' | 'full'; device?: 'desktop' | 'mobile' }) {
  const t = template
  const fill = (s: string | null | undefined) => fillSample(s ?? '', t.examples)
  const empty = <span className="tpl-empty">No content yet</span>
  const kit = useTenantQuery('brand-kit', 'kit', brandKitApi.get, { staleTime: 60_000, enabled: t.channel === 'email' }).data

  if (t.channel === 'email') {
    const design = { ...DEFAULT_DESIGN, ...(t.design ?? kit?.design) }
    const blocks = composeEmail(t, kit)
    const thumb = size === 'thumb' ? { transform: 'scale(0.5)', transformOrigin: 'top left', width: '200%', pointerEvents: 'none' as const } : {}
    return (
      <div className={`tpl-preview tpl-email ${size}`}>
        <div className="tpl-email-head">
          <span className="tpl-avatar" style={{ background: design.accent }}>N</span>
          <div className="min-w-0">
            <strong className="text-truncate d-block">{SENDER}</strong>
            <span className="text-truncate d-block">
              <span className="text-body">{fill(t.subject) || 'No subject'}</span>
              {t.previewText && <> — {fill(t.previewText)}</>}
            </span>
          </div>
        </div>
        <div className="tpl-email-body" style={{ background: design.background }}>
          {t.editor === 'html' ? (
            t.html?.trim() ? (
              <div className={`email-paper html${device === 'mobile' ? ' mobile' : ''}`} style={thumb}>
                <HtmlFrame html={fillSample(t.html, t.examples)} title={`${t.name} preview`} />
              </div>
            ) : (
              empty
            )
          ) : blocks.length ? (
            <div className={`email-paper${device === 'mobile' ? ' mobile' : ''}`} style={{ ...paperStyle(design), ...thumb }}>
              <EmailBlocks blocks={blocks} design={design} examples={t.examples} />
            </div>
          ) : (
            empty
          )}
        </div>
      </div>
    )
  }

  if (t.channel === 'push') {
    return (
      <div className={`tpl-preview tpl-push ${size}`}>
        <div className="tpl-push-time">9:41</div>
        <div className="tpl-push-card">
          <span className="tpl-push-icon"><i className="ri-notification-3-fill" /></span>
          <div className="min-w-0 flex-1">
            <div className="d-flex justify-content-between"><span className="tpl-push-app">{SENDER.toUpperCase()}</span><span className="tpl-push-app">now</span></div>
            <strong className="d-block text-truncate">{fill(t.subject) || 'Notification title'}</strong>
            <span className="tpl-push-text">{fill(t.body) || 'Notification text'}</span>
            {size === 'full' && t.push?.image && <img className="tpl-push-image" src={t.push.image} alt="" />}
          </div>
        </div>
        {size === 'full' && t.push?.url && <div className="tpl-push-link"><i className="ri-cursor-line" /> Opens {t.push.url}</div>}
      </div>
    )
  }

  const whatsapp = t.channel === 'whatsapp'
  const wa = whatsapp ? t.whatsapp : undefined
  return (
    <div className={`tpl-preview ${whatsapp ? 'tpl-wa' : 'tpl-sms'} ${size}`}>
      <div className="tpl-chat-head">
        {whatsapp ? <i className="ri-whatsapp-line" /> : <i className="ri-message-2-line" />}
        <span>{SENDER}</span>
        {whatsapp && <i className="ri-verified-badge-fill tpl-verified" title="Verified business" />}
      </div>
      <div className="tpl-chat-body">
        {t.body.trim() ? (
          <div className="tpl-msg">
            <div className="tpl-bubble">
              {wa?.headerType === 'image' && wa.header && <img className="tpl-bubble-img" src={wa.header} alt="" />}
              {wa?.headerType === 'text' && wa.header && <strong className="d-block mb-1">{fill(wa.header)}</strong>}
              {whatsapp ? waFormat(fill(t.body)) : fill(t.body)}
              {wa?.footer && <span className="tpl-bubble-footer">{wa.footer}</span>}
              <span className="tpl-bubble-time">9:41{whatsapp && <i className="ri-check-double-line ms-1" />}</span>
            </div>
            {!!wa?.buttons.length && (
              <div className="tpl-wa-buttons">
                {wa.buttons.slice(0, size === 'thumb' ? 2 : 10).map((b) => (
                  <span key={b.id}><i className={BUTTON_ICON[b.type]} />{b.text || 'Button'}</span>
                ))}
              </div>
            )}
          </div>
        ) : (
          empty
        )}
      </div>
    </div>
  )
}
