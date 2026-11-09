import { FormField } from '@/components/common/FormField'
import { Segmented } from '@/components/ui/Segmented'
import type { Template, WhatsAppButton, WhatsAppParts } from '@/types/messaging.types'
import { smsInfo } from '@/utils/helpers/sms'
import { numberedVars } from '@/utils/helpers/template'
import { EditorSection } from './EditorParts'
import { TokenField } from './TokenField'

export type MessageDraft = Pick<Template, 'subject' | 'body' | 'examples' | 'whatsapp' | 'push' | 'category'>

interface EditorProps {
  value: MessageDraft
  onChange: (patch: Partial<MessageDraft>) => void
}

const EMPTY_WHATSAPP: WhatsAppParts = { headerType: 'none', header: '', footer: '', buttons: [] }

const BUTTON_KINDS: { type: WhatsAppButton['type']; label: string; icon: string; placeholder?: string }[] = [
  { type: 'quick_reply', label: 'Quick reply', icon: 'ri-reply-line' },
  { type: 'url', label: 'Visit website', icon: 'ri-external-link-line', placeholder: 'https://northwind.io/orders/{{1}}' },
  { type: 'phone', label: 'Call', icon: 'ri-phone-line', placeholder: '+14155550123' },
]

/** WhatsApp template: header, numbered body with examples, footer and up to 10 buttons. */
export function WhatsAppEditor({ value, onChange }: EditorProps) {
  const wa = { ...EMPTY_WHATSAPP, ...value.whatsapp }
  const setWa = (patch: Partial<WhatsAppParts>) => onChange({ whatsapp: { ...wa, ...patch } })
  const vars = numberedVars(value.body)
  const next = (vars[vars.length - 1] ?? 0) + 1
  const setButton = (id: string, patch: Partial<WhatsAppButton>) => setWa({ buttons: wa.buttons.map((b) => (b.id === id ? { ...b, ...patch } : b)) })
  const count = (t: WhatsAppButton['type']) => wa.buttons.filter((b) => b.type === t).length
  const canAdd = (t: WhatsAppButton['type']) => wa.buttons.length < 10 && (t !== 'url' || count('url') < 2) && (t !== 'phone' || count('phone') < 1)

  return (
    <>
      <EditorSection title="Header (optional)">
        <Segmented<WhatsAppParts['headerType']> block ariaLabel="Header type" value={wa.headerType} onChange={(headerType) => setWa({ headerType, header: headerType === wa.headerType ? wa.header : '' })} options={[{ value: 'none', label: 'None' }, { value: 'text', label: 'Text', icon: 'ri-text' }, { value: 'image', label: 'Image', icon: 'ri-image-line' }]} />
        {wa.headerType === 'text' && <TokenField id="header" label="Header text" value={wa.header} onChange={(header) => setWa({ header })} max={60} variables={false} className="mt-3 mb-0" placeholder="Your order is on its way" />}
        {wa.headerType === 'image' && (
          <FormField id="header" label="Image URL" hint="JPG or PNG, up to 5 MB. Sent with every message." className="mt-3 mb-0">
            <input id="header" className="form-control" value={wa.header} placeholder="https://…" onChange={(e) => setWa({ header: e.target.value })} />
          </FormField>
        )}
      </EditorSection>

      <EditorSection title="Body">
        <TokenField id="body" label="Message" value={value.body} onChange={(body) => onChange({ body })} multiline rows={6} max={1024} soft={900} variables={next} hint="Variables are numbered {{1}}, {{2}}… in order. *bold* _italic_ ~strike~ work." />
        {vars.length > 0 && (
          <div className="examples-grid">
            {vars.map((n) => (
              <div key={n} className="input-group input-group-sm">
                <span className="input-group-text font-monospace">{`{{${n}}}`}</span>
                <input id={`example-${n}`} className={`form-control${value.examples?.[String(n)]?.trim() ? '' : ' is-invalid'}`} placeholder="Example value for review" value={value.examples?.[String(n)] ?? ''} onChange={(e) => onChange({ examples: { ...value.examples, [String(n)]: e.target.value } })} aria-label={`Example for variable ${n}`} />
              </div>
            ))}
          </div>
        )}
      </EditorSection>

      <EditorSection title="Footer (optional)">
        <TokenField id="footer" label="Footer text" value={wa.footer} onChange={(footer) => setWa({ footer })} max={60} variables={false} className="mb-0" placeholder="Reply STOP to unsubscribe" hint="Small grey text; no variables allowed." />
      </EditorSection>

      <EditorSection title={`Buttons (${wa.buttons.length}/10)`}>
        <div className="d-flex flex-column gap-2 mb-2">
          {wa.buttons.map((b) => {
            const kind = BUTTON_KINDS.find((k) => k.type === b.type)!
            return (
              <div key={b.id} id={b.id} className="wa-button-row">
                <span className="icon-tile icon-tile-sm bg-success-subtle text-success" title={kind.label}><i className={kind.icon} /></span>
                <div className="flex-1 d-flex flex-column gap-1 min-w-0">
                  <input className="form-control form-control-sm" placeholder="Button label" maxLength={25} value={b.text} onChange={(e) => setButton(b.id, { text: e.target.value })} aria-label="Button label" />
                  {b.type !== 'quick_reply' && <input className="form-control form-control-sm font-monospace" placeholder={kind.placeholder} value={b.value ?? ''} onChange={(e) => setButton(b.id, { value: e.target.value })} aria-label={b.type === 'url' ? 'Link' : 'Phone number'} />}
                </div>
                <button type="button" className="btn btn-sm btn-icon btn-light text-danger" aria-label="Remove button" onClick={() => setWa({ buttons: wa.buttons.filter((x) => x.id !== b.id) })}><i className="ri-close-line" /></button>
              </div>
            )
          })}
        </div>
        <div className="d-flex flex-wrap gap-2">
          {BUTTON_KINDS.map((k) => (
            <button key={k.type} type="button" className="btn btn-sm btn-light" disabled={!canAdd(k.type)} onClick={() => setWa({ buttons: [...wa.buttons, { id: crypto.randomUUID(), type: k.type, text: k.type === 'quick_reply' ? '' : k.label, value: '' }] })}>
              <i className={`${k.icon} me-1`} />{k.label}
            </button>
          ))}
        </div>
        <p className="form-text mb-0 mt-2">Up to 10 buttons: at most 2 links and 1 call button.</p>
      </EditorSection>
    </>
  )
}

/** SMS: body with a live segment meter and one-click compliance helpers. */
export function SmsEditor({ value, onChange }: EditorProps) {
  const info = smsInfo(value.body)
  const perSegment = info.encoding === 'GSM-7' ? (info.segments > 1 ? 153 : 160) : info.segments > 1 ? 67 : 70
  const used = perSegment - info.remaining
  const hasStop = /\bstop\b/i.test(value.body)
  return (
    <EditorSection title="Message">
      <TokenField id="body" label="Text" value={value.body} onChange={(body) => onChange({ body })} multiline rows={6} max={1600} />
      <div className="sms-meter mb-3" aria-label={`${info.segments} segments`}>
        <div className="d-flex justify-content-between fs-xs mb-1">
          <span><strong>{info.segments}</strong> segment{info.segments === 1 ? '' : 's'} · {info.encoding}</span>
          <span className="text-muted">{info.remaining} left in this segment</span>
        </div>
        <div className="sms-meter-bar">
          {Array.from({ length: Math.max(1, info.segments) }, (_, i) => (
            <span key={i} className={i < info.segments - 1 ? 'full' : ''} style={i === info.segments - 1 ? { ['--fill' as string]: `${(used / perSegment) * 100}%` } : undefined} />
          ))}
        </div>
      </div>
      <div className="d-flex flex-wrap gap-2">
        {!/^[A-Z][\w &.-]{1,20}:/i.test(value.body) && <button type="button" className="btn btn-sm btn-light" onClick={() => onChange({ body: `Northwind: ${value.body}` })}><i className="ri-price-tag-3-line me-1" />Add brand prefix</button>}
        {!hasStop && <button type="button" className="btn btn-sm btn-light" onClick={() => onChange({ body: `${value.body.trim()} Reply STOP to opt out.` })}><i className="ri-forbid-line me-1" />Add opt-out text</button>}
      </div>
    </EditorSection>
  )
}

/** Push notification: title, text, tap link and image. */
export function PushEditor({ value, onChange }: EditorProps) {
  const push = { url: '', image: '', ...value.push }
  return (
    <>
      <EditorSection title="Notification">
        <TokenField id="subject" label="Title" value={value.subject ?? ''} onChange={(subject) => onChange({ subject })} soft={50} max={65} />
        <TokenField id="body" label="Text" value={value.body} onChange={(body) => onChange({ body })} multiline rows={3} soft={178} max={240} className="mb-0" />
      </EditorSection>
      <EditorSection title="When tapped">
        <TokenField id="url" label="Open link" value={push.url} onChange={(url) => onChange({ push: { ...push, url } })} placeholder="https://northwind.io/cart or northwind://cart" hint="A web link or an app deep link." />
        <FormField id="image" label="Image (optional)" hint="Shown expanded on Android and iOS. 2:1 works best.">
          <input id="image" className="form-control" value={push.image} placeholder="https://…" onChange={(e) => onChange({ push: { ...push, image: e.target.value } })} />
        </FormField>
      </EditorSection>
    </>
  )
}
