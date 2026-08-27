import { shouldMockModule } from '@/config/env.config'
import { delay, ok } from '@/lib/mock'
import type { ApiResponse } from '@/types/api.types'
import { httpClient } from '@/api/http-client'

export interface TelephonySettings {
  sipDomain: string
  sipUsername: string
  sipPassword: string
  sipTransport: 'udp' | 'tcp' | 'tls'
  defaultCallerId: string
  routingRules: string[]
  businessHours: { day: string; open: string; close: string }[]
}

export interface NotificationPrefs {
  email: boolean
  sms: boolean
  liveCalls: boolean
  whatsapp: boolean
}

let telephony: TelephonySettings = {
  sipDomain: 'sip.livekit.cloud',
  sipUsername: 'trunk_user',
  sipPassword: '',
  sipTransport: 'tls',
  defaultCallerId: '+14155550101',
  routingRules: [
    'Inbound SIP/PSTN → LiveKit room → assigned agent',
    'WhatsApp calling → webhook → LiveKit bridge → agent',
    'After hours → Voicemail / offline message',
  ],
  businessHours: [
    { day: 'Mon', open: '09:00', close: '18:00' },
    { day: 'Tue', open: '09:00', close: '18:00' },
    { day: 'Wed', open: '09:00', close: '18:00' },
    { day: 'Thu', open: '09:00', close: '18:00' },
    { day: 'Fri', open: '09:00', close: '18:00' },
    { day: 'Sat', open: 'Closed', close: 'Closed' },
    { day: 'Sun', open: 'Closed', close: 'Closed' },
  ],
}

let notifications: NotificationPrefs = {
  email: true,
  sms: false,
  liveCalls: true,
  whatsapp: false,
}

export const settingsService = {
  async getTelephony(): Promise<ApiResponse<TelephonySettings>> {
    if (shouldMockModule('settings')) {
      await delay()
      return ok(telephony)
    }
    const res = await httpClient.get<ApiResponse<TelephonySettings>>('/settings/telephony')
    return res.data
  },

  async saveTelephony(
    payload: Partial<TelephonySettings>,
  ): Promise<ApiResponse<TelephonySettings>> {
    if (shouldMockModule('settings')) {
      await delay()
      telephony = { ...telephony, ...payload }
      return ok(telephony, 'Telephony settings saved')
    }
    const res = await httpClient.patch<ApiResponse<TelephonySettings>>(
      '/settings/telephony',
      payload,
    )
    return res.data
  },

  async getNotifications(): Promise<ApiResponse<NotificationPrefs>> {
    if (shouldMockModule('settings')) {
      await delay()
      return ok(notifications)
    }
    const res = await httpClient.get<ApiResponse<NotificationPrefs>>(
      '/settings/notifications',
    )
    return res.data
  },

  async saveNotifications(
    payload: NotificationPrefs,
  ): Promise<ApiResponse<NotificationPrefs>> {
    if (shouldMockModule('settings')) {
      await delay()
      notifications = { ...payload }
      return ok(notifications, 'Preferences saved')
    }
    const res = await httpClient.patch<ApiResponse<NotificationPrefs>>(
      '/settings/notifications',
      payload,
    )
    return res.data
  },
}
