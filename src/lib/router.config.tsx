import { lazy, Suspense, type ComponentType, type ReactNode } from 'react'
import { Navigate, createBrowserRouter } from 'react-router-dom'
import { ROUTES } from '@/constants/routes.constants'
import { MainLayout } from '@/layouts/MainLayout'
import { AuthLayout } from '@/layouts/AuthLayout'
import { MasterLayout } from '@/layouts/MasterLayout'
import { RequireAuth } from '@/middleware'
import { ErrorBoundary } from '@/pages/error/ErrorBoundary'
import {
  LoginPage,
  RegisterPage,
  ForgotPasswordPage,
  DashboardHome,
  AnalyticsPage,
  SettingsPage,
  NotFoundPage,
} from '@/pages'

/** Create lazy route elements once at module load — never call `lazy()` inside render. */
function L(factory: () => Promise<{ default: ComponentType }>, section?: string): ReactNode {
  const Comp = lazy(factory)
  return (
    <ErrorBoundary
      fallback={
        <div className="box box-body">
          <h2 className="text-lg font-medium mb-2">Something went wrong</h2>
          <p className="text-textmuted mb-0">
            {section
              ? `Could not load ${section}. Refresh the page or try again later.`
              : 'Could not load this page. Refresh and try again.'}
          </p>
        </div>
      }
    >
      <Suspense fallback={<div className="box box-body">Loading…</div>}>
        <Comp />
      </Suspense>
    </ErrorBoundary>
  )
}

export const router = createBrowserRouter([
  {
    path: ROUTES.HOME,
    element: <MainLayout />,
    children: [
      { index: true, element: <Navigate to={ROUTES.DASHBOARD} replace /> },
      {
        element: <AuthLayout />,
        children: [
          { path: ROUTES.LOGIN.slice(1), element: <LoginPage /> },
          { path: ROUTES.REGISTER.slice(1), element: <RegisterPage /> },
          { path: ROUTES.FORGOT_PASSWORD.slice(1), element: <ForgotPasswordPage /> },
          {
            path: ROUTES.RESET_PASSWORD.slice(1),
            element: L(() =>
              import('@/pages/settings/SettingsPages').then((m) => ({
                default: m.ResetPasswordPage,
              })),
            ),
          },
          {
            path: ROUTES.VERIFY_EMAIL.slice(1),
            element: L(() =>
              import('@/pages/settings/SettingsPages').then((m) => ({
                default: m.VerifyEmailPage,
              })),
            ),
          },
        ],
      },
      {
        element: <RequireAuth />,
        children: [
          {
            path: ROUTES.ONBOARDING.slice(1),
            element: L(() =>
              import('@/pages/settings/SettingsPages').then((m) => ({
                default: m.OnboardingPage,
              })),
            ),
          },
          {
            element: <MasterLayout />,
            children: [
              { path: ROUTES.DASHBOARD.slice(1), element: <DashboardHome /> },
              { path: ROUTES.ANALYTICS.slice(1), element: <AnalyticsPage /> },
              {
                path: ROUTES.ANALYTICS_CALLS.slice(1),
                element: L(() =>
                  import('@/pages/analytics/AnalyticsPages').then((m) => ({
                    default: m.AnalyticsCallsPage,
                  })),
                ),
              },
              {
                path: ROUTES.ANALYTICS_AGENTS.slice(1),
                element: L(() =>
                  import('@/pages/analytics/AnalyticsPages').then((m) => ({
                    default: m.AnalyticsAgentsPage,
                  })),
                ),
              },
              {
                path: ROUTES.ANALYTICS_CAMPAIGNS.slice(1),
                element: L(() =>
                  import('@/pages/analytics/AnalyticsPages').then((m) => ({
                    default: m.AnalyticsCampaignsPage,
                  })),
                ),
              },
              {
                path: ROUTES.ANALYTICS_COSTS.slice(1),
                element: L(() =>
                  import('@/pages/analytics/AnalyticsPages').then((m) => ({
                    default: m.AnalyticsCostsPage,
                  })),
                ),
              },

              // Agents
              {
                path: ROUTES.AGENTS.slice(1),
                element: L(() =>
                  import('@/pages/agents/AgentsPage').then((m) => ({
                    default: m.AgentsPage,
                  })),
                ),
              },
              {
                path: ROUTES.AGENT_CREATE.slice(1),
                element: L(() =>
                  import('@/pages/agents/AgentFormPage').then((m) => ({
                    default: m.CreateAgentPage,
                  })),
                ),
              },
              {
                path: 'agents/:id/edit',
                element: L(() =>
                  import('@/pages/agents/AgentFormPage').then((m) => ({
                    default: m.EditAgentPage,
                  })),
                ),
              },
              {
                path: 'agents/:id',
                element: L(() =>
                  import('@/pages/agents/AgentDetailPage').then((m) => ({
                    default: m.AgentDetailPage,
                  })),
                ),
              },
              {
                path: ROUTES.AGENT_TEMPLATES.slice(1),
                element: L(() =>
                  import('@/pages/agents/AgentCatalogPages').then((m) => ({
                    default: m.AgentTemplatesPage,
                  })),
                ),
              },
              {
                path: ROUTES.AGENT_VOICES.slice(1),
                element: L(() =>
                  import('@/pages/agents/AgentCatalogPages').then((m) => ({
                    default: m.AgentVoicesPage,
                  })),
                ),
              },
              {
                path: ROUTES.AGENT_PROMPTS.slice(1),
                element: L(() =>
                  import('@/pages/agents/AgentCatalogPages').then((m) => ({
                    default: m.AgentPromptsPage,
                  })),
                ),
              },

              // Calls
              {
                path: ROUTES.CALLS.slice(1),
                element: L(() =>
                  import('@/pages/calls/CallsPage').then((m) => ({ default: m.CallsPage })),
                ),
              },
              {
                path: ROUTES.CALLS_LIVE.slice(1),
                element: L(() =>
                  import('@/pages/calls/LiveCallsPage').then((m) => ({
                    default: m.LiveCallsPage,
                  })),
                ),
              },
              {
                path: 'calls/:id',
                element: L(() =>
                  import('@/pages/calls/CallDetailPage').then((m) => ({
                    default: m.CallDetailPage,
                  })),
                ),
              },
              {
                path: ROUTES.CALLS_RECORDINGS.slice(1),
                element: L(() =>
                  import('@/pages/calls/CallExtraPages').then((m) => ({
                    default: m.CallRecordingsPage,
                  })),
                ),
              },
              {
                path: ROUTES.CALLS_TRANSCRIPTS.slice(1),
                element: L(() =>
                  import('@/pages/calls/CallExtraPages').then((m) => ({
                    default: m.CallTranscriptsPage,
                  })),
                ),
              },
              {
                path: ROUTES.CALLS_OUTCOMES.slice(1),
                element: L(() =>
                  import('@/pages/calls/CallExtraPages').then((m) => ({
                    default: m.CallOutcomesPage,
                  })),
                ),
              },

              // Campaigns
              {
                path: ROUTES.CAMPAIGNS.slice(1),
                element: L(() =>
                  import('@/pages/campaigns/CampaignsPage').then((m) => ({
                    default: m.CampaignsPage,
                  })),
                ),
              },
              {
                path: ROUTES.CAMPAIGN_CREATE.slice(1),
                element: L(() =>
                  import('@/pages/campaigns/CreateCampaignPage').then((m) => ({
                    default: m.CreateCampaignPage,
                  })),
                ),
              },
              {
                path: 'campaigns/:id',
                element: L(() =>
                  import('@/pages/campaigns/CampaignDetailPage').then((m) => ({
                    default: m.CampaignDetailPage,
                  })),
                ),
              },
              {
                path: ROUTES.CAMPAIGNS_ACTIVE.slice(1),
                element: L(() =>
                  import('@/pages/calls/CallExtraPages').then((m) => ({
                    default: m.CampaignsActivePage,
                  })),
                ),
              },
              {
                path: ROUTES.CAMPAIGNS_SCHEDULED.slice(1),
                element: L(() =>
                  import('@/pages/calls/CallExtraPages').then((m) => ({
                    default: m.CampaignsScheduledPage,
                  })),
                ),
              },
              {
                path: ROUTES.CAMPAIGNS_REPORTS.slice(1),
                element: L(() =>
                  import('@/pages/calls/CallExtraPages').then((m) => ({
                    default: m.CampaignsReportsPage,
                  })),
                ),
              },

              // Contacts
              {
                path: ROUTES.CONTACTS.slice(1),
                element: L(() =>
                  import('@/pages/contacts/ContactsPage').then((m) => ({
                    default: m.ContactsPage,
                  })),
                ),
              },
              {
                path: ROUTES.CONTACTS_IMPORT.slice(1),
                element: L(() =>
                  import('@/pages/contacts/ContactsImportPage').then((m) => ({
                    default: m.ContactsImportPage,
                  })),
                ),
              },
              {
                path: 'contacts/:id',
                element: L(() =>
                  import('@/pages/contacts/ContactDetailPage').then((m) => ({
                    default: m.ContactDetailPage,
                  })),
                ),
              },
              {
                path: ROUTES.CONTACTS_LEADS.slice(1),
                element: L(() =>
                  import('@/pages/contacts/LeadsCallingPage').then((m) => ({
                    default: m.ContactsLeadsPage,
                  })),
                ),
              },
              {
                path: ROUTES.CONTACTS_LISTS.slice(1),
                element: L(() =>
                  import('@/pages/integrations/ExtraPages').then((m) => ({
                    default: m.ContactsListsPage,
                  })),
                ),
              },
              {
                path: ROUTES.CONTACTS_TAGS.slice(1),
                element: L(() =>
                  import('@/pages/integrations/ExtraPages').then((m) => ({
                    default: m.ContactsTagsPage,
                  })),
                ),
              },
              {
                path: ROUTES.CONTACTS_EXPORT.slice(1),
                element: L(() =>
                  import('@/pages/integrations/ExtraPages').then((m) => ({
                    default: m.ContactsExportPage,
                  })),
                ),
              },

              // Knowledge
              {
                path: ROUTES.KNOWLEDGE.slice(1),
                element: L(() =>
                  import('@/pages/knowledge/KnowledgeListPage').then((m) => ({
                    default: m.KnowledgeListPage,
                  })),
                ),
              },
              {
                path: 'knowledge/:id',
                element: L(() =>
                  import('@/pages/knowledge/KnowledgeDetailPage').then((m) => ({
                    default: m.KnowledgeDetailPage,
                  })),
                ),
              },
              {
                path: ROUTES.KNOWLEDGE_DOCUMENTS.slice(1),
                element: L(() =>
                  import('@/pages/knowledge/KnowledgePages').then((m) => ({
                    default: m.KnowledgeDocumentsPage,
                  })),
                ),
              },
              {
                path: ROUTES.KNOWLEDGE_FAQS.slice(1),
                element: L(() =>
                  import('@/pages/knowledge/KnowledgePages').then((m) => ({
                    default: m.KnowledgeFaqsPage,
                  })),
                ),
              },
              {
                path: ROUTES.KNOWLEDGE_WEBSITES.slice(1),
                element: L(() =>
                  import('@/pages/knowledge/KnowledgePages').then((m) => ({
                    default: m.KnowledgeWebsitesPage,
                  })),
                ),
              },
              {
                path: ROUTES.KNOWLEDGE_INSIGHTS.slice(1),
                element: L(() =>
                  import('@/pages/knowledge/KnowledgePages').then((m) => ({
                    default: m.KnowledgeInsightsPage,
                  })),
                ),
              },

              // Telephony
              {
                path: ROUTES.PHONE_NUMBERS.slice(1),
                element: L(() =>
                  import('@/pages/telephony/PhoneNumbersPage').then((m) => ({
                    default: m.PhoneNumbersPage,
                  })),
                ),
              },
              {
                path: ROUTES.PHONE_BUY.slice(1),
                element: L(() =>
                  import('@/pages/telephony/PhoneBuyPage').then((m) => ({
                    default: m.PhoneBuyPage,
                  })),
                ),
              },
              {
                path: ROUTES.PHONE_PROVIDERS.slice(1),
                element: L(() =>
                  import('@/pages/telephony/PhoneProvidersPage').then((m) => ({
                    default: m.PhoneProvidersPage,
                  })),
                ),
              },
              {
                path: ROUTES.PHONE_WHATSAPP.slice(1),
                element: L(() =>
                  import('@/pages/telephony/PhoneWhatsAppPage').then((m) => ({
                    default: m.PhoneWhatsAppPage,
                  })),
                ),
              },
              {
                path: ROUTES.PHONE_SIP.slice(1),
                element: L(() =>
                  import('@/pages/telephony/TelephonyExtraPages').then((m) => ({
                    default: m.PhoneSipPage,
                  })),
                ),
              },
              {
                path: ROUTES.PHONE_ROUTING.slice(1),
                element: L(() =>
                  import('@/pages/telephony/TelephonyExtraPages').then((m) => ({
                    default: m.PhoneRoutingPage,
                  })),
                ),
              },
              {
                path: ROUTES.PHONE_HOURS.slice(1),
                element: L(() =>
                  import('@/pages/telephony/TelephonyExtraPages').then((m) => ({
                    default: m.PhoneHoursPage,
                  })),
                ),
              },
              {
                path: ROUTES.PHONE_CALLER_ID.slice(1),
                element: L(() =>
                  import('@/pages/telephony/TelephonyExtraPages').then((m) => ({
                    default: m.PhoneCallerIdPage,
                  })),
                ),
              },

              // Automation
              {
                path: ROUTES.WORKFLOWS.slice(1),
                element: L(() =>
                  import('@/pages/integrations/ExtraPages').then((m) => ({
                    default: m.WorkflowsPage,
                  })),
                ),
              },
              {
                path: ROUTES.AUTOMATIONS.slice(1),
                element: L(() =>
                  import('@/pages/integrations/ExtraPages').then((m) => ({
                    default: m.AutomationsPage,
                  })),
                ),
              },
              {
                path: ROUTES.AUTOMATION_SCHEDULED.slice(1),
                element: L(() =>
                  import('@/pages/integrations/ExtraPages').then((m) => ({
                    default: m.AutomationScheduledPage,
                  })),
                ),
              },
              {
                path: ROUTES.AUTOMATION_FOLLOWUPS.slice(1),
                element: L(() =>
                  import('@/pages/integrations/ExtraPages').then((m) => ({
                    default: m.AutomationFollowupsPage,
                  })),
                ),
              },
              {
                path: ROUTES.AUTOMATION_TRIGGERS.slice(1),
                element: L(() =>
                  import('@/pages/integrations/ExtraPages').then((m) => ({
                    default: m.AutomationTriggersPage,
                  })),
                ),
              },

              // Integrations
              {
                path: ROUTES.INTEGRATIONS.slice(1),
                element: L(() =>
                  import('@/pages/integrations/ExtraPages').then((m) => ({
                    default: m.IntegrationsMarketplacePage,
                  })),
                ),
              },
              {
                path: ROUTES.INTEGRATIONS_CRM.slice(1),
                element: L(() =>
                  import('@/pages/integrations/ExtraPages').then((m) => ({
                    default: m.IntegrationsCrmPage,
                  })),
                ),
              },
              {
                path: ROUTES.INTEGRATIONS_CALENDAR.slice(1),
                element: L(() =>
                  import('@/pages/integrations/ExtraPages').then((m) => ({
                    default: m.IntegrationsCalendarPage,
                  })),
                ),
              },
              {
                path: ROUTES.INTEGRATIONS_TELEPHONY.slice(1),
                element: L(() =>
                  import('@/pages/integrations/ExtraPages').then((m) => ({
                    default: m.IntegrationsTelephonyPage,
                  })),
                ),
              },
              {
                path: ROUTES.INTEGRATIONS_WEBHOOKS.slice(1),
                element: L(() =>
                  import('@/pages/integrations/ExtraPages').then((m) => ({
                    default: m.IntegrationsWebhooksPage,
                  })),
                ),
              },
              {
                path: ROUTES.INTEGRATIONS_API_KEYS.slice(1),
                element: L(() =>
                  import('@/pages/integrations/ExtraPages').then((m) => ({
                    default: m.IntegrationsApiKeysPage,
                  })),
                ),
              },

              // Team
              {
                path: ROUTES.TEAM_MEMBERS.slice(1),
                element: L(() =>
                  import('@/pages/team/TeamPages').then((m) => ({
                    default: m.TeamMembersPage,
                  })),
                ),
              },
              {
                path: ROUTES.TEAM_ROLES.slice(1),
                element: L(() =>
                  import('@/pages/team/TeamPages').then((m) => ({
                    default: m.TeamRolesPage,
                  })),
                ),
              },
              {
                path: ROUTES.TEAM_INVITATIONS.slice(1),
                element: L(() =>
                  import('@/pages/team/TeamPages').then((m) => ({
                    default: m.TeamInvitationsPage,
                  })),
                ),
              },
              {
                path: ROUTES.TEAM_ACTIVITY.slice(1),
                element: L(() =>
                  import('@/pages/team/TeamPages').then((m) => ({
                    default: m.TeamActivityPage,
                  })),
                ),
              },

              // Billing
              {
                path: ROUTES.BILLING.slice(1),
                element: L(() =>
                  import('@/pages/billing/BillingPages').then((m) => ({
                    default: m.BillingPage,
                  })),
                ),
              },
              {
                path: ROUTES.BILLING_PLANS.slice(1),
                element: L(() =>
                  import('@/pages/billing/BillingPages').then((m) => ({
                    default: m.BillingPlansPage,
                  })),
                ),
              },
              {
                path: ROUTES.BILLING_USAGE.slice(1),
                element: L(() =>
                  import('@/pages/billing/BillingPages').then((m) => ({
                    default: m.BillingUsagePage,
                  })),
                ),
              },
              {
                path: ROUTES.BILLING_INVOICES.slice(1),
                element: L(() =>
                  import('@/pages/billing/BillingPages').then((m) => ({
                    default: m.BillingInvoicesPage,
                  })),
                ),
              },
              {
                path: ROUTES.BILLING_PAYMENT_METHODS.slice(1),
                element: L(() =>
                  import('@/pages/billing/BillingPages').then((m) => ({
                    default: m.BillingPaymentMethodsPage,
                  })),
                ),
              },

              // Settings
              { path: ROUTES.SETTINGS.slice(1), element: <SettingsPage /> },
              {
                path: ROUTES.SETTINGS_NOTIFICATIONS.slice(1),
                element: L(() =>
                  import('@/pages/settings/SettingsPages').then((m) => ({
                    default: m.SettingsNotificationsPage,
                  })),
                ),
              },
              {
                path: ROUTES.SETTINGS_SECURITY.slice(1),
                element: L(() =>
                  import('@/pages/settings/SettingsPages').then((m) => ({
                    default: m.SettingsSecurityPage,
                  })),
                ),
              },
              {
                path: ROUTES.SETTINGS_AUDIT_LOGS.slice(1),
                element: L(() =>
                  import('@/pages/settings/SettingsPages').then((m) => ({
                    default: m.SettingsAuditLogsPage,
                  })),
                ),
              },
              {
                path: ROUTES.SETTINGS_DEVELOPER.slice(1),
                element: L(() =>
                  import('@/pages/settings/SettingsPages').then((m) => ({
                    default: m.SettingsDeveloperPage,
                  })),
                ),
              },
              {
                path: ROUTES.NOTIFICATIONS.slice(1),
                element: L(() =>
                  import('@/pages/settings/SettingsPages').then((m) => ({
                    default: m.NotificationsPage,
                  })),
                ),
              },
            ],
          },
        ],
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
