import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import BreadCrumb from '@/components/common/BreadCrumb'
import { phoneNumbersService } from '@/services/phone-numbers.service'
import { ROUTES } from '@/constants/routes.constants'

export function PhoneProvidersPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['phone-providers'],
    queryFn: () => phoneNumbersService.providers(),
  })

  return (
    <>
      <BreadCrumb
        activePage="Number providers"
        breadcrumbs={[{ label: 'Telephony', href: ROUTES.PHONE_NUMBERS }]}
      />

      <div className="box mb-3">
        <div className="box-body">
          <h5 className="mb-2">How to add a number (open-source first)</h5>
          <ol className="mb-0 ps-4">
            <li className="mb-1">
              Terminate DIDs on <strong>LiveKit SIP</strong>, <strong>Asterisk</strong>, or{' '}
              <strong>FreeSWITCH</strong> (all open source).
            </li>
            <li className="mb-1">
              Or bring your own SIP URI (BYON) — no marketplace purchase needed.
            </li>
            <li className="mb-1">
              Map the number here → assign an AI agent → inbound calls join a LiveKit room.
            </li>
            <li>
              Optional: enable <Link to={ROUTES.PHONE_WHATSAPP}>WhatsApp Calling</Link> via Meta
              Cloud API and bridge media into the same agent runtime.
            </li>
          </ol>
        </div>
      </div>

      {isLoading && <p className="text-textmuted">Loading providers…</p>}
      {isError && <p className="text-danger">Failed to load providers.</p>}

      <div className="grid grid-cols-12 gap-3">
        {(data?.data ?? []).map((provider) => (
          <div key={provider.id} className="xl:col-span-6 col-span-12">
            <div className="box h-full">
              <div className="box-header flex items-center justify-between gap-2">
                <div>
                  <div className="box-title">{provider.name}</div>
                  <div className="text-textmuted fs-12">
                    {provider.kind} · {provider.license}
                  </div>
                </div>
                <div className="flex gap-1">
                  {provider.recommended && (
                    <span className="badge bg-primary-transparent">Recommended</span>
                  )}
                  {provider.kind === 'opensource' && (
                    <span className="badge bg-success-transparent">Open source</span>
                  )}
                  {provider.supportsWhatsApp && (
                    <span className="badge bg-success">WhatsApp</span>
                  )}
                </div>
              </div>
              <div className="box-body">
                <p>{provider.summary}</p>
                <div className="text-textmuted fs-12 mb-1">How to add</div>
                <ol className="ps-4 mb-3">
                  {provider.howToAdd.map((step) => (
                    <li key={step} className="mb-1">
                      {step}
                    </li>
                  ))}
                </ol>
                <div className="flex flex-wrap gap-2">
                  <a
                    href={provider.docsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="ti-btn ti-btn-outline-primary ti-btn-sm"
                  >
                    Docs
                  </a>
                  {provider.kind === 'whatsapp' ? (
                    <Link
                      to={ROUTES.PHONE_WHATSAPP}
                      className="ti-btn ti-btn-primary ti-btn-sm"
                    >
                      Configure WhatsApp
                    </Link>
                  ) : (
                    <Link to={ROUTES.PHONE_BUY} className="ti-btn ti-btn-primary ti-btn-sm">
                      Add number
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
