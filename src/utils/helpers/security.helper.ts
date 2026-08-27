import { createElement } from 'react'
import type { ReactNode } from 'react'

/** Escape and render untrusted transcript text safely. */
export function SafeText({ text, className }: { text: string; className?: string }) {
  return createElement('span', { className }, text)
}

export function maskSecret(value: string, visible = 4): string {
  if (value.length <= visible) return '••••'
  return `${'•'.repeat(Math.max(8, value.length - visible))}${value.slice(-visible)}`
}

export function ToastFromApiError(message: string): ReactNode {
  return message
}
