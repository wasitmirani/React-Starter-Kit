export type PhoneNumberStatus = 'available' | 'assigned' | 'pending' | 'released'

export type PhoneCapability = 'voice' | 'sms' | 'mms' | 'whatsapp' | 'fax'

export type PhoneChannel = 'pstn' | 'sip' | 'whatsapp' | 'browser'

export type PhoneProviderKind =
  | 'opensource'
  | 'cloud'
  | 'byon'
  | 'whatsapp'

export interface PhoneNumber {
  id: string
  number: string
  friendlyName: string
  country: string
  areaCode: string
  provider: string
  providerKind?: PhoneProviderKind
  channel?: PhoneChannel
  status: PhoneNumberStatus
  agentId?: string
  agentName?: string
  inboundEnabled: boolean
  outboundEnabled: boolean
  capabilities?: PhoneCapability[]
  monthlyCost: number
  sipUri?: string
  createdAt: string
}

export interface PhoneNumberSearchResult {
  number: string
  country: string
  areaCode: string
  monthlyCost: number
  capabilities: PhoneCapability[]
  provider?: string
  providerKind?: PhoneProviderKind
  channel?: PhoneChannel
}

export interface PhoneProviderOption {
  id: string
  name: string
  kind: PhoneProviderKind
  license: string
  summary: string
  howToAdd: string[]
  docsUrl: string
  supportsWhatsApp?: boolean
  recommended?: boolean
}

export interface BuyPhoneNumberPayload {
  number: string
  country: string
  areaCode: string
  monthlyCost: number
  capabilities: PhoneCapability[]
  provider: string
  providerKind?: PhoneProviderKind
  channel?: PhoneChannel
  friendlyName?: string
}

export interface WhatsAppCallingConfig {
  enabled: boolean
  provider: 'meta_cloud' | 'twilio' | 'custom_bridge'
  businessAccountId: string
  phoneNumberId: string
  displayName: string
  webhookUrl: string
  status: 'disconnected' | 'pending' | 'connected' | 'error'
  notes: string
}
