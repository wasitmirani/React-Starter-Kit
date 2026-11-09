import type { Channel } from '@/types/channel.types'
import type { Tone } from '@/types/common.types'

export interface ChannelMeta {
  label: string
  /** Remix icon class. */
  icon: string
  /** Chart / accent colour. */
  color: string
  tone: Tone
  /** Can run outbound campaigns. */
  campaigns: boolean
  /** Appears in the unified inbox. */
  inbox: boolean
  description: string
}

/** Single source of truth for channel names, icons and capabilities. */
export const CHANNELS: Record<Channel, ChannelMeta> = {
  email: {
    label: 'Email',
    icon: 'ri-mail-line',
    color: '#647ee8',
    tone: 'primary',
    campaigns: true,
    inbox: true,
    description: 'Marketing and transactional email over SMTP or Amazon SES.',
  },
  sms: {
    label: 'SMS',
    icon: 'ri-message-2-line',
    color: '#f59e0b',
    tone: 'warning',
    campaigns: true,
    inbox: true,
    description: 'Global SMS with sender IDs, two-way replies and delivery receipts.',
  },
  whatsapp: {
    label: 'WhatsApp',
    icon: 'ri-whatsapp-line',
    color: '#22c55e',
    tone: 'success',
    campaigns: true,
    inbox: true,
    description: 'WhatsApp Business Cloud API: templates, media and service conversations.',
  },
  voice: {
    label: 'Voice',
    icon: 'ri-phone-line',
    color: '#0ea5e9',
    tone: 'info',
    campaigns: false,
    inbox: true,
    description: 'Inbound and outbound calling, IVR menus and call recording.',
  },
  push: {
    label: 'Push',
    icon: 'ri-notification-3-line',
    color: '#a855f7',
    tone: 'secondary',
    campaigns: true,
    inbox: false,
    description: 'Web and mobile push notifications.',
  },
  rcs: {
    label: 'RCS',
    icon: 'ri-chat-smile-2-line',
    color: '#ec4899',
    tone: 'pink',
    campaigns: true,
    inbox: true,
    description: 'Rich business messaging on Android with cards and suggested replies.',
  },
  livechat: {
    label: 'Live chat',
    icon: 'ri-chat-3-line',
    color: '#14b8a6',
    tone: 'info',
    campaigns: false,
    inbox: true,
    description: 'A chat widget for your website that feeds the inbox.',
  },
  instagram: {
    label: 'Instagram',
    icon: 'ri-instagram-line',
    color: '#e1306c',
    tone: 'pink',
    campaigns: false,
    inbox: true,
    description: 'Reply to Instagram direct messages and story mentions.',
  },
  messenger: {
    label: 'Messenger',
    icon: 'ri-messenger-line',
    color: '#0084ff',
    tone: 'primary',
    campaigns: false,
    inbox: true,
    description: 'Facebook Messenger conversations from your Page.',
  },
  telegram: {
    label: 'Telegram',
    icon: 'ri-telegram-line',
    color: '#229ed9',
    tone: 'info',
    campaigns: false,
    inbox: true,
    description: 'Telegram bot conversations.',
  },
}

export const CHANNEL_KEYS = Object.keys(CHANNELS) as Channel[]
export const CAMPAIGN_CHANNELS = CHANNEL_KEYS.filter((c) => CHANNELS[c].campaigns)
export const INBOX_CHANNELS = CHANNEL_KEYS.filter((c) => CHANNELS[c].inbox)
