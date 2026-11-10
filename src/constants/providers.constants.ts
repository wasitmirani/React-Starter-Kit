import type { Channel } from '@/types/channel.types'

export interface ProviderSpec {
  provider: string
  fields: { key: string; label: string; secret?: boolean; placeholder?: string; hint?: string; optional?: boolean }[]
  identifier: string
  /** Connected by signing in with the provider (OAuth) instead of a form. */
  oauth?: 'gmail' | 'outlook'
  /** One line under the provider switch. */
  note?: string
}

/** Connection forms per channel. Secrets go to the server's secret store and are never shown again. */
export const PROVIDERS: Partial<Record<Channel, ProviderSpec[]>> = {
  email: [
    { provider: 'Amazon SES', identifier: 'region', note: 'Bulk sending at scale. Use an IAM user that can only send email (ses:SendEmail, ses:GetAccount).', fields: [{ key: 'region', label: 'AWS region', placeholder: 'eu-west-1' }, { key: 'accessKeyId', label: 'Access key ID' }, { key: 'secretAccessKey', label: 'Secret access key', secret: true }, { key: 'configurationSet', label: 'Configuration set', optional: true, hint: 'Optional. Needed for bounce and complaint events.' }] },
    { provider: 'SMTP', identifier: 'host', note: 'Any SMTP service: Postmark, SendGrid, Mailgun, Brevo or your own server.', fields: [{ key: 'host', label: 'Host', placeholder: 'smtp.example.com' }, { key: 'port', label: 'Port', placeholder: '587', hint: '587 uses STARTTLS, 465 uses TLS.' }, { key: 'username', label: 'Username', optional: true }, { key: 'password', label: 'Password', secret: true, optional: true }] },
    { provider: 'Gmail', identifier: 'email', oauth: 'gmail', note: 'Send from a Gmail or Google Workspace mailbox. Google limits volume (about 500 a day for Gmail, 2,000 for Workspace), so use it for low-volume and transactional mail.', fields: [] },
    { provider: 'Outlook', identifier: 'email', oauth: 'outlook', note: 'Send from an Outlook.com or Microsoft 365 mailbox. Microsoft limits volume (about 10,000 recipients a day), so use it for low-volume and transactional mail.', fields: [] },
  ],
  sms: [{ provider: 'Twilio', identifier: 'from', fields: [{ key: 'accountSid', label: 'Account SID', placeholder: 'AC…' }, { key: 'authToken', label: 'Auth token', secret: true }, { key: 'from', label: 'Sender (number or alphanumeric ID)', placeholder: '+14155550100' }, { key: 'messagingServiceSid', label: 'Messaging service SID', optional: true, hint: 'Optional. Enables number pools.' }] }],
  whatsapp: [{ provider: 'Meta Cloud API', identifier: 'phoneNumber', fields: [{ key: 'wabaId', label: 'WhatsApp Business Account ID' }, { key: 'phoneNumberId', label: 'Phone number ID' }, { key: 'phoneNumber', label: 'Display phone number', placeholder: '+14155550199' }, { key: 'accessToken', label: 'Permanent access token', secret: true }, { key: 'appSecret', label: 'App secret', secret: true, hint: 'Used to verify webhook signatures.' }] }],
  voice: [{ provider: 'Twilio', identifier: 'number', fields: [{ key: 'accountSid', label: 'Account SID' }, { key: 'authToken', label: 'Auth token', secret: true }, { key: 'number', label: 'Voice number', placeholder: '+14155550100' }] }],
  instagram: [{ provider: 'Meta', identifier: 'handle', fields: [{ key: 'handle', label: 'Instagram account', placeholder: '@yourbrand' }, { key: 'pageToken', label: 'Page access token', secret: true }] }],
  messenger: [{ provider: 'Meta', identifier: 'page', fields: [{ key: 'page', label: 'Facebook Page' }, { key: 'pageToken', label: 'Page access token', secret: true }] }],
  telegram: [{ provider: 'Telegram', identifier: 'bot', fields: [{ key: 'bot', label: 'Bot username', placeholder: '@your_bot' }, { key: 'botToken', label: 'Bot token', secret: true }] }],
  push: [{ provider: 'Firebase / APNs', identifier: 'app', fields: [{ key: 'app', label: 'App name' }, { key: 'fcmServerKey', label: 'FCM service account JSON', secret: true }, { key: 'vapidPublicKey', label: 'Web push VAPID public key' }] }],
  rcs: [{ provider: 'Google RBM', identifier: 'agent', fields: [{ key: 'agent', label: 'RBM agent ID' }, { key: 'serviceAccount', label: 'Service account JSON', secret: true }] }],
}
