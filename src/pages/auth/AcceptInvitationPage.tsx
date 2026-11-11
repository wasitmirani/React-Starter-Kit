import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { accessApi } from '@/api/endpoints/access.api'
import { toApiError } from '@/api/errors'
import { FormAlert } from '@/components/common/FormAlert'
import { Loader } from '@/components/common/Loader'
import { AuthCard } from '@/components/features/auth/AuthCard'
import { ROUTES } from '@/constants/routes.constants'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'

export function AcceptInvitationPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') ?? ''
  const { status, user, refreshProfile, switchTenant, logout } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()
  const [error, setError] = useState<string | null>(null)
  const [accepting, setAccepting] = useState(false)

  const preview = useQuery({
    queryKey: ['invitation-preview', token],
    queryFn: async () => (await accessApi.previewInvitation(token)).data.data,
    enabled: token.length > 0,
    retry: false,
  })

  const here = `${ROUTES.ACCEPT_INVITATION}?token=${encodeURIComponent(token)}`
  const redirectParam = `?redirect=${encodeURIComponent(here)}`

  const accept = async () => {
    setError(null)
    setAccepting(true)
    try {
      const { data } = await accessApi.acceptInvitation(token)
      await refreshProfile()
      switchTenant(data.data.tenant.id)
      toast.success(`You joined ${data.data.tenant.name}`)
      navigate(ROUTES.DASHBOARD, { replace: true })
    } catch (err) {
      setError(toApiError(err).message)
    } finally {
      setAccepting(false)
    }
  }

  if (!token || preview.isError) {
    return (
      <AuthCard title="Invitation" footer={<Link to={ROUTES.LOGIN}>Go to sign in</Link>}>
        <FormAlert message="This invitation is invalid, has expired or was already used. Ask the sender for a new one." />
      </AuthCard>
    )
  }
  if (preview.isLoading || status === 'loading' || !preview.data) {
    return (
      <AuthCard title="Invitation">
        <Loader label="Loading invitation…" />
      </AuthCard>
    )
  }

  const invite = preview.data
  const emailMatches = user?.email.toLowerCase() === invite.email.toLowerCase()

  return (
    <AuthCard title={`Join ${invite.tenantName}`}>
      <p>
        {invite.inviterName ?? 'A team member'} invited <strong>{invite.email}</strong> to join{' '}
        <strong>{invite.tenantName}</strong> as <strong>{invite.roleName}</strong>.
      </p>
      <FormAlert message={error} onClose={() => setError(null)} />

      {status === 'anonymous' && (
        <div className="d-grid gap-3">
          <Link to={`${ROUTES.LOGIN}${redirectParam}`} className="btn btn-primary">
            Sign in to accept
          </Link>
          <Link to={`${ROUTES.REGISTER}${redirectParam}`} className="btn btn-outline-primary">
            Create an account with {invite.email}
          </Link>
        </div>
      )}

      {status === 'authenticated' && emailMatches && (
        <button type="button" className="btn btn-primary w-100" onClick={accept} disabled={accepting}>
          {accepting ? 'Joining…' : 'Accept invitation'}
        </button>
      )}

      {status === 'authenticated' && !emailMatches && (
        <>
          <FormAlert
            variant="warning"
            message={`You're signed in as ${user?.email}. Sign in as ${invite.email} to accept this invitation.`}
          />
          <button
            type="button"
            className="btn btn-outline-primary w-100"
            onClick={async () => {
              await logout()
              navigate(`${ROUTES.LOGIN}${redirectParam}`)
            }}
          >
            Switch account
          </button>
        </>
      )}
    </AuthCard>
  )
}
