import type { ComponentType } from 'react'
import { Navigate, createBrowserRouter, type RouteObject } from 'react-router-dom'
import { ROUTES } from '@/constants/routes.constants'
import { MainLayout } from '@/layouts/MainLayout'
import { AuthLayout } from '@/layouts/AuthLayout'
import { MasterLayout } from '@/layouts/MasterLayout'
import { RequireAuth, RequirePermission } from '@/middleware'
import {
  LoginPage,
  RegisterPage,
  ForgotPasswordPage,
  ResetPasswordPage,
  VerifyEmailPage,
  AcceptInvitationPage,
  NotFoundPage,
} from '@/pages'

const path = (route: string) => route.slice(1)

/** Code-split route: the page module loads the first time it is visited. */
function lazyPage(route: string, load: () => Promise<{ Component: ComponentType }>): RouteObject {
  return { path: path(route), lazy: load }
}

const app: RouteObject[] = [
  lazyPage(ROUTES.DASHBOARD, () => import('@/pages/dashboard/DashboardPage').then((m) => ({ Component: m.DashboardPage }))),
  lazyPage(ROUTES.ANALYTICS, () => import('@/pages/analytics/AnalyticsPage').then((m) => ({ Component: m.AnalyticsPage }))),
  lazyPage(ROUTES.INBOX, () => import('@/pages/inbox/InboxPage').then((m) => ({ Component: m.InboxPage }))),

  lazyPage(ROUTES.CONTACTS, () => import('@/pages/contacts/ContactsPage').then((m) => ({ Component: m.ContactsPage }))),
  lazyPage(ROUTES.CONTACT_IMPORT, () => import('@/pages/contacts/ContactImportPage').then((m) => ({ Component: m.ContactImportPage }))),
  lazyPage(ROUTES.CONTACT, () => import('@/pages/contacts/ContactDetailPage').then((m) => ({ Component: m.ContactDetailPage }))),
  lazyPage(ROUTES.LISTS, () => import('@/pages/contacts/ListsPage').then((m) => ({ Component: m.ListsPage }))),
  lazyPage(ROUTES.SEGMENTS, () => import('@/pages/contacts/SegmentsPage').then((m) => ({ Component: m.SegmentsPage }))),
  lazyPage(ROUTES.SEGMENT_NEW, () => import('@/pages/contacts/SegmentBuilderPage').then((m) => ({ Component: m.SegmentBuilderPage }))),
  lazyPage(ROUTES.SEGMENT, () => import('@/pages/contacts/SegmentBuilderPage').then((m) => ({ Component: m.SegmentBuilderPage }))),
  lazyPage(ROUTES.ATTRIBUTES, () => import('@/pages/contacts/AttributesPage').then((m) => ({ Component: m.AttributesPage }))),

  lazyPage(ROUTES.DEALS, () => import('@/pages/sales/DealsPage').then((m) => ({ Component: m.DealsPage }))),
  lazyPage(ROUTES.COMPANIES, () => import('@/pages/sales/CompaniesPage').then((m) => ({ Component: m.CompaniesPage }))),
  lazyPage(ROUTES.TASKS, () => import('@/pages/sales/TasksPage').then((m) => ({ Component: m.TasksPage }))),

  lazyPage(ROUTES.CAMPAIGNS, () => import('@/pages/campaigns/CampaignsPage').then((m) => ({ Component: m.CampaignsPage }))),
  lazyPage(ROUTES.CAMPAIGN_NEW, () => import('@/pages/campaigns/CampaignEditorPage').then((m) => ({ Component: m.CampaignEditorPage }))),
  lazyPage(ROUTES.CAMPAIGN_EDIT, () => import('@/pages/campaigns/CampaignEditorPage').then((m) => ({ Component: m.CampaignEditorPage }))),
  lazyPage(ROUTES.CAMPAIGN, () => import('@/pages/campaigns/CampaignReportPage').then((m) => ({ Component: m.CampaignReportPage }))),
  lazyPage(ROUTES.AUTOMATIONS, () => import('@/pages/automations/AutomationsPage').then((m) => ({ Component: m.AutomationsPage }))),
  lazyPage(ROUTES.AUTOMATION, () => import('@/pages/automations/AutomationBuilderPage').then((m) => ({ Component: m.AutomationBuilderPage }))),
  lazyPage(ROUTES.TEMPLATES, () => import('@/pages/templates/TemplatesPage').then((m) => ({ Component: m.TemplatesPage }))),
  lazyPage(ROUTES.TEMPLATE_BRAND_KIT, () => import('@/pages/templates/BrandKitPage').then((m) => ({ Component: m.BrandKitPage }))),
  lazyPage(ROUTES.TEMPLATE, () => import('@/pages/templates/TemplateEditorPage').then((m) => ({ Component: m.TemplateEditorPage }))),
  lazyPage(ROUTES.FORMS, () => import('@/pages/forms/FormsPage').then((m) => ({ Component: m.FormsPage }))),
  lazyPage(ROUTES.FORM, () => import('@/pages/forms/FormBuilderPage').then((m) => ({ Component: m.FormBuilderPage }))),
  lazyPage(ROUTES.MESSAGES, () => import('@/pages/messages/MessageLogsPage').then((m) => ({ Component: m.MessageLogsPage }))),

  lazyPage(ROUTES.CHANNELS, () => import('@/pages/channels/ChannelsOverviewPage').then((m) => ({ Component: m.ChannelsOverviewPage }))),
  lazyPage(ROUTES.CHANNEL_EMAIL, () => import('@/pages/channels/EmailChannelPage').then((m) => ({ Component: m.EmailChannelPage }))),
  lazyPage(ROUTES.CHANNEL_SMS, () => import('@/pages/channels/MessagingChannelPage').then((m) => ({ Component: () => <m.MessagingChannelPage channel="sms" /> }))),
  lazyPage(ROUTES.CHANNEL_WHATSAPP, () => import('@/pages/channels/MessagingChannelPage').then((m) => ({ Component: () => <m.MessagingChannelPage channel="whatsapp" /> }))),
  lazyPage(ROUTES.CHANNEL_VOICE, () => import('@/pages/channels/VoiceChannelPage').then((m) => ({ Component: m.VoiceChannelPage }))),
  lazyPage(ROUTES.CHANNEL_LIVECHAT, () => import('@/pages/channels/LiveChatChannelPage').then((m) => ({ Component: m.LiveChatChannelPage }))),

  lazyPage(ROUTES.DEVELOPERS_WEBHOOKS, () => import('@/pages/developers/WebhooksPage').then((m) => ({ Component: m.WebhooksPage }))),
  lazyPage(ROUTES.SETTINGS_BILLING, () => import('@/pages/settings/BillingPage').then((m) => ({ Component: m.BillingPage }))),
  lazyPage(ROUTES.SETTINGS_PROFILE, () => import('@/pages/settings/ProfilePage').then((m) => ({ Component: m.ProfilePage }))),

  // Foundation settings: gated by the permissions the backend already enforces.
  { element: <RequirePermission permission="tenant.read" />, children: [lazyPage(ROUTES.SETTINGS_WORKSPACE, () => import('@/pages/settings/WorkspaceSettingsPage').then((m) => ({ Component: m.WorkspaceSettingsPage })))] },
  { element: <RequirePermission permission="members.read" />, children: [lazyPage(ROUTES.SETTINGS_TEAM, () => import('@/pages/settings/TeamPage').then((m) => ({ Component: m.TeamPage })))] },
  { element: <RequirePermission permission="roles.read" />, children: [lazyPage(ROUTES.SETTINGS_ROLES, () => import('@/pages/settings/RolesPage').then((m) => ({ Component: m.RolesPage })))] },
  { element: <RequirePermission permission="api_keys.read" />, children: [lazyPage(ROUTES.SETTINGS_API_KEYS, () => import('@/pages/settings/ApiKeysPage').then((m) => ({ Component: m.ApiKeysPage })))] },
  { element: <RequirePermission permission="audit.read" />, children: [lazyPage(ROUTES.SETTINGS_AUDIT_LOG, () => import('@/pages/settings/AuditLogPage').then((m) => ({ Component: m.AuditLogPage })))] },
]

export const router = createBrowserRouter([
  {
    path: ROUTES.HOME,
    element: <MainLayout />,
    children: [
      { index: true, element: <Navigate to={ROUTES.DASHBOARD} replace /> },
      {
        element: <AuthLayout />,
        children: [
          { path: path(ROUTES.LOGIN), element: <LoginPage /> },
          { path: path(ROUTES.REGISTER), element: <RegisterPage /> },
          { path: path(ROUTES.FORGOT_PASSWORD), element: <ForgotPasswordPage /> },
          { path: path(ROUTES.RESET_PASSWORD), element: <ResetPasswordPage /> },
        ],
      },
      {
        // Reachable whether or not the user is signed in.
        element: <AuthLayout redirectIfAuthenticated={false} />,
        children: [
          { path: path(ROUTES.VERIFY_EMAIL), element: <VerifyEmailPage /> },
          { path: path(ROUTES.ACCEPT_INVITATION), element: <AcceptInvitationPage /> },
        ],
      },
      {
        element: <RequireAuth />,
        children: [{ element: <MasterLayout />, children: app }],
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
