import { Link } from 'react-router-dom'
import { Avatar } from '@/components/ui/Avatar'
import { ROUTES, to } from '@/constants/routes.constants'
import type { ConsentStatus, Contact } from '@/types/crm.types'
import { fullName } from '@/utils/helpers/contact'


/** Avatar + name + email, linking to the contact. */
export function ContactCell({ contact }: { contact: Contact }) {
  return (
    <div className="d-flex align-items-center gap-3 min-w-0">
      <Avatar name={fullName(contact)} size={34} />
      <div className="min-w-0">
        <Link to={to(ROUTES.CONTACT, { id: contact.id })} className="fw-medium text-reset d-block text-truncate">
          {fullName(contact)}
        </Link>
        <span className="text-muted fs-sm d-block text-truncate">{contact.email ?? contact.phone}</span>
      </div>
    </div>
  )
}

const CONSENT_ICON: Record<ConsentStatus, string> = {
  subscribed: 'text-success',
  pending: 'text-warning',
  unsubscribed: 'text-muted opacity-50',
  none: 'text-muted opacity-25',
}

/** Three icons: email, SMS, WhatsApp consent. Each has a text title for screen readers. */
export function ConsentIcons({ contact }: { contact: Contact }) {
  const items: [keyof Contact['consents'], string, string][] = [
    ['email', 'ri-mail-line', 'Email'],
    ['sms', 'ri-message-2-line', 'SMS'],
    ['whatsapp', 'ri-whatsapp-line', 'WhatsApp'],
  ]
  if (contact.blocklisted) return <span className="badge bg-danger-subtle text-danger">Blocklisted</span>
  return (
    <span className="d-inline-flex gap-2 fs-5">
      {items.map(([key, icon, label]) => {
        const status = contact.consents[key] ?? 'none'
        return <i key={key} className={`${icon} ${CONSENT_ICON[status]}`} title={`${label}: ${status}`} aria-label={`${label}: ${status}`} />
      })}
    </span>
  )
}
