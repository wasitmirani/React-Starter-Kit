import { ROUTES } from '@/constants/routes.constants'

export type SidebarSubItem = {
  title: string
  link: string
  /** Tabler Icons class, e.g. `ti ti-chart-bar`. */
  icon: string
  /** Match NavLink `end` for exact active state (e.g. dashboard root). */
  end?: boolean
}

export type SidebarHeading = {
  type: 'heading'
  title: string
}

export type SidebarSingleItem = {
  type: 'single'
  id: string
  title: string
  link: string
  /** Tabler Icons class, e.g. `ti ti-package`. */
  icon: string
  /** Match NavLink `end` for exact active state. */
  end?: boolean
}

export type SidebarMultiItem = {
  type: 'multi'
  id: string
  title: string
  /** Tabler Icons class, e.g. `ti ti-layout-dashboard`. */
  icon: string
  children: SidebarSubItem[]
}

export type SidebarMenuEntry = SidebarHeading | SidebarSingleItem | SidebarMultiItem

/** Sidebar nav for MasterLayout — mirrors protected app routes. */
export const SIDEBAR_MENU: SidebarMenuEntry[] = [
  { type: 'heading', title: 'Overview' },
  {
    type: 'single',
    id: 'dashboard',
    title: 'Dashboard',
    link: ROUTES.DASHBOARD,
    icon: 'ti ti-layout-dashboard',
    end: true,
  },
  {
    type: 'multi',
    id: 'analytics',
    title: 'Analytics',
    icon: 'ti ti-chart-bar',
    children: [
      { title: 'Overview', link: ROUTES.ANALYTICS, icon: 'ti ti-chart-dots', end: true },
      { title: 'Call Analytics', link: ROUTES.ANALYTICS_CALLS, icon: 'ti ti-phone-call' },
      { title: 'Agent Performance', link: ROUTES.ANALYTICS_AGENTS, icon: 'ti ti-robot' },
      { title: 'Campaign Reports', link: ROUTES.ANALYTICS_CAMPAIGNS, icon: 'ti ti-report-analytics' },
      { title: 'Cost Analysis', link: ROUTES.ANALYTICS_COSTS, icon: 'ti ti-currency-dollar' },
    ],
  },

  { type: 'heading', title: 'AI Calling' },
  {
    type: 'multi',
    id: 'ai-agents',
    title: 'AI Agents',
    icon: 'ti ti-robot',
    children: [
      { title: 'All Agents', link: ROUTES.AGENTS, icon: 'ti ti-list', end: true },
      { title: 'Create Agent', link: ROUTES.AGENT_CREATE, icon: 'ti ti-plus' },
      { title: 'Agent Templates', link: ROUTES.AGENT_TEMPLATES, icon: 'ti ti-template' },
      { title: 'Voice Library', link: ROUTES.AGENT_VOICES, icon: 'ti ti-microphone' },
      { title: 'Prompt Library', link: ROUTES.AGENT_PROMPTS, icon: 'ti ti-message-chatbot' },
    ],
  },
  {
    type: 'multi',
    id: 'calls',
    title: 'Calls',
    icon: 'ti ti-phone',
    children: [
      { title: 'All Calls', link: ROUTES.CALLS, icon: 'ti ti-list', end: true },
      { title: 'Live Calls', link: ROUTES.CALLS_LIVE, icon: 'ti ti-broadcast' },
      { title: 'Recordings', link: ROUTES.CALLS_RECORDINGS, icon: 'ti ti-player-record' },
      { title: 'Transcripts', link: ROUTES.CALLS_TRANSCRIPTS, icon: 'ti ti-file-text' },
      { title: 'Call Outcomes', link: ROUTES.CALLS_OUTCOMES, icon: 'ti ti-flag' },
    ],
  },
  {
    type: 'multi',
    id: 'campaigns',
    title: 'Campaigns',
    icon: 'ti ti-megaphone',
    children: [
      { title: 'All Campaigns', link: ROUTES.CAMPAIGNS, icon: 'ti ti-list', end: true },
      { title: 'Create Campaign', link: ROUTES.CAMPAIGN_CREATE, icon: 'ti ti-plus' },
      { title: 'Active Campaigns', link: ROUTES.CAMPAIGNS_ACTIVE, icon: 'ti ti-player-play' },
      { title: 'Scheduled', link: ROUTES.CAMPAIGNS_SCHEDULED, icon: 'ti ti-calendar-event' },
      { title: 'Reports', link: ROUTES.CAMPAIGNS_REPORTS, icon: 'ti ti-report' },
    ],
  },

  { type: 'heading', title: 'CRM' },
  {
    type: 'multi',
    id: 'contacts',
    title: 'Contacts',
    icon: 'ti ti-address-book',
    children: [
      { title: 'All Contacts', link: ROUTES.CONTACTS, icon: 'ti ti-users', end: true },
      { title: 'Leads', link: ROUTES.CONTACTS_LEADS, icon: 'ti ti-user-star' },
      { title: 'Contact Lists', link: ROUTES.CONTACTS_LISTS, icon: 'ti ti-list-details' },
      { title: 'Tags', link: ROUTES.CONTACTS_TAGS, icon: 'ti ti-tags' },
      { title: 'Import', link: ROUTES.CONTACTS_IMPORT, icon: 'ti ti-file-import' },
      { title: 'Export', link: ROUTES.CONTACTS_EXPORT, icon: 'ti ti-file-export' },
    ],
  },

  { type: 'heading', title: 'AI & Knowledge' },
  {
    type: 'multi',
    id: 'knowledge-base',
    title: 'Knowledge Base',
    icon: 'ti ti-brain',
    children: [
      { title: 'Knowledge Bases', link: ROUTES.KNOWLEDGE, icon: 'ti ti-books', end: true },
      { title: 'Documents', link: ROUTES.KNOWLEDGE_DOCUMENTS, icon: 'ti ti-file' },
      { title: 'FAQs', link: ROUTES.KNOWLEDGE_FAQS, icon: 'ti ti-help' },
      { title: 'Websites', link: ROUTES.KNOWLEDGE_WEBSITES, icon: 'ti ti-world' },
      { title: 'AI Insights', link: ROUTES.KNOWLEDGE_INSIGHTS, icon: 'ti ti-bulb' },
    ],
  },

  { type: 'heading', title: 'Telephony' },
  {
    type: 'multi',
    id: 'phone-system',
    title: 'Phone System',
    icon: 'ti ti-phone-calling',
    children: [
      { title: 'Phone Numbers', link: ROUTES.PHONE_NUMBERS, icon: 'ti ti-dialpad' },
      { title: 'Buy Numbers', link: ROUTES.PHONE_BUY, icon: 'ti ti-shopping-cart' },
      { title: 'SIP Connections', link: ROUTES.PHONE_SIP, icon: 'ti ti-network' },
      { title: 'Call Routing', link: ROUTES.PHONE_ROUTING, icon: 'ti ti-arrows-split' },
      { title: 'Business Hours', link: ROUTES.PHONE_HOURS, icon: 'ti ti-clock' },
      { title: 'Caller ID', link: ROUTES.PHONE_CALLER_ID, icon: 'ti ti-id' },
    ],
  },

  { type: 'heading', title: 'Automation' },
  {
    type: 'multi',
    id: 'automation',
    title: 'Automation',
    icon: 'ti ti-settings-automation',
    children: [
      { title: 'Workflows', link: ROUTES.WORKFLOWS, icon: 'ti ti-git-branch' },
      { title: 'Automations', link: ROUTES.AUTOMATIONS, icon: 'ti ti-bolt' },
      { title: 'Scheduled Calls', link: ROUTES.AUTOMATION_SCHEDULED, icon: 'ti ti-calendar-time' },
      { title: 'Follow-ups', link: ROUTES.AUTOMATION_FOLLOWUPS, icon: 'ti ti-mail-forward' },
      { title: 'Triggers', link: ROUTES.AUTOMATION_TRIGGERS, icon: 'ti ti-click' },
    ],
  },

  { type: 'heading', title: 'Integrations' },
  {
    type: 'multi',
    id: 'integrations',
    title: 'Integrations',
    icon: 'ti ti-puzzle',
    children: [
      { title: 'App Marketplace', link: ROUTES.INTEGRATIONS, icon: 'ti ti-apps', end: true },
      { title: 'CRM', link: ROUTES.INTEGRATIONS_CRM, icon: 'ti ti-briefcase' },
      { title: 'Calendar', link: ROUTES.INTEGRATIONS_CALENDAR, icon: 'ti ti-calendar' },
      { title: 'Telephony', link: ROUTES.INTEGRATIONS_TELEPHONY, icon: 'ti ti-phone' },
      { title: 'Webhooks', link: ROUTES.INTEGRATIONS_WEBHOOKS, icon: 'ti ti-link' },
      { title: 'API Keys', link: ROUTES.INTEGRATIONS_API_KEYS, icon: 'ti ti-key' },
    ],
  },

  { type: 'heading', title: 'Workspace' },
  {
    type: 'multi',
    id: 'team',
    title: 'Team',
    icon: 'ti ti-users-group',
    children: [
      { title: 'Members', link: ROUTES.TEAM_MEMBERS, icon: 'ti ti-user' },
      { title: 'Roles', link: ROUTES.TEAM_ROLES, icon: 'ti ti-shield' },
      { title: 'Invitations', link: ROUTES.TEAM_INVITATIONS, icon: 'ti ti-mail' },
      { title: 'Activity', link: ROUTES.TEAM_ACTIVITY, icon: 'ti ti-activity' },
    ],
  },
  {
    type: 'multi',
    id: 'billing',
    title: 'Billing',
    icon: 'ti ti-credit-card',
    children: [
      { title: 'Overview', link: ROUTES.BILLING, icon: 'ti ti-chart-pie', end: true },
      { title: 'Plans', link: ROUTES.BILLING_PLANS, icon: 'ti ti-packages' },
      { title: 'Usage', link: ROUTES.BILLING_USAGE, icon: 'ti ti-chart-area-line' },
      { title: 'Invoices', link: ROUTES.BILLING_INVOICES, icon: 'ti ti-file-invoice' },
      { title: 'Payment Methods', link: ROUTES.BILLING_PAYMENT_METHODS, icon: 'ti ti-wallet' },
    ],
  },

  { type: 'heading', title: 'System' },
  {
    type: 'multi',
    id: 'settings',
    title: 'Settings',
    icon: 'ti ti-settings',
    children: [
      { title: 'General', link: ROUTES.SETTINGS, icon: 'ti ti-adjustments', end: true },
      { title: 'Notifications', link: ROUTES.SETTINGS_NOTIFICATIONS, icon: 'ti ti-bell' },
      { title: 'Security', link: ROUTES.SETTINGS_SECURITY, icon: 'ti ti-lock' },
      { title: 'Audit Logs', link: ROUTES.SETTINGS_AUDIT_LOGS, icon: 'ti ti-history' },
      { title: 'Developer', link: ROUTES.SETTINGS_DEVELOPER, icon: 'ti ti-code' },
    ],
  },
]

export function getSidebarMenu(): SidebarMenuEntry[] {
  return SIDEBAR_MENU
}

export function isPathUnderMenu(pathname: string, item: SidebarMultiItem): boolean {
  return item.children.some((child) =>
    child.end ? pathname === child.link : pathname === child.link || pathname.startsWith(`${child.link}/`),
  )
}

/** Filter sidebar entries by title (keeps matching group headings). */
export function filterSidebarMenu(menu: SidebarMenuEntry[], query: string): SidebarMenuEntry[] {
  const q = query.trim().toLowerCase()
  if (!q) return menu

  const result: SidebarMenuEntry[] = []
  let pendingHeading: SidebarHeading | null = null

  for (const entry of menu) {
    if (entry.type === 'heading') {
      pendingHeading = entry
      continue
    }

    if (entry.type === 'single') {
      if (!entry.title.toLowerCase().includes(q)) continue
      if (pendingHeading) {
        result.push(pendingHeading)
        pendingHeading = null
      }
      result.push(entry)
      continue
    }

    const titleMatch = entry.title.toLowerCase().includes(q)
    const children = titleMatch
      ? entry.children
      : entry.children.filter((child) => child.title.toLowerCase().includes(q))

    if (!titleMatch && children.length === 0) continue

    if (pendingHeading) {
      result.push(pendingHeading)
      pendingHeading = null
    }
    result.push({ ...entry, children })
  }

  return result
}
