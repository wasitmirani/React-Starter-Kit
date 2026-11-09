export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  VERIFY_EMAIL: '/verify-email',
  ACCEPT_INVITATION: '/accept-invitation',

  DASHBOARD: '/dashboard',
  ANALYTICS: '/analytics',
  INBOX: '/inbox',

  CONTACTS: '/contacts',
  CONTACT: '/contacts/:id',
  CONTACT_IMPORT: '/contacts/import',
  LISTS: '/lists',
  SEGMENTS: '/segments',
  SEGMENT_NEW: '/segments/new',
  SEGMENT: '/segments/:id',
  ATTRIBUTES: '/contact-attributes',

  COMPANIES: '/companies',
  DEALS: '/deals',
  TASKS: '/tasks',

  CAMPAIGNS: '/campaigns',
  CAMPAIGN_NEW: '/campaigns/new',
  CAMPAIGN: '/campaigns/:id',
  CAMPAIGN_EDIT: '/campaigns/:id/edit',
  AUTOMATIONS: '/automations',
  AUTOMATION: '/automations/:id',
  TEMPLATES: '/templates',
  TEMPLATE_BRAND_KIT: '/templates/brand-kit',
  TEMPLATE: '/templates/:id',
  FORMS: '/forms',
  FORM: '/forms/:id',
  MESSAGES: '/messages',

  CHANNELS: '/channels',
  CHANNEL_EMAIL: '/channels/email',
  CHANNEL_SMS: '/channels/sms',
  CHANNEL_WHATSAPP: '/channels/whatsapp',
  CHANNEL_VOICE: '/channels/voice',
  CHANNEL_LIVECHAT: '/channels/livechat',

  DEVELOPERS_WEBHOOKS: '/developers/webhooks',

  SETTINGS_WORKSPACE: '/settings/workspace',
  SETTINGS_TEAM: '/settings/team',
  SETTINGS_ROLES: '/settings/roles',
  SETTINGS_API_KEYS: '/settings/api-keys',
  SETTINGS_AUDIT_LOG: '/settings/audit-log',
  SETTINGS_BILLING: '/settings/billing',
  SETTINGS_PROFILE: '/settings/profile',
  NOT_FOUND: '*',
} as const

/** Fills `:param` placeholders: `to(ROUTES.CONTACT, { id })`. */
export function to(route: string, params: Record<string, string>): string {
  return route.replace(/:(\w+)/g, (_, key: string) => encodeURIComponent(params[key] ?? ''))
}
