import type { Template } from '@/types/messaging.types'
import { smsInfo } from './sms'

export type CheckLevel = 'error' | 'warning' | 'tip'

export interface TemplateCheck {
  key: string
  level: CheckLevel
  message: string
  /** Block id or field the check is about, so the editor can jump to it. */
  target?: string
}

type Checkable = Pick<Template, 'channel' | 'category' | 'subject' | 'body' | 'blocks' | 'examples' | 'previewText' | 'whatsapp' | 'push' | 'editor' | 'html'>

const PLACEHOLDER = /{{\s*([\w.]+)\s*}}/g
const placeholders = (text: string) => [...text.matchAll(PLACEHOLDER)].map((m) => m[1])
const SPAMMY = /\b(free|winner|guarantee|act now|100%|cash)\b|!!+|\${2,}/i
const isHttps = (url: string | undefined) => !!url && (/^https:\/\/\S+$/.test(url) || /^{{\s*[\w.]+\s*}}/.test(url))

/** Everything that would block sending or hurt delivery, per channel. Errors block saving for review. */
export function templateChecks(t: Checkable): TemplateCheck[] {
  const out: TemplateCheck[] = []
  const add = (key: string, level: CheckLevel, message: string, target?: string) => out.push({ key, level, message, target })

  if (t.channel === 'email') {
    const subject = t.subject?.trim() ?? ''
    if (!subject) add('subject', 'error', 'Add a subject line.', 'subject')
    else if (subject.length > 60) add('subject-long', 'warning', `Subject is ${subject.length} characters; inboxes cut it after about 60.`, 'subject')
    if (subject && SPAMMY.test(subject)) add('subject-spam', 'warning', 'The subject has words or punctuation spam filters dislike (FREE, !!!, $$).', 'subject')
    if (!t.previewText?.trim()) add('preheader', 'tip', 'Add preview text: it shows next to the subject in most inboxes.', 'previewText')
    if (t.editor === 'html') {
      const html = t.html ?? ''
      if (!html.trim()) add('empty', 'error', 'The email has no HTML yet.', 'html')
      if (/<script[\s>]/i.test(html)) add('script', 'error', 'Remove <script> tags: email clients block them and they are stripped when sending.', 'html')
      if (/\son\w+\s*=/i.test(html)) add('handlers', 'warning', 'Inline event handlers (onclick=…) are stripped when sending.', 'html')
      if (/href="http:\/\//i.test(html)) add('http', 'warning', 'Some links use http://; use https:// so they are not flagged.', 'html')
      if (/<img(?![^>]*\balt=)[^>]*>/i.test(html)) add('alt-html', 'warning', 'Add alt="…" to every <img>.', 'html')
      if (html.length > 102_000) add('clip', 'warning', 'Gmail clips emails larger than about 102 KB.', 'html')
      if (html.trim() && !/unsubscribe/i.test(html)) add('unsubscribe', t.category === 'marketing' ? 'error' : 'warning', 'Add an unsubscribe link ({{unsubscribe_url}}). Marketing email requires it.', 'html')
      return out
    }
    if (!t.blocks.length) add('empty', 'error', 'The email has no content yet.')
    const text = t.blocks.map((b) => `${b.content} ${b.href ?? ''}`).join(' ').toLowerCase()
    if (t.blocks.length && !/unsubscribe/.test(text)) add('unsubscribe', t.category === 'marketing' ? 'error' : 'warning', 'Add an unsubscribe link (a footer with “Unsubscribe” or {{unsubscribe_url}}). Marketing email requires it.')
    for (const b of t.blocks) {
      if (b.type === 'button' && !isHttps(b.href)) add(`btn-${b.id}`, 'error', `Button “${b.content || 'Button'}” needs an https:// link.`, b.id)
      if (b.type === 'image' && !b.content) add(`img-${b.id}`, 'error', 'An image block has no image.', b.id)
      if (b.type === 'image' && b.content && !b.alt?.trim()) add(`alt-${b.id}`, 'warning', 'Add alt text to images; many inboxes block images by default.', b.id)
      if (b.type === 'html' && /<script[\s>]/i.test(b.content)) add(`script-${b.id}`, 'error', 'An HTML block contains <script>; it is stripped when sending.', b.id)
    }
    if (t.blocks.length && !t.blocks.some((b) => b.type === 'button')) add('cta', 'tip', 'Emails with one clear button get more clicks.')
    if (t.blocks.length && !placeholders(`${t.subject ?? ''} ${text}`).some((p) => p !== 'unsubscribe_url')) add('personal', 'tip', 'Personalise with a field like {{first_name}}.')
    const images = t.blocks.filter((b) => b.type === 'image').length
    const words = t.blocks.filter((b) => ['heading', 'text'].includes(b.type)).reduce((n, b) => n + b.content.split(/\s+/).filter(Boolean).length, 0)
    if (images >= 2 && words < 20) add('ratio', 'warning', 'Mostly images and little text: spam filters may flag it.')
  }

  if (t.channel === 'sms') {
    const body = t.body.trim()
    if (!body) add('body', 'error', 'Write the message.', 'body')
    const info = smsInfo(t.body)
    if (info.segments > 2) add('segments', 'warning', `${info.segments} segments: each one is billed. Keep it under ${info.encoding === 'GSM-7' ? 306 : 134} characters for 2.`, 'body')
    if (info.encoding === 'UCS-2' && body) add('ucs2', 'tip', 'Emoji or special characters switch to Unicode, which fits only 70 characters per segment.', 'body')
    if (t.category === 'marketing' && body && !/\bstop\b/i.test(body)) add('stop', 'error', 'Marketing SMS must say how to opt out, e.g. “Reply STOP to opt out”.', 'body')
    if (body && !/^[A-Z][\w &.-]{1,20}:/i.test(body)) add('brand', 'tip', 'Start with your brand name (e.g. “Northwind: …”) so people know who is texting.', 'body')
  }

  if (t.channel === 'whatsapp') {
    const wa = t.whatsapp
    const body = t.body.trim()
    if (!body) add('body', 'error', 'Write the message body.', 'body')
    if (t.body.length > 1024) add('body-long', 'error', `The body is ${t.body.length} characters; WhatsApp allows 1,024.`, 'body')
    const vars = placeholders(t.body)
    if (vars.some((v) => !/^\d+$/.test(v))) add('numbered', 'error', 'WhatsApp variables must be numbered: {{1}}, {{2}}…', 'body')
    const nums = [...new Set(vars.filter((v) => /^\d+$/.test(v)).map(Number))].sort((a, b) => a - b)
    if (nums.some((n, i) => n !== i + 1)) add('sequence', 'error', `Number variables in order without gaps: {{1}} to {{${nums.length}}}.`, 'body')
    if (/^\s*{{/.test(t.body) || /}}\s*[.!?]?\s*$/.test(t.body)) add('edges', 'error', 'Meta rejects a body that starts or ends with a variable. Add text before or after it.', 'body')
    for (const n of nums) if (!t.examples?.[String(n)]?.trim()) add(`example-${n}`, 'error', `Give an example value for {{${n}}}; Meta reviews the template with it.`, `example-${n}`)
    if (wa?.headerType === 'text' && wa.header.length > 60) add('header', 'error', 'Header text is limited to 60 characters.', 'header')
    if (wa?.headerType === 'image' && !isHttps(wa.header)) add('header-img', 'error', 'The header image needs an https:// URL.', 'header')
    if (wa?.footer && wa.footer.length > 60) add('footer', 'error', 'Footer text is limited to 60 characters.', 'footer')
    if (wa?.footer && placeholders(wa.footer).length) add('footer-vars', 'error', 'The footer cannot contain variables.', 'footer')
    for (const b of wa?.buttons ?? []) {
      if (!b.text.trim()) add(`btn-${b.id}`, 'error', 'Every button needs a label.', b.id)
      else if (b.text.length > 25) add(`btn-len-${b.id}`, 'error', `Button “${b.text}” is longer than 25 characters.`, b.id)
      if (b.type === 'url' && !isHttps(b.value)) add(`btn-url-${b.id}`, 'error', `Button “${b.text || 'Visit'}” needs an https:// link.`, b.id)
      if (b.type === 'phone' && !/^\+\d{7,15}$/.test(b.value ?? '')) add(`btn-ph-${b.id}`, 'error', `Button “${b.text || 'Call'}” needs a phone number in +country format.`, b.id)
    }
    const buttons = wa?.buttons ?? []
    if (buttons.filter((b) => b.type === 'url').length > 2) add('url-max', 'error', 'At most 2 link buttons.')
    if (buttons.filter((b) => b.type === 'phone').length > 1) add('phone-max', 'error', 'At most 1 call button.')
    if (t.category === 'marketing' && !/stop|opt.?out|unsubscribe/i.test(`${wa?.footer ?? ''} ${t.body}`) && !buttons.some((b) => /stop|unsubscribe/i.test(b.text))) add('optout', 'tip', 'Marketing templates do better with an opt-out, e.g. a “Stop promotions” quick reply.')
    if (t.category === 'authentication' && vars.length !== 1) add('auth', 'warning', 'Authentication templates should contain exactly one variable: the code.', 'body')
  }

  if (t.channel === 'push') {
    const title = t.subject?.trim() ?? ''
    if (!title) add('title', 'error', 'Add a title.', 'subject')
    else if (title.length > 50) add('title-long', 'warning', `The title is ${title.length} characters; phones cut it after about 50.`, 'subject')
    if (!t.body.trim()) add('body', 'error', 'Write the notification text.', 'body')
    else if (t.body.length > 178) add('body-long', 'warning', 'Keep the text under about 178 characters so it is not cut off.', 'body')
    if (t.push?.url && !isHttps(t.push.url) && !/^[a-z][a-z0-9+.-]*:\/\//i.test(t.push.url)) add('link', 'error', 'The tap link must be https:// or an app deep link (myapp://…).', 'url')
    if (t.push?.image && !isHttps(t.push.image)) add('image', 'error', 'The image needs an https:// URL.', 'image')
    if (!t.push?.url) add('link-missing', 'tip', 'Add a tap link so the notification opens the right screen.', 'url')
  }

  return out
}

/** 0–100: every error costs 25, warnings 10, tips 3. */
export function checkScore(checks: TemplateCheck[]): number {
  const cost = checks.reduce((n, c) => n + (c.level === 'error' ? 25 : c.level === 'warning' ? 10 : 3), 0)
  return Math.max(0, 100 - cost)
}
