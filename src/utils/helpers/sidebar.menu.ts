import { ROUTES } from '@/constants/routes.constants'

export type SidebarSubItem = {
  title: string
  link: string
  /** Match NavLink `end` for exact active state. */
  end?: boolean
  /** Hidden unless the user holds this permission in the current workspace. */
  permission?: string
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
  /** MingCute icon class, e.g. `mgc_inbox_line`. */
  icon: string
  permission?: string
  end?: boolean
}

export type SidebarMultiItem = {
  type: 'multi'
  id: string
  title: string
  icon: string
  children: SidebarSubItem[]
}

export type SidebarMenuEntry = SidebarHeading | SidebarSingleItem | SidebarMultiItem

/**
 * Sidebar navigation. Items a role cannot read are hidden. Product permission keys
 * are only enforced once the server's catalogue knows them (see hooks/useCan.ts).
 */
export const SIDEBAR_MENU: SidebarMenuEntry[] = [
  { type: 'heading', title: 'Engage' },
  { type: 'single', id: 'dashboard', title: 'Dashboard', link: ROUTES.DASHBOARD, icon: 'mgc_dashboard_line' },
  { type: 'single', id: 'inbox', title: 'Inbox', link: ROUTES.INBOX, icon: 'mgc_inbox_line', permission: 'inbox.read' },
  { type: 'single', id: 'analytics', title: 'Analytics', link: ROUTES.ANALYTICS, icon: 'mgc_chart_bar_line' },

  { type: 'heading', title: 'Audience' },
  {
    type: 'multi',
    id: 'contacts',
    title: 'Contacts',
    icon: 'mgc_contacts_line',
    children: [
      { title: 'All contacts', link: ROUTES.CONTACTS, end: true, permission: 'contacts.read' },
      { title: 'Lists', link: ROUTES.LISTS, permission: 'contacts.read' },
      { title: 'Segments', link: ROUTES.SEGMENTS, permission: 'contacts.read' },
      { title: 'Attributes', link: ROUTES.ATTRIBUTES, permission: 'contacts.manage' },
      { title: 'Import', link: ROUTES.CONTACT_IMPORT, permission: 'contacts.import' },
    ],
  },
  {
    type: 'multi',
    id: 'sales',
    title: 'Sales CRM',
    icon: 'mgc_briefcase_line',
    children: [
      { title: 'Deals', link: ROUTES.DEALS, permission: 'deals.read' },
      { title: 'Companies', link: ROUTES.COMPANIES, permission: 'deals.read' },
      { title: 'Tasks', link: ROUTES.TASKS, permission: 'deals.read' },
    ],
  },

  { type: 'heading', title: 'Marketing' },
  { type: 'single', id: 'campaigns', title: 'Campaigns', link: ROUTES.CAMPAIGNS, icon: 'mgc_send_plane_line', permission: 'campaigns.read' },
  { type: 'single', id: 'automations', title: 'Automations', link: ROUTES.AUTOMATIONS, icon: 'mgc_git_branch_line', permission: 'automations.read' },
  { type: 'single', id: 'templates', title: 'Templates', link: ROUTES.TEMPLATES, icon: 'mgc_layout_2_line' },
  { type: 'single', id: 'forms', title: 'Forms & pages', link: ROUTES.FORMS, icon: 'mgc_cursor_text_line' },

  { type: 'heading', title: 'Channels' },
  {
    type: 'multi',
    id: 'channels',
    title: 'Channels',
    icon: 'mgc_plugin_line',
    children: [
      { title: 'Overview', link: ROUTES.CHANNELS, end: true },
      { title: 'Email', link: ROUTES.CHANNEL_EMAIL },
      { title: 'SMS', link: ROUTES.CHANNEL_SMS },
      { title: 'WhatsApp', link: ROUTES.CHANNEL_WHATSAPP },
      { title: 'Voice', link: ROUTES.CHANNEL_VOICE },
      { title: 'Live chat', link: ROUTES.CHANNEL_LIVECHAT },
    ],
  },
  { type: 'single', id: 'messages', title: 'Message logs', link: ROUTES.MESSAGES, icon: 'mgc_message_3_line', permission: 'messages.read' },

  { type: 'heading', title: 'Developers' },
  { type: 'single', id: 'api-keys', title: 'API keys', link: ROUTES.SETTINGS_API_KEYS, icon: 'mgc_code_line', permission: 'api_keys.read' },
  { type: 'single', id: 'webhooks', title: 'Webhooks', link: ROUTES.DEVELOPERS_WEBHOOKS, icon: 'mgc_webhook_line', permission: 'webhooks.manage' },

  { type: 'heading', title: 'Settings' },
  {
    type: 'multi',
    id: 'settings',
    title: 'Workspace',
    icon: 'mgc_settings_3_line',
    children: [
      { title: 'General', link: ROUTES.SETTINGS_WORKSPACE, permission: 'tenant.read' },
      { title: 'Team', link: ROUTES.SETTINGS_TEAM, permission: 'members.read' },
      { title: 'Roles & permissions', link: ROUTES.SETTINGS_ROLES, permission: 'roles.read' },
      { title: 'Billing & usage', link: ROUTES.SETTINGS_BILLING, permission: 'billing.read' },
      { title: 'Audit log', link: ROUTES.SETTINGS_AUDIT_LOG, permission: 'audit.read' },
    ],
  },
  { type: 'single', id: 'profile', title: 'My profile', link: ROUTES.SETTINGS_PROFILE, icon: 'mgc_user_3_line' },
]

/** Menu with entries the user cannot access removed (and headings left empty dropped). */
export function getSidebarMenu(can: (permission: string) => boolean): SidebarMenuEntry[] {
  const allowed = (permission?: string) => !permission || can(permission)
  const visible = SIDEBAR_MENU.flatMap<SidebarMenuEntry>((entry) => {
    if (entry.type === 'single') return allowed(entry.permission) ? [entry] : []
    if (entry.type === 'multi') {
      const children = entry.children.filter((child) => allowed(child.permission))
      return children.length > 0 ? [{ ...entry, children }] : []
    }
    return [entry]
  })
  return visible.filter((entry, i) => entry.type !== 'heading' || (visible[i + 1] && visible[i + 1].type !== 'heading'))
}

export function isPathUnderMenu(pathname: string, item: SidebarMultiItem): boolean {
  return item.children.some((child) =>
    child.end ? pathname === child.link : pathname === child.link || pathname.startsWith(`${child.link}/`),
  )
}

/** Flat list of every reachable page, for the command palette. */
export function flattenMenu(entries: SidebarMenuEntry[]): { title: string; group: string; link: string }[] {
  let group = ''
  return entries.flatMap((entry) => {
    if (entry.type === 'heading') {
      group = entry.title
      return []
    }
    if (entry.type === 'single') return [{ title: entry.title, group, link: entry.link }]
    return entry.children.map((child) => ({ title: child.title, group: entry.title, link: child.link }))
  })
}
