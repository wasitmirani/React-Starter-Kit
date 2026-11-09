import type { Permission } from '@/types/workspace.types'

/** Workspace-foundation permissions (served by the backend since Phase 1). */
export const FOUNDATION_PERMISSIONS: Permission[] = [
  { key: 'tenant.read', category: 'workspace', description: 'View workspace details and settings' },
  { key: 'tenant.update', category: 'workspace', description: 'Update workspace details and settings' },
  { key: 'members.read', category: 'team', description: 'View team members and invitations' },
  { key: 'members.manage', category: 'team', description: 'Invite, update and remove team members' },
  { key: 'roles.read', category: 'team', description: 'View roles and permissions' },
  { key: 'roles.manage', category: 'team', description: 'Create, update and delete custom roles' },
  { key: 'api_keys.read', category: 'developer', description: 'View API keys' },
  { key: 'api_keys.manage', category: 'developer', description: 'Create, rotate and revoke API keys' },
  { key: 'audit.read', category: 'security', description: 'View the audit log' },
]

/** Product permissions, one set per module in docs/API-CONTRACT.md. The backend adds them to its catalogue. */
export const PRODUCT_PERMISSIONS: Permission[] = [
  { key: 'contacts.read', category: 'contacts', description: 'View contacts, lists and segments' },
  { key: 'contacts.manage', category: 'contacts', description: 'Create, edit and delete contacts, lists and segments' },
  { key: 'contacts.import', category: 'contacts', description: 'Import contacts from files' },
  { key: 'contacts.export', category: 'contacts', description: 'Export contacts and their data' },
  { key: 'deals.read', category: 'sales', description: 'View deals, pipelines and tasks' },
  { key: 'deals.manage', category: 'sales', description: 'Create, move and close deals' },
  { key: 'inbox.read', category: 'inbox', description: 'Read conversations' },
  { key: 'inbox.reply', category: 'inbox', description: 'Reply to conversations' },
  { key: 'inbox.assign', category: 'inbox', description: 'Assign and close conversations' },
  { key: 'campaigns.read', category: 'campaigns', description: 'View campaigns and their reports' },
  { key: 'campaigns.manage', category: 'campaigns', description: 'Create and edit campaign drafts' },
  { key: 'campaigns.send', category: 'campaigns', description: 'Launch, schedule and stop campaigns' },
  { key: 'automations.read', category: 'automations', description: 'View automations and their runs' },
  { key: 'automations.manage', category: 'automations', description: 'Create and edit automation drafts' },
  { key: 'automations.publish', category: 'automations', description: 'Publish, pause and resume automations' },
  { key: 'templates.manage', category: 'content', description: 'Create, edit and submit templates and the brand kit' },
  { key: 'messages.read', category: 'content', description: 'View message logs and delivery events' },
  { key: 'channels.manage', category: 'channels', description: 'Connect channels, numbers, domains and senders' },
  { key: 'voice.read', category: 'channels', description: 'View calls and recordings' },
  { key: 'voice.manage', category: 'channels', description: 'Manage numbers, IVR menus and call routing' },
  { key: 'integrations.manage', category: 'developer', description: 'Connect and disconnect third-party apps' },
  { key: 'webhooks.manage', category: 'developer', description: 'Manage webhook endpoints and deliveries' },
  { key: 'billing.read', category: 'billing', description: 'View plan, usage and invoices' },
  { key: 'billing.manage', category: 'billing', description: 'Change plan and payment details' },
]

export const ALL_PERMISSIONS: Permission[] = [...PRODUCT_PERMISSIONS, ...FOUNDATION_PERMISSIONS]

export const PERMISSION_CATEGORIES: Record<string, { label: string; icon: string; description: string }> = {
  contacts: { label: 'Contacts', icon: 'ri-contacts-book-2-line', description: 'Audience, lists, segments and consent' },
  sales: { label: 'Sales CRM', icon: 'ri-briefcase-4-line', description: 'Deals, pipelines and tasks' },
  inbox: { label: 'Inbox', icon: 'ri-inbox-line', description: 'Conversations across channels' },
  campaigns: { label: 'Campaigns', icon: 'ri-send-plane-line', description: 'Bulk email, SMS and WhatsApp' },
  automations: { label: 'Automations', icon: 'ri-git-branch-line', description: 'Journeys and workflow runs' },
  content: { label: 'Content', icon: 'ri-layout-2-line', description: 'Templates, brand kit and message logs' },
  channels: { label: 'Channels', icon: 'ri-plug-line', description: 'Email, SMS, WhatsApp, voice and live chat' },
  developer: { label: 'Developers', icon: 'ri-code-s-slash-line', description: 'API keys, webhooks and integrations' },
  billing: { label: 'Billing', icon: 'ri-bank-card-line', description: 'Plan, usage and invoices' },
  workspace: { label: 'Workspace', icon: 'ri-building-line', description: 'Workspace settings' },
  team: { label: 'Team & roles', icon: 'ri-team-line', description: 'Members, invitations and roles' },
  security: { label: 'Security', icon: 'ri-shield-keyhole-line', description: 'Audit log' },
}

export const CATEGORY_ORDER = Object.keys(PERMISSION_CATEGORIES)

/** Actions with customer-facing or irreversible effects, flagged in the role editor. */
export const SENSITIVE_PERMISSIONS = new Set(['campaigns.send', 'automations.publish', 'contacts.export', 'contacts.import', 'billing.manage', 'members.manage', 'roles.manage', 'api_keys.manage', 'channels.manage', 'tenant.update'])

const keys = (...prefixes: string[]) => ALL_PERMISSIONS.filter((p) => prefixes.some((x) => p.key === x || p.key.startsWith(`${x}.`))).map((p) => p.key)
const READ_ALL = ALL_PERMISSIONS.filter((p) => p.key.endsWith('.read')).map((p) => p.key)

/** Built-in roles and their permissions. Also offered as starting points for custom roles. */
export const ROLE_PRESETS: { key: string; name: string; description: string; icon: string; permissions: string[] }[] = [
  { key: 'owner', name: 'Owner', description: 'Full access, including ownership and billing', icon: 'ri-vip-crown-2-line', permissions: ALL_PERMISSIONS.map((p) => p.key) },
  { key: 'admin', name: 'Admin', description: 'Manages the workspace, team and integrations', icon: 'ri-shield-user-line', permissions: ALL_PERMISSIONS.map((p) => p.key).filter((k) => k !== 'billing.manage') },
  {
    key: 'marketing_manager',
    name: 'Marketing manager',
    description: 'Campaigns, automations, templates and audiences',
    icon: 'ri-megaphone-line',
    permissions: [...new Set([...keys('contacts', 'campaigns', 'automations', 'templates', 'messages'), 'inbox.read', 'deals.read', 'tenant.read', 'members.read', 'billing.read'])],
  },
  { key: 'sales_rep', name: 'Sales rep', description: 'Deals and contacts, replies to leads', icon: 'ri-briefcase-4-line', permissions: ['contacts.read', 'contacts.manage', 'deals.read', 'deals.manage', 'inbox.read', 'inbox.reply', 'campaigns.read', 'tenant.read', 'members.read'] },
  { key: 'support_agent', name: 'Support agent', description: 'Works the inbox and looks up contacts', icon: 'ri-customer-service-2-line', permissions: ['inbox.read', 'inbox.reply', 'inbox.assign', 'contacts.read', 'messages.read', 'voice.read', 'tenant.read', 'members.read'] },
  { key: 'developer', name: 'Developer', description: 'API keys, webhooks, integrations and channels', icon: 'ri-code-box-line', permissions: [...new Set([...keys('api_keys', 'webhooks', 'integrations', 'channels'), 'messages.read', 'automations.read', 'tenant.read', 'members.read', 'audit.read'])] },
  { key: 'viewer', name: 'Viewer', description: 'Read-only access to everything', icon: 'ri-eye-line', permissions: READ_ALL },
]
