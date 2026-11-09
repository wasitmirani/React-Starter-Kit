import type { Workflow, WorkflowExecution } from '@/types/automation.types'
import type {
  Call,
  ChannelAccount,
  EmailSender,
  IvrMenu,
  LiveChatWidget,
  PhoneNumber,
  SenderDomain,
} from '@/types/channel.types'
import type {
  Activity,
  Company,
  Contact,
  ContactAttribute,
  ContactList,
  Deal,
  ImportJob,
  Pipeline,
  Segment,
  Task,
} from '@/types/crm.types'
import type { CannedReply, Conversation, ConversationMessage } from '@/types/inbox.types'
import type { BrandKit, Campaign, MessageLog, Template } from '@/types/messaging.types'
import type { AppNotification, Integration, Invoice, SignupForm, WebhookDelivery, WebhookEndpoint } from '@/types/platform.types'
import { MockCollection } from './collection'
import * as seed from './seed'
import { seedRuns, withVersions } from './workflow-seed'

const contacts = new MockCollection<Contact>('contacts', {
  searchFields: ['firstName', 'lastName', 'email', 'phone', 'companyName'],
  seed: seed.seedContacts,
})

const contactRows = () => contacts.rows()

// Inbox seeds produce two related collections; build them together once per workspace.
let conversationSeed: ReturnType<typeof seed.seedConversations> | null = null
const inboxSeed = () => (conversationSeed ??= seed.seedConversations(contactRows()))

const workflows = new MockCollection<Workflow>('workflows', { searchFields: ['name', 'description'], defaultSort: 'updatedAt', seed: () => withVersions(seed.seedWorkflows()) })

/** All mock collections. Only `src/api` may import this. */
export const db = {
  contacts,
  lists: new MockCollection<ContactList>('lists', { searchFields: ['name', 'folder'], seed: seed.seedLists }),
  segments: new MockCollection<Segment>('segments', { searchFields: ['name', 'description'], seed: seed.seedSegments }),
  attributes: new MockCollection<ContactAttribute>('attributes', { searchFields: ['key', 'label'], defaultSort: 'createdAt', seed: seed.seedAttributes }),
  activities: new MockCollection<Activity>('activities', { searchFields: ['title'], defaultSort: 'at', seed: () => seed.seedActivities(contactRows()) }),
  imports: new MockCollection<ImportJob>('imports', { searchFields: ['fileName'], seed: () => [] }),
  companies: new MockCollection<Company>('companies', { searchFields: ['name', 'domain', 'industry'], seed: seed.seedCompanies }),
  pipelines: new MockCollection<Pipeline>('pipelines', { searchFields: ['name'], seed: seed.seedPipelines }),
  deals: new MockCollection<Deal>('deals', { searchFields: ['title', 'companyName', 'contactName'], seed: () => seed.seedDeals(contactRows()) }),
  tasks: new MockCollection<Task>('tasks', { searchFields: ['title', 'assigneeName'], defaultSort: 'dueAt', seed: () => seed.seedTasks(contactRows()) }),
  campaigns: new MockCollection<Campaign>('campaigns', { searchFields: ['name', 'subject'], seed: seed.seedCampaigns }),
  templates: new MockCollection<Template>('templates', { searchFields: ['name', 'subject', 'body'], defaultSort: 'updatedAt', seed: seed.seedTemplates }),
  brandKit: new MockCollection<BrandKit>('brand-kit', { searchFields: [], seed: seed.seedBrandKit }),
  messages: new MockCollection<MessageLog>('messages', { searchFields: ['to', 'from', 'contactName', 'subject', 'preview'], seed: () => seed.seedMessages(contactRows()) }),
  conversations: new MockCollection<Conversation>('conversations', { searchFields: ['contactName', 'contactHandle', 'subject', 'lastMessagePreview'], defaultSort: 'lastMessageAt', seed: () => inboxSeed().conversations }),
  conversationMessages: new MockCollection<ConversationMessage>('conversation-messages', { searchFields: ['body'], defaultSort: 'at', seed: () => inboxSeed().messages }),
  cannedReplies: new MockCollection<CannedReply>('canned-replies', { searchFields: ['shortcut', 'title', 'body'], seed: seed.seedCannedReplies }),
  workflows,
  executions: new MockCollection<WorkflowExecution>('executions', { searchFields: ['contactName'], defaultSort: 'startedAt', seed: () => seedRuns(workflows.rows(), contactRows()) }),
  channelAccounts: new MockCollection<ChannelAccount>('channel-accounts', { searchFields: ['name', 'identifier', 'provider'], seed: seed.seedChannelAccounts }),
  domains: new MockCollection<SenderDomain>('domains', { searchFields: ['domain'], seed: seed.seedDomains }),
  senders: new MockCollection<EmailSender>('senders', { searchFields: ['name', 'email'], seed: seed.seedSenders }),
  numbers: new MockCollection<PhoneNumber>('numbers', { searchFields: ['number', 'label'], seed: seed.seedNumbers }),
  calls: new MockCollection<Call>('calls', { searchFields: ['from', 'to', 'contactName', 'agentName'], defaultSort: 'startedAt', seed: () => seed.seedCalls(contactRows()) }),
  ivr: new MockCollection<IvrMenu>('ivr', { searchFields: ['name'], seed: seed.seedIvr }),
  widgets: new MockCollection<LiveChatWidget>('widgets', { searchFields: ['name', 'domain'], seed: seed.seedWidgets }),
  forms: new MockCollection<SignupForm>('forms', { searchFields: ['name', 'title'], defaultSort: 'updatedAt', seed: seed.seedForms }),
  webhooks: new MockCollection<WebhookEndpoint>('webhooks', { searchFields: ['url', 'description'], seed: seed.seedWebhooks }),
  deliveries: new MockCollection<WebhookDelivery>('webhook-deliveries', { searchFields: ['event'], seed: seed.seedDeliveries }),
  invoices: new MockCollection<Invoice>('invoices', { searchFields: ['number'], defaultSort: 'periodEnd', seed: seed.seedInvoices }),
  notifications: new MockCollection<AppNotification>('notifications', { searchFields: ['title', 'body'], seed: seed.seedNotifications }),
  integrations: new MockCollection<Integration>('integrations', { searchFields: ['app', 'account'], seed: seed.seedIntegrations }),
}
