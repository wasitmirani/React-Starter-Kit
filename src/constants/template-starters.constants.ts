import type { Channel } from '@/types/channel.types'
import type { EmailBlock, TemplateCategory } from '@/types/messaging.types'

export interface TemplateStarter {
  key: string
  title: string
  description: string
  icon: string
  category: TemplateCategory
  subject?: string
  body?: string
  /** Email only; ids are assigned when the template is created. */
  blocks?: Omit<EmailBlock, 'id'>[]
  examples?: Record<string, string>
  /** Email written in HTML instead of blocks. */
  editor?: 'html'
}

const BLANK: TemplateStarter = { key: 'blank', title: 'Blank', description: 'Start with an empty template.', icon: 'ri-file-line', category: 'marketing' }

/** Ready-made starting points per channel for the New template dialog. */
export const TEMPLATE_STARTERS: Partial<Record<Channel, TemplateStarter[]>> = {
  email: [
    { ...BLANK, blocks: [{ type: 'heading', content: 'Your headline', align: 'center' }, { type: 'text', content: 'Hi {{first_name}},', align: 'left' }] },
    {
      key: 'newsletter',
      title: 'Newsletter',
      description: 'Logo, headline, story and a call to action.',
      icon: 'ri-newspaper-line',
      category: 'marketing',
      subject: 'What’s new this month, {{first_name}}',
      blocks: [
        { type: 'heading', content: 'This month at Northwind', align: 'center' },
        { type: 'text', content: 'Hi {{first_name}}, here is what we have been working on and a few picks we think you will like.', align: 'left' },
        { type: 'button', content: 'Read more', href: 'https://northwind.io/blog', align: 'center' },
      ],
    },
    {
      key: 'welcome',
      title: 'Welcome',
      description: 'Greets new subscribers and sets expectations.',
      icon: 'ri-hand-heart-line',
      category: 'marketing',
      subject: 'Welcome to Northwind, {{first_name}}',
      blocks: [
        { type: 'heading', content: 'Welcome aboard!', align: 'center' },
        { type: 'text', content: 'Thanks for joining, {{first_name}}. Expect one email a week with new arrivals and member-only offers.', align: 'left' },
        { type: 'button', content: 'Start shopping', href: 'https://northwind.io/shop', align: 'center' },
      ],
    },
    {
      key: 'receipt',
      title: 'Order receipt',
      description: 'Transactional confirmation with the order number.',
      icon: 'ri-receipt-line',
      category: 'transactional',
      subject: 'Order {{order_id}} confirmed',
      blocks: [
        { type: 'heading', content: 'Thanks for your order', align: 'center' },
        { type: 'text', content: 'Hi {{first_name}}, we received order {{order_id}} and will email you again when it ships.', align: 'left' },
        { type: 'button', content: 'View order', href: 'https://northwind.io/orders', align: 'center' },
      ],
    },
    { key: 'html', title: 'Custom HTML', description: 'Paste or write your own HTML, or import a file.', icon: 'ri-code-s-slash-line', category: 'marketing', subject: '', editor: 'html' },
  ],
  whatsapp: [
    { ...BLANK, category: 'utility' },
    { key: 'shipping', title: 'Shipping update', description: 'Utility message with tracking link.', icon: 'ri-truck-line', category: 'utility', body: 'Hi {{1}}, your order {{2}} has shipped. Track it here: {{3}}', examples: { '1': 'Olivia', '2': '#10482', '3': 'nwd.io/t/8f2k' } },
    { key: 'otp', title: 'Verification code', description: 'Authentication template Meta approves quickly.', icon: 'ri-shield-keyhole-line', category: 'authentication', body: '{{1}} is your verification code. For your security, do not share this code.', examples: { '1': '482913' } },
    { key: 'offer', title: 'Promotion', description: 'Marketing offer with a discount code.', icon: 'ri-coupon-3-line', category: 'marketing', body: 'Hi {{1}}! Enjoy {{2}} off your next order with code {{3}}. Valid until Sunday.', examples: { '1': 'Olivia', '2': '20%', '3': 'SPRING20' } },
  ],
  sms: [
    BLANK,
    { key: 'otp', title: 'One-time code', description: 'Short code message for sign-in.', icon: 'ri-lock-password-line', category: 'authentication', body: 'Your Northwind code is {{code}}. It expires in 10 minutes.' },
    { key: 'reminder', title: 'Appointment reminder', description: 'Confirm by reply.', icon: 'ri-calendar-check-line', category: 'utility', body: 'Northwind: reminder of your appointment tomorrow at 10:30. Reply YES to confirm or NO to reschedule.' },
    { key: 'flash', title: 'Flash sale', description: 'Promo with opt-out text.', icon: 'ri-flashlight-line', category: 'marketing', body: 'Northwind: 24h flash sale, 30% off with code FLASH30. Reply STOP to opt out.' },
  ],
  push: [
    BLANK,
    { key: 'cart', title: 'Abandoned cart', description: 'Bring shoppers back to checkout.', icon: 'ri-shopping-cart-line', category: 'marketing', subject: 'You left something behind', body: 'Your cart is waiting — complete checkout and get free shipping.' },
    { key: 'shipped', title: 'Order shipped', description: 'Transactional status update.', icon: 'ri-truck-line', category: 'transactional', subject: 'Your order is on its way', body: 'Order {{order_id}} has shipped. Tap to track it.' },
  ],
}
