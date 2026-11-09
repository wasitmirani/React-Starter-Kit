import type { Channel } from '@/types/channel.types'

export interface ProviderSpec {
  provider: string
  fields: { key: string; label: string; secret?: boolean; placeholder?: string; hint?: string }[]
  identifier: string
}

/** Connection forms per channel. Secrets go to the server's secret store and are never shown again. */
export const PROVIDERS: Partial<Record<Channel, ProviderSpec[]>> = {
  email: [
    { provider: 'Amazon SES', identifier: 'region', fields: [{ key: 'region', label: 'AWS region', placeholder: 'eu-west-1' }, { key: 'accessKeyId', label: 'Access key ID' }, { key: 'secretAccessKey', label: 'Secret access key', secret: true }, { key: 'configurationSet', label: 'Configuration set', hint: 'Needed for bounce and complaint events.' }] },
    { provider: 'SMTP', identifier: 'host', fields: [{ key: 'host', label: 'Host', placeholder: 'smtp.example.com' }, { key: 'port', label: 'Port', placeholder: '587' }, { key: 'username', label: 'Username' }, { key: 'password', label: 'Password', secret: true }] },
  ],
  sms: [{ provider: 'Twilio', identifier: 'from', fields: [{ key: 'accountSid', label: 'Account SID', placeholder: 'AC…' }, { key: 'authToken', label: 'Auth token', secret: true }, { key: 'from', label: 'Sender (number or alphanumeric ID)', placeholder: '+14155550100' }, { key: 'messagingServiceSid', label: 'Messaging service SID', hint: 'Optional. Enables number pools.' }] }],
  whatsapp: [{ provider: 'Meta Cloud API', identifier: 'phoneNumber', fields: [{ key: 'wabaId', label: 'WhatsApp Business Account ID' }, { key: 'phoneNumberId', label: 'Phone number ID' }, { key: 'phoneNumber', label: 'Display phone number', placeholder: '+14155550199' }, { key: 'accessToken', label: 'Permanent access token', secret: true }, { key: 'appSecret', label: 'App secret', secret: true, hint: 'Used to verify webhook signatures.' }] }],
  voice: [{ provider: 'Twilio', identifier: 'number', fields: [{ key: 'accountSid', label: 'Account SID' }, { key: 'authToken', label: 'Auth token', secret: true }, { key: 'number', label: 'Voice number', placeholder: '+14155550100' }] }],
  instagram: [{ provider: 'Meta', identifier: 'handle', fields: [{ key: 'handle', label: 'Instagram account', placeholder: '@yourbrand' }, { key: 'pageToken', label: 'Page access token', secret: true }] }],
  messenger: [{ provider: 'Meta', identifier: 'page', fields: [{ key: 'page', label: 'Facebook Page' }, { key: 'pageToken', label: 'Page access token', secret: true }] }],
  telegram: [{ provider: 'Telegram', identifier: 'bot', fields: [{ key: 'bot', label: 'Bot username', placeholder: '@your_bot' }, { key: 'botToken', label: 'Bot token', secret: true }] }],
  push: [{ provider: 'Firebase / APNs', identifier: 'app', fields: [{ key: 'app', label: 'App name' }, { key: 'fcmServerKey', label: 'FCM service account JSON', secret: true }, { key: 'vapidPublicKey', label: 'Web push VAPID public key' }] }],
  rcs: [{ provider: 'Google RBM', identifier: 'agent', fields: [{ key: 'agent', label: 'RBM agent ID' }, { key: 'serviceAccount', label: 'Service account JSON', secret: true }] }],
}
