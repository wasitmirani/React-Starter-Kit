import { Children, isValidElement, type ReactElement, type ReactNode } from 'react'
import { describePermission, useCan } from '@/hooks/useCan'

interface GuardProps {
  /** Permission key, e.g. `campaigns.send`. */
  permission: string
  /** The action (one button or link). */
  children: ReactNode
  /** `disable` (default) keeps the action visible but locked, with the reason; `hide` removes it. */
  mode?: 'disable' | 'hide'
}

/**
 * Wraps an action that needs a permission. A locked action stays visible as a
 * disabled button with a lock and a tooltip saying what is missing, so people know
 * whom to ask. Links become buttons, because a disabled link would still navigate.
 */
export function Guard({ permission, children, mode = 'disable' }: GuardProps) {
  const can = useCan()
  if (can(permission)) return <>{children}</>
  if (mode === 'hide' || !isValidElement(children)) return null
  const el = children as ReactElement<{ className?: string; children?: ReactNode; title?: string }>
  const reason = `Locked: you need “${describePermission(permission)}”. Ask a workspace admin for ${permission}.`
  return (
    <span className="guard-locked" title={reason}>
      <button type="button" className={`${el.props.className ?? 'btn btn-light'} is-locked`} disabled aria-disabled="true" aria-label={`${typeof el.props.children === 'string' ? el.props.children : 'Action'} (locked: needs ${permission})`}>
        <i className="ri-lock-2-line" aria-hidden />
        {Children.toArray(el.props.children).filter((c) => !(isValidElement(c) && c.type === 'i'))}
      </button>
    </span>
  )
}
