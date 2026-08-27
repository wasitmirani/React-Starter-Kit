export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',

  // Overview
  DASHBOARD: '/dashboard',
  ANALYTICS: '/dashboard/analytics',
  ANALYTICS_CALLS: '/dashboard/analytics/calls',
  ANALYTICS_AGENTS: '/dashboard/analytics/agents',
  ANALYTICS_CAMPAIGNS: '/dashboard/analytics/campaigns',
  ANALYTICS_COSTS: '/dashboard/analytics/costs',

  // AI Agents
  AGENTS: '/agents',
  AGENT_CREATE: '/agents/create',
  AGENT_TEMPLATES: '/agents/templates',
  AGENT_VOICES: '/agents/voices',
  AGENT_PROMPTS: '/agents/prompts',

  // Calls
  CALLS: '/calls',
  CALLS_LIVE: '/calls/live',
  CALLS_RECORDINGS: '/calls/recordings',
  CALLS_TRANSCRIPTS: '/calls/transcripts',
  CALLS_OUTCOMES: '/calls/outcomes',

  // Campaigns
  CAMPAIGNS: '/campaigns',
  CAMPAIGN_CREATE: '/campaigns/create',
  CAMPAIGNS_ACTIVE: '/campaigns/active',
  CAMPAIGNS_SCHEDULED: '/campaigns/scheduled',
  CAMPAIGNS_REPORTS: '/campaigns/reports',

  // CRM / Contacts
  CONTACTS: '/contacts',
  CONTACTS_LEADS: '/contacts/leads',
  CONTACTS_LISTS: '/contacts/lists',
  CONTACTS_TAGS: '/contacts/tags',
  CONTACTS_IMPORT: '/contacts/import',
  CONTACTS_EXPORT: '/contacts/export',

  // Knowledge Base
  KNOWLEDGE: '/knowledge',
  KNOWLEDGE_DOCUMENTS: '/knowledge/documents',
  KNOWLEDGE_FAQS: '/knowledge/faqs',
  KNOWLEDGE_WEBSITES: '/knowledge/websites',
  KNOWLEDGE_INSIGHTS: '/knowledge/insights',

  // Telephony
  PHONE_NUMBERS: '/telephony/numbers',
  PHONE_BUY: '/telephony/buy',
  PHONE_SIP: '/telephony/sip',
  PHONE_ROUTING: '/telephony/routing',
  PHONE_HOURS: '/telephony/hours',
  PHONE_CALLER_ID: '/telephony/caller-id',

  // Automation
  WORKFLOWS: '/automation/workflows',
  AUTOMATIONS: '/automation/automations',
  AUTOMATION_SCHEDULED: '/automation/scheduled-calls',
  AUTOMATION_FOLLOWUPS: '/automation/follow-ups',
  AUTOMATION_TRIGGERS: '/automation/triggers',

  // Integrations
  INTEGRATIONS: '/integrations',
  INTEGRATIONS_CRM: '/integrations/crm',
  INTEGRATIONS_CALENDAR: '/integrations/calendar',
  INTEGRATIONS_TELEPHONY: '/integrations/telephony',
  INTEGRATIONS_WEBHOOKS: '/integrations/webhooks',
  INTEGRATIONS_API_KEYS: '/integrations/api-keys',

  // Team
  TEAM_MEMBERS: '/team/members',
  TEAM_ROLES: '/team/roles',
  TEAM_INVITATIONS: '/team/invitations',
  TEAM_ACTIVITY: '/team/activity',

  // Billing
  BILLING: '/billing',
  BILLING_PLANS: '/billing/plans',
  BILLING_USAGE: '/billing/usage',
  BILLING_INVOICES: '/billing/invoices',
  BILLING_PAYMENT_METHODS: '/billing/payment-methods',

  // Settings
  SETTINGS: '/dashboard/settings',
  SETTINGS_NOTIFICATIONS: '/dashboard/settings/notifications',
  SETTINGS_SECURITY: '/dashboard/settings/security',
  SETTINGS_AUDIT_LOGS: '/dashboard/settings/audit-logs',
  SETTINGS_DEVELOPER: '/dashboard/settings/developer',

  // Legacy / existing
  PRODUCTS: '/products',
  PRODUCT_DETAIL: '/products/:id',
  PRODUCT_CREATE: '/products/create',
  USERS: '/users',
  NOT_FOUND: '*',
} as const
