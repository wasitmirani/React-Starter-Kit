import { useState } from 'react'
import { authApi } from '@/api/endpoints/auth.api'
import { errorMessage } from '@/api/errors'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'

/** Reminds signed-in users with an unverified email and lets them resend the link. */
export function EmailVerificationBanner() {
  const { user } = useAuth()
  const toast = useToast()
  const [sending, setSending] = useState(false)
  if (!user || user.emailVerified) return null

  const resend = async () => {
    setSending(true)
    try {
      await authApi.resendVerification()
      toast.success(`Verification email sent to ${user.email}`)
    } catch (err) {
      toast.error(errorMessage(err))
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="alert alert-warning d-flex flex-wrap align-items-center gap-3" role="status">
      <i className="ri-mail-unread-line fs-lg" />
      <span className="flex-grow-1">
        Please verify <strong>{user.email}</strong> using the link we emailed you.
      </span>
      <button type="button" className="btn btn-sm btn-warning" onClick={resend} disabled={sending}>
        {sending ? 'Sending…' : 'Resend email'}
      </button>
    </div>
  )
}
