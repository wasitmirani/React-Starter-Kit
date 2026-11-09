import type { Option, Tone } from '@/types/common.types'
import type { ConsentStatus, LifecycleStage, SegmentOperator } from '@/types/crm.types'

export const LIFECYCLE_STAGES: Option<LifecycleStage>[] = [
  { value: 'subscriber', label: 'Subscriber' },
  { value: 'lead', label: 'Lead' },
  { value: 'qualified', label: 'Qualified' },
  { value: 'customer', label: 'Customer' },
  { value: 'churned', label: 'Churned' },
]

export const CONSENT_OPTIONS: Option<ConsentStatus>[] = [
  { value: 'subscribed', label: 'Subscribed' },
  { value: 'pending', label: 'Pending confirmation' },
  { value: 'unsubscribed', label: 'Unsubscribed' },
  { value: 'none', label: 'No consent' },
]

/** Team members for owner/assignee pickers until the Team API is joined in (mock data). */
export const TEAM_MEMBERS = ['Ayesha Raza', 'Daniel Brooks', 'Mei Lin', 'Carlos Vega', 'Hannah Becker']

/** Fields a segment rule can test. `attributes.*` keys come from the attribute catalogue. */
export const SEGMENT_FIELDS: Option[] = [
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Phone' },
  { value: 'firstName', label: 'First name' },
  { value: 'country', label: 'Country' },
  { value: 'city', label: 'City' },
  { value: 'companyName', label: 'Company' },
  { value: 'lifecycleStage', label: 'Lifecycle stage' },
  { value: 'source', label: 'Source' },
  { value: 'score', label: 'Lead score' },
  { value: 'tags', label: 'Tags' },
  { value: 'consents.email', label: 'Email consent' },
  { value: 'consents.sms', label: 'SMS consent' },
  { value: 'consents.whatsapp', label: 'WhatsApp consent' },
  { value: 'lastActivityAt', label: 'Last activity' },
  { value: 'createdAt', label: 'Created' },
]

export const SEGMENT_OPERATORS: (Option<SegmentOperator> & { needsValue: boolean })[] = [
  { value: 'equals', label: 'is', needsValue: true },
  { value: 'not_equals', label: 'is not', needsValue: true },
  { value: 'contains', label: 'contains', needsValue: true },
  { value: 'not_contains', label: 'does not contain', needsValue: true },
  { value: 'is_set', label: 'is set', needsValue: false },
  { value: 'is_not_set', label: 'is empty', needsValue: false },
  { value: 'greater_than', label: 'is greater than', needsValue: true },
  { value: 'less_than', label: 'is less than', needsValue: true },
  { value: 'in_list', label: 'is any of (comma separated)', needsValue: true },
  { value: 'not_in_list', label: 'is none of (comma separated)', needsValue: true },
  { value: 'has_tag', label: 'has tag', needsValue: true },
  { value: 'within_days', label: 'within the last N days', needsValue: true },
]

/** One colour per lifecycle stage, so the column scans at a glance. */
export const STAGE_TONES: Record<LifecycleStage, Tone> = {
  subscriber: 'secondary',
  lead: 'info',
  qualified: 'primary',
  customer: 'success',
  churned: 'danger',
}
