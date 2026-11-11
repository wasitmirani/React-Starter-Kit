import { cloneElement, isValidElement, type ReactElement, type ReactNode } from 'react'

interface FormFieldProps {
  id: string
  label: ReactNode
  error?: string
  hint?: ReactNode
  children: ReactNode
  className?: string
  /** Shows a red asterisk after the label. */
  required?: boolean
  /** Shows "(optional)" after the label. */
  optional?: boolean
  /** Right side of the label row, e.g. a counter or a help link. */
  aside?: ReactNode
}

/**
 * Label + control + message in Bootstrap markup. The message is linked to the
 * control with `aria-describedby`, and errors are announced and marked invalid.
 */
export function FormField({ id, label, error, hint, children, className = '', required, optional, aside }: FormFieldProps) {
  const msgId = `${id}-msg`
  const hasMsg = !!error || !!hint
  // Wire the single direct control to its message (inputs, selects, textareas).
  const control =
    isValidElement(children) && typeof children.type === 'string' && ['input', 'select', 'textarea'].includes(children.type)
      ? cloneElement(children as ReactElement<Record<string, unknown>>, {
          'aria-describedby': hasMsg ? msgId : undefined,
          'aria-invalid': error ? true : undefined,
          'aria-required': required || undefined,
          className: `${(children.props as { className?: string }).className ?? ''}${error ? ' is-invalid' : ''}`.trim(),
        })
      : children
  return (
    <div className={`form-field ${className}`.trim()}>
      <div className="form-label-row">
        <label htmlFor={id} className={`form-label${required ? ' required' : ''}`}>
          {label}
          {optional && <span className="form-optional"> (optional)</span>}
        </label>
        {aside}
      </div>
      {control}
      {error ? (
        <div id={msgId} className="invalid-feedback d-block" role="alert">
          <i className="ri-error-warning-fill" aria-hidden /> {error}
        </div>
      ) : hint ? (
        <div id={msgId} className="form-text">{hint}</div>
      ) : null}
    </div>
  )
}
