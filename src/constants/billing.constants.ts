import type { Plan } from '@/types/platform.types'

export const PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    priceMonthly: 0,
    description: 'Try every channel with a small audience.',
    features: ['300 emails / day', 'Unified inbox (1 seat)', 'Forms and lists', 'Community support'],
    limits: { contacts: 1_000, emails: 9_000, seats: 1 },
  },
  {
    id: 'starter',
    name: 'Starter',
    priceMonthly: 29,
    description: 'Email and SMS marketing for growing teams.',
    features: ['20,000 emails / month', 'SMS and WhatsApp (pay as you go)', 'A/B testing', 'Remove branding', '3 seats'],
    limits: { contacts: 10_000, emails: 20_000, seats: 3 },
  },
  {
    id: 'business',
    name: 'Business',
    priceMonthly: 299,
    description: 'Automation, segmentation and the full inbox.',
    features: ['250,000 emails / month', 'Automation workflows', 'Advanced segments', 'Sales CRM and pipelines', 'Voice and IVR', '10 seats'],
    limits: { contacts: 50_000, emails: 250_000, seats: 10 },
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    priceMonthly: null,
    description: 'Custom volumes, SSO, SLAs and a dedicated IP.',
    features: ['Custom volumes', 'SSO and audit exports', 'Dedicated IP and deliverability support', '99.95% uptime SLA', 'Unlimited seats'],
    limits: { contacts: null, emails: null, seats: null },
  },
]
