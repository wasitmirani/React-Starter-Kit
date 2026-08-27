import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import BreadCrumb from '@/components/common/BreadCrumb'
import { phoneNumbersService } from '@/services/phone-numbers.service'
import { ROUTES } from '@/constants/routes.constants'
import type { PhoneNumberSearchResult } from '@/types/phone-number.types'
import { useToast } from '@/hooks/useToast'

export function PhoneBuyPage() {
  const navigate = useNavigate()
  const toast = useToast()
  const queryClient = useQueryClient()
  const [country, setCountry] = useState('US')
  const [areaCode, setAreaCode] = useState('415')
  const [channel, setChannel] = useState('')
  const [providerFilter, setProviderFilter] = useState('')
  const [submitted, setSubmitted] = useState({
    country: 'US',
    areaCode: '415',
    channel: '',
    provider: '',
  })
  const [byonNumber, setByonNumber] = useState('')
  const [byonSipUri, setByonSipUri] = useState('')

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: [
      'phone-search',
      submitted.country,
      submitted.areaCode,
      submitted.channel,
      submitted.provider,
    ],
    queryFn: () =>
      phoneNumbersService.search({
        country: submitted.country || undefined,
        areaCode: submitted.areaCode || undefined,
        channel: submitted.channel || undefined,
        provider: submitted.provider || undefined,
      }),
  })

  const buyMutation = useMutation({
    mutationFn: (row: PhoneNumberSearchResult) =>
      phoneNumbersService.buy({
        number: row.number,
        country: row.country,
        areaCode: row.areaCode,
        monthlyCost: row.monthlyCost,
        capabilities: row.capabilities,
        provider: row.provider ?? 'Unknown',
        providerKind: row.providerKind,
        channel: row.channel,
      }),
    onSuccess: (res) => {
      if (!res.success) {
        toast.error(res.message ?? 'Purchase failed')
        return
      }
      toast.success(`Added ${res.data?.number}`)
      void queryClient.invalidateQueries({ queryKey: ['phone-numbers'] })
      navigate(ROUTES.PHONE_NUMBERS)
    },
    onError: () => toast.error('Unable to add number'),
  })

  const byonMutation = useMutation({
    mutationFn: () =>
      phoneNumbersService.buy({
        number: byonNumber.trim(),
        country: 'BYON',
        areaCode: '',
        monthlyCost: 0,
        capabilities: ['voice'],
        provider: 'BYON SIP',
        providerKind: 'byon',
        channel: 'sip',
        friendlyName: byonSipUri.trim() || 'Bring Your Own Number',
      }),
    onSuccess: (res) => {
      if (!res.success) {
        toast.error(res.message ?? 'Failed to add BYON')
        return
      }
      toast.success('SIP number registered')
      void queryClient.invalidateQueries({ queryKey: ['phone-numbers'] })
      navigate(ROUTES.PHONE_NUMBERS)
    },
  })

  return (
    <>
      <BreadCrumb
        activePage="Add Number"
        breadcrumbs={[{ label: 'Phone Numbers', href: ROUTES.PHONE_NUMBERS }]}
      />

      <div className="box mb-3">
        <div className="box-body">
          <p className="mb-2">
            Prefer open source? Use <strong>LiveKit SIP</strong>, <strong>Asterisk</strong>, or{' '}
            <strong>FreeSWITCH</strong> with a DID / SIP URI — no proprietary lock-in for the media
            path. WhatsApp voice is also available via Meta Cloud API (bridged into LiveKit).
          </p>
          <div className="flex flex-wrap gap-2">
            <Link to={ROUTES.PHONE_PROVIDERS} className="ti-btn ti-btn-outline-primary ti-btn-sm">
              Open-source providers guide
            </Link>
            <Link to={ROUTES.PHONE_WHATSAPP} className="ti-btn ti-btn-outline-success ti-btn-sm">
              WhatsApp calling setup
            </Link>
            <Link to={ROUTES.PHONE_SIP} className="ti-btn ti-btn-outline-light ti-btn-sm">
              SIP connections
            </Link>
          </div>
        </div>
      </div>

      <div className="box mb-3">
        <div className="box-header">
          <div className="box-title">Bring Your Own Number (SIP)</div>
        </div>
        <div className="box-body grid grid-cols-12 gap-3">
          <div className="md:col-span-4 col-span-12">
            <label className="form-label">E.164 number</label>
            <input
              className="form-control"
              placeholder="+14155550199"
              value={byonNumber}
              onChange={(e) => setByonNumber(e.target.value)}
            />
          </div>
          <div className="md:col-span-5 col-span-12">
            <label className="form-label">SIP URI (optional)</label>
            <input
              className="form-control"
              placeholder="sip:+14155550199@pbx.local"
              value={byonSipUri}
              onChange={(e) => setByonSipUri(e.target.value)}
            />
          </div>
          <div className="md:col-span-3 col-span-12 flex items-end">
            <button
              type="button"
              className="ti-btn ti-btn-primary"
              disabled={!byonNumber.trim() || byonMutation.isPending}
              onClick={() => byonMutation.mutate()}
            >
              {byonMutation.isPending ? 'Adding…' : 'Add BYON'}
            </button>
          </div>
        </div>
      </div>

      <div className="box">
        <div className="box-header flex items-center justify-between">
          <div className="box-title">Search inventory</div>
          <Link to={ROUTES.PHONE_NUMBERS} className="ti-btn ti-btn-outline-light ti-btn-sm">
            Back
          </Link>
        </div>
        <div className="box-body">
          <div className="grid grid-cols-12 gap-3 mb-4">
            <div className="md:col-span-2 col-span-6">
              <label className="form-label">Country</label>
              <input
                className="form-control"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
              />
            </div>
            <div className="md:col-span-2 col-span-6">
              <label className="form-label">Area code</label>
              <input
                className="form-control"
                value={areaCode}
                onChange={(e) => setAreaCode(e.target.value)}
              />
            </div>
            <div className="md:col-span-3 col-span-6">
              <label className="form-label">Channel</label>
              <select
                className="form-control"
                value={channel}
                onChange={(e) => setChannel(e.target.value)}
              >
                <option value="">Any</option>
                <option value="sip">SIP / open source</option>
                <option value="pstn">PSTN cloud</option>
                <option value="whatsapp">WhatsApp</option>
              </select>
            </div>
            <div className="md:col-span-3 col-span-6">
              <label className="form-label">Provider contains</label>
              <input
                className="form-control"
                placeholder="LiveKit, Asterisk, Meta…"
                value={providerFilter}
                onChange={(e) => setProviderFilter(e.target.value)}
              />
            </div>
            <div className="md:col-span-2 col-span-12 flex items-end">
              <button
                type="button"
                className="ti-btn ti-btn-primary w-full"
                onClick={() => {
                  setSubmitted({
                    country,
                    areaCode,
                    channel,
                    provider: providerFilter,
                  })
                  void refetch()
                }}
              >
                Search
              </button>
            </div>
          </div>

          {(isLoading || isFetching) && <p className="text-textmuted">Searching…</p>}

          <div className="table-responsive">
            <table className="table table-hover whitespace-nowrap">
              <thead>
                <tr>
                  <th>Number</th>
                  <th>Provider</th>
                  <th>Channel</th>
                  <th>Capabilities</th>
                  <th className="text-end">Monthly</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {(data?.data ?? []).map((row) => (
                  <tr key={row.number}>
                    <td className="font-medium">{row.number}</td>
                    <td>
                      {row.provider}
                      {row.providerKind === 'opensource' && (
                        <span className="badge bg-success-transparent ms-1">OSS</span>
                      )}
                    </td>
                    <td>{row.channel ?? '—'}</td>
                    <td>{row.capabilities.join(', ')}</td>
                    <td className="text-end">
                      {row.monthlyCost === 0 ? 'BYON / $0' : `$${row.monthlyCost.toFixed(2)}`}
                    </td>
                    <td className="text-end">
                      <button
                        type="button"
                        className="ti-btn ti-btn-sm ti-btn-primary"
                        disabled={buyMutation.isPending}
                        onClick={() => buyMutation.mutate(row)}
                      >
                        {row.channel === 'whatsapp' ? 'Connect' : 'Add'}
                      </button>
                    </td>
                  </tr>
                ))}
                {!isLoading && (data?.data?.length ?? 0) === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center text-textmuted">
                      No numbers found — try BYON SIP above or another area code.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  )
}
