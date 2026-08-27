import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation, useQuery } from '@tanstack/react-query'
import { agentsService } from '@/services/agents.service'
import { phoneNumbersService } from '@/services/phone-numbers.service'
import { callsService } from '@/services/calls.service'
import { useToast } from '@/hooks/useToast'
import { ROUTES, callDetailPath } from '@/constants/routes.constants'

export interface CallLeadTarget {
  name: string
  phone: string
}

interface CallLeadPanelProps {
  target: CallLeadTarget
  defaultAgentId?: string
  defaultPhoneNumberId?: string
  compact?: boolean
  onDialed?: (callId: string) => void
}

export function CallLeadPanel({
  target,
  defaultAgentId,
  defaultPhoneNumberId,
  compact = false,
  onDialed,
}: CallLeadPanelProps) {
  const toast = useToast()
  const navigate = useNavigate()
  const [agentId, setAgentId] = useState(defaultAgentId ?? '')
  const [phoneNumberId, setPhoneNumberId] = useState(defaultPhoneNumberId ?? '')

  const agentsQuery = useQuery({
    queryKey: ['agents', 'dial-picker'],
    queryFn: () => agentsService.list({ page: 1, per_page: 50 }),
  })
  const phonesQuery = useQuery({
    queryKey: ['phone-numbers', 'dial-picker'],
    queryFn: () => phoneNumbersService.list({ page: 1, per_page: 50 }),
  })

  const publishedAgents = (agentsQuery.data?.data ?? []).filter((a) => a.status === 'active')
  const activePhones = (phonesQuery.data?.data ?? []).filter(
    (p) => p.status === 'available' || p.status === 'assigned',
  )

  const dialMutation = useMutation({
    mutationFn: () =>
      callsService.dialLead({
        phoneNumberId,
        toNumber: target.phone,
        agentId: agentId || undefined,
        contactName: target.name,
      }),
    onSuccess: (res) => {
      if (!res.success || !res.data) {
        toast.error(res.message ?? 'Call failed')
        return
      }
      toast.success(`Calling ${target.name}…`)
      onDialed?.(res.data.callId)
      navigate(callDetailPath(res.data.callId))
    },
    onError: () => toast.error('Could not start outbound call'),
  })

  const canDial = Boolean(phoneNumberId && target.phone && (agentId || activePhones.length))

  if (compact) {
    return (
      <button
        type="button"
        className="ti-btn ti-btn-success ti-btn-sm"
        disabled={!canDial || dialMutation.isPending}
        title={!canDial ? 'Set agent and phone number first' : `Call ${target.name}`}
        onClick={() => dialMutation.mutate()}
      >
        <i className="ri-phone-fill me-1" />
        {dialMutation.isPending ? 'Calling…' : 'Call'}
      </button>
    )
  }

  return (
    <div className="rounded border border-defaultborder p-4 bg-light/30">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <div className="font-semibold">Call this lead with AI</div>
          <div className="text-textmuted fs-12">
            {target.name} · {target.phone}
          </div>
        </div>
        <span className="badge bg-success-transparent">Outbound</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
        <div>
          <label className="form-label fs-12">AI agent</label>
          <select
            className="form-control form-control-sm"
            value={agentId}
            onChange={(e) => setAgentId(e.target.value)}
          >
            <option value="">Auto (from phone number)</option>
            {publishedAgents.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
          {publishedAgents.length === 0 && (
            <p className="text-warning fs-12 mt-1 mb-0">
              Publish an agent first.{' '}
              <Link to={ROUTES.AGENTS} className="text-primary">
                Go to Agents
              </Link>
            </p>
          )}
        </div>
        <div>
          <label className="form-label fs-12">Caller ID (your number)</label>
          <select
            className="form-control form-control-sm"
            value={phoneNumberId}
            onChange={(e) => setPhoneNumberId(e.target.value)}
          >
            <option value="">Choose number…</option>
            {activePhones.map((p) => (
              <option key={p.id} value={p.id}>
                {p.number} · {p.friendlyName}
              </option>
            ))}
          </select>
          {activePhones.length === 0 && (
            <p className="text-warning fs-12 mt-1 mb-0">
              Add a phone number.{' '}
              <Link to={ROUTES.PHONE_BUY} className="text-primary">
                Add Numbers
              </Link>
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        <button
          type="button"
          className="ti-btn ti-btn-success"
          disabled={!canDial || dialMutation.isPending}
          onClick={() => dialMutation.mutate()}
        >
          <i className="ri-phone-fill me-1" />
          {dialMutation.isPending ? 'Dialing…' : 'Call lead now'}
        </button>
        <Link to={ROUTES.CALLS_LIVE} className="ti-btn ti-btn-outline-light ti-btn-sm">
          Watch live calls
        </Link>
      </div>

      <p className="text-textmuted fs-12 mt-3 mb-0">
        The AI agent calls the customer and handles the conversation. Track progress on Live Calls
        or the call detail page.
      </p>
    </div>
  )
}
