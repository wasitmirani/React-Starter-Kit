import type { EmailBlock, EmailBlockType, EmailDesign, SocialNetwork } from '@/types/messaging.types'

export const DEFAULT_DESIGN: EmailDesign = { accent: '#4f46e5', background: '#f1f5f9', paper: '#ffffff', text: '#1f2937', font: 'Inter', radius: 8 }

export const EMAIL_FONTS: EmailDesign['font'][] = ['Inter', 'Helvetica', 'Georgia', 'Trebuchet MS']

/** Brand palettes offered in the Style tab (accent, background). */
export const DESIGN_PRESETS: { name: string; design: Partial<EmailDesign> }[] = [
  { name: 'Indigo', design: { accent: '#4f46e5', background: '#f1f5f9' } },
  { name: 'Teal', design: { accent: '#0f766e', background: '#ecfdf5' } },
  { name: 'Rose', design: { accent: '#e11d48', background: '#fff1f2' } },
  { name: 'Amber', design: { accent: '#d97706', background: '#fffbeb' } },
  { name: 'Slate', design: { accent: '#0f172a', background: '#f8fafc' } },
]

export const LOGO = '/assets/images/email/northwind-logo.svg'

type BlockSeed = Omit<EmailBlock, 'id'>

export interface BlockDef {
  type: EmailBlockType
  label: string
  icon: string
  seed: BlockSeed
}

export const BLOCK_LIBRARY: BlockDef[] = [
  { type: 'heading', label: 'Heading', icon: 'ri-heading', seed: { type: 'heading', content: 'A great headline', align: 'center', level: 1 } },
  { type: 'text', label: 'Text', icon: 'ri-text', seed: { type: 'text', content: 'Write something your readers will enjoy.', align: 'left', size: 15 } },
  { type: 'button', label: 'Button', icon: 'ri-cursor-line', seed: { type: 'button', content: 'Shop now', href: 'https://northwind.io', align: 'center' } },
  { type: 'image', label: 'Image', icon: 'ri-image-line', seed: { type: 'image', content: LOGO, alt: 'Northwind Traders', align: 'center', width: 40 } },
  { type: 'divider', label: 'Divider', icon: 'ri-separator', seed: { type: 'divider', content: '' } },
  { type: 'spacer', label: 'Spacer', icon: 'ri-space', seed: { type: 'spacer', content: '', height: 24 } },
  { type: 'social', label: 'Social', icon: 'ri-share-line', seed: { type: 'social', content: '', align: 'center', links: { facebook: 'https://facebook.com/northwind', instagram: 'https://instagram.com/northwind', linkedin: 'https://linkedin.com/company/northwind' } } },
  { type: 'footer', label: 'Footer', icon: 'ri-layout-bottom-line', seed: { type: 'footer', content: 'Northwind Traders · 100 Market St, San Francisco · Unsubscribe', align: 'center' } },
  {
    type: 'html',
    label: 'HTML',
    icon: 'ri-code-s-slash-line',
    seed: { type: 'html', content: '<table width="100%" style="border-collapse:collapse">\n  <tr>\n    <td style="padding:12px;background:#f8fafc;border-radius:8px;text-align:center">\n      Custom HTML for {{first_name}}\n    </td>\n  </tr>\n</table>', padding: 'sm' },
  },
]

/** Starting document for templates written entirely in HTML. */
export const HTML_STARTER = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{{subject}}</title>
  </head>
  <body style="margin:0;background:#f1f5f9;font-family:Arial,sans-serif;color:#1f2937">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center" style="padding:24px">
          <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:10px">
            <tr><td style="padding:32px 32px 8px;font-size:24px;font-weight:700">Hello {{first_name}},</td></tr>
            <tr><td style="padding:8px 32px 24px;font-size:15px;line-height:1.6">Write your email here, or paste HTML exported from another tool.</td></tr>
            <tr><td style="padding:0 32px 32px"><a href="https://northwind.io" style="display:inline-block;padding:12px 24px;background:#0f766e;color:#ffffff;border-radius:8px;text-decoration:none;font-weight:600">Visit Northwind</a></td></tr>
            <tr><td style="padding:16px 32px;font-size:12px;color:#6b7280;border-top:1px solid #e5e7eb">Northwind Traders · 100 Market St, San Francisco · <a href="{{unsubscribe_url}}" style="color:#6b7280">Unsubscribe</a></td></tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`

export interface SectionDef {
  key: string
  label: string
  description: string
  icon: string
  blocks: BlockSeed[]
}

/** Ready-made groups of blocks inserted together. */
export const SECTIONS: SectionDef[] = [
  {
    key: 'hero',
    label: 'Hero',
    description: 'Logo, headline, intro and a button',
    icon: 'ri-layout-top-2-line',
    blocks: [
      { type: 'image', content: LOGO, alt: 'Northwind Traders', align: 'center', width: 40 },
      { type: 'heading', content: 'Big news, {{first_name}}', align: 'center', level: 1 },
      { type: 'text', content: 'One sentence that makes people want to read on.', align: 'center', size: 16 },
      { type: 'button', content: 'Find out more', href: 'https://northwind.io', align: 'center' },
    ],
  },
  {
    key: 'promo',
    label: 'Promo code',
    description: 'Offer, highlighted code and a button',
    icon: 'ri-coupon-3-line',
    blocks: [
      { type: 'heading', content: '20% off this week', align: 'center', level: 2 },
      { type: 'text', content: 'SPRING20', align: 'center', size: 26, bg: '#eef2ff', padding: 'md' },
      { type: 'button', content: 'Use my code', href: 'https://northwind.io/shop', align: 'center', fullWidth: true },
    ],
  },
  {
    key: 'story',
    label: 'Story',
    description: 'Image, subheading and paragraph',
    icon: 'ri-article-line',
    blocks: [
      { type: 'image', content: '/assets/images/1.webp', alt: 'Product photo', align: 'center', width: 100, padding: 'none' },
      { type: 'heading', content: 'Made to last', align: 'left', level: 2 },
      { type: 'text', content: 'Tell the story behind the product: who made it, why, and what makes it different.', align: 'left', size: 15 },
    ],
  },
  {
    key: 'signoff',
    label: 'Sign-off',
    description: 'Thanks, social links and legal footer',
    icon: 'ri-quill-pen-line',
    blocks: [
      { type: 'text', content: 'Thanks for reading,\nThe Northwind team', align: 'left', size: 15 },
      { type: 'divider', content: '' },
      { type: 'social', content: '', align: 'center', links: { facebook: 'https://facebook.com/northwind', instagram: 'https://instagram.com/northwind', x: 'https://x.com/northwind' } },
      { type: 'footer', content: 'Northwind Traders · 100 Market St, San Francisco · {{unsubscribe_url}}', align: 'center' },
    ],
  },
]

export const SOCIAL_NETWORKS: { key: SocialNetwork; label: string; icon: string }[] = [
  { key: 'facebook', label: 'Facebook', icon: 'ri-facebook-circle-fill' },
  { key: 'instagram', label: 'Instagram', icon: 'ri-instagram-line' },
  { key: 'linkedin', label: 'LinkedIn', icon: 'ri-linkedin-box-fill' },
  { key: 'x', label: 'X', icon: 'ri-twitter-x-line' },
  { key: 'youtube', label: 'YouTube', icon: 'ri-youtube-fill' },
]

/** Personalisation fields offered by the variable picker (email, SMS, push). */
export const PLACEHOLDERS: { key: string; label: string }[] = [
  { key: 'first_name', label: 'First name' },
  { key: 'last_name', label: 'Last name' },
  { key: 'email', label: 'Email' },
  { key: 'company', label: 'Company' },
  { key: 'city', label: 'City' },
  { key: 'order_id', label: 'Order ID' },
  { key: 'tracking_url', label: 'Tracking link' },
  { key: 'code', label: 'One-time code' },
  { key: 'unsubscribe_url', label: 'Unsubscribe link' },
]

export const PADDING_PX: Record<NonNullable<EmailBlock['padding']>, string> = { none: '0', sm: '6px 24px', md: '14px 24px', lg: '24px 32px' }
