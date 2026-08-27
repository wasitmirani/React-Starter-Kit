import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import BreadCrumb from '@/components/common/BreadCrumb'
import { phoneNumbersService } from '@/services/phone-numbers.service'
import { ROUTES } from '@/constants/routes.constants'
import type { WhatsAppCallingConfig } from '@/types/phone-number.types'
import { useToast } from '@/hooks/useToast'

export function PhoneWhatsAppPage() {
  const toast = useToast()
  const queryClient = useQueryClient()
  const { data, isLoading } = useQuery({
    queryKey: ['whatsapp-calling'],
    queryFn: () => phoneNumbersService.getWhatsApp(),
  })

  const [form, setForm] = useState<WhatsAppCallingConfig>({
    enabled: false,
    provider: 'meta_cloud',
    businessAccountId: '',
    phoneNumberId: '',
    displayName: '',
    webhookUrl: '',
    status: 'disconnected',
    notes: '',
  })

  useEffect(() => {
    if (data?.data) setForm(data.data)
  }, [data])

  const save = useMutation({
    mutationFn: () => phoneNumbersService.saveWhatsApp(form),
    onSuccess: (res) => {
      if (!res.success) {
        toast.error(res.message ?? 'Save failed')
        return
      }
      toast.success('WhatsApp calling settings saved')
      void queryClient.invalidateQueries({ queryKey: ['whatsapp-calling'] })
    },
  })

  const set = <K extends keyof WhatsAppCallingConfig>(
    key: K,
    value: WhatsAppCallingConfig[K],
  ) => setForm((prev) => ({ ...prev, [key]: value }))

  return (
    <>
      <BreadCrumb
        activePage="WhatsApp Calling"
        breadcrumbs={[{ label: 'Telephony', href: ROUTES.PHONE_NUMBERS }]}
      />

      <div className="box mb-3">
        <div className="box-body">
          <h5 className="mb-2">Is WhatsApp calling possible?</h5>
          <p className="mb-2">
            Yes — with limits. Meta’s <strong>WhatsApp Business Calling API</strong> (Cloud API)
            supports voice calls on a verified WhatsApp Business number. It is not open source
            (Meta platform), but you can still keep your AI stack open source by bridging the call
            into <strong>LiveKit</strong> (same path as SIP/PSTN).
          </p>
          <ul className="mb-2 ps-4">
            <li>Requires Meta Business verification + Calling enabled on the WABA number.</li>
            <li>User-initiated and business-initiated calling rules apply (policy / region).</li>
            <li>
              Architecture: WhatsApp webhook → your API → create LiveKit room → AI agent joins.
            </li>
            <li>
              Alternatives: Twilio WhatsApp Voice (commercial) or a custom media bridge.
            </li>
          </ul>
          <a
            href="https://developers.facebook.com/docs/whatsapp/cloud-api/calling"
            target="_blank"
            rel="noreferrer"
            className="ti-btn ti-btn-outline-primary ti-btn-sm"
          >
            Meta Calling docs
          </a>
          <Link to={ROUTES.PHONE_PROVIDERS} className="ti-btn ti-btn-outline-light ti-btn-sm ms-2">
            Open-source PSTN options
          </Link>
        </div>
      </div>

      <div className="box">
        <div className="box-header flex items-center justify-between">
          <div className="box-title">WhatsApp bridge config</div>
          <span
            className={`badge ${
              form.status === 'connected'
                ? 'bg-success-transparent'
                : form.status === 'pending'
                  ? 'bg-warning-transparent'
                  : 'bg-secondary-transparent'
            }`}
          >
            {form.status}
          </span>
        </div>
        <div className="box-body">
          {isLoading ? (
            <p className="text-textmuted mb-0">Loading…</p>
          ) : (
            <>
              <div className="form-check mb-3">
                <input
                  id="wa-enabled"
                  type="checkbox"
                  className="form-check-input"
                  checked={form.enabled}
                  onChange={(e) => set('enabled', e.target.checked)}
                />
                <label className="form-check-label" htmlFor="wa-enabled">
                  Enable WhatsApp calling bridge
                </label>
              </div>

              <div className="grid grid-cols-12 gap-3">
                <div className="md:col-span-4 col-span-12">
                  <label className="form-label">Provider</label>
                  <select
                    className="form-control"
                    value={form.provider}
                    onChange={(e) =>
                      set(
                        'provider',
                        e.target.value as WhatsAppCallingConfig['provider'],
                      )
                    }
                  >
                    <option value="meta_cloud">Meta Cloud API</option>
                    <option value="twilio">Twilio WhatsApp Voice</option>
                    <option value="custom_bridge">Custom bridge</option>
                  </select>
                </div>
                <div className="md:col-span-4 col-span-12">
                  <label className="form-label">Business Account ID</label>
                  <input
                    className="form-control"
                    value={form.businessAccountId}
                    onChange={(e) => set('businessAccountId', e.target.value)}
                    placeholder="WABA ID"
                  />
                </div>
                <div className="md:col-span-4 col-span-12">
                  <label className="form-label">WhatsApp Phone Number ID</label>
                  <input
                    className="form-control"
                    value={form.phoneNumberId}
                    onChange={(e) => set('phoneNumberId', e.target.value)}
                    placeholder="Cloud API phone_number_id"
                  />
                </div>
                <div className="md:col-span-6 col-span-12">
                  <label className="form-label">Display name</label>
                  <input
                    className="form-control"
                    value={form.displayName}
                    onChange={(e) => set('displayName', e.target.value)}
                  />
                </div>
                <div className="md:col-span-6 col-span-12">
                  <label className="form-label">Voice webhook URL</label>
                  <input
                    className="form-control"
                    value={form.webhookUrl}
                    onChange={(e) => set('webhookUrl', e.target.value)}
                  />
                </div>
                <div className="col-span-12">
                  <label className="form-label">Notes</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    value={form.notes}
                    onChange={(e) => set('notes', e.target.value)}
                  />
                </div>
              </div>

              <button
                type="button"
                className="ti-btn ti-btn-primary ti-btn-sm mt-3"
                disabled={save.isPending}
                onClick={() => save.mutate()}
              >
                {save.isPending ? 'Saving…' : 'Save WhatsApp settings'}
              </button>
            </>
          )}
        </div>
      </div>
    </>
  )
}
