type ApiErrorToastHandler = (message: string) => void

let handler: ApiErrorToastHandler | null = null

export function registerApiErrorToast(fn: ApiErrorToastHandler): () => void {
  handler = fn
  return () => {
    if (handler === fn) handler = null
  }
}

export function emitApiErrorToast(message: string): void {
  handler?.(message)
}

export function apiErrorMessageForStatus(
  status: number | undefined,
  fallback: string,
): string | null {
  switch (status) {
    case 422:
      return fallback || 'Validation failed — check your input.'
    case 429:
      return 'Too many requests — please wait and try again.'
    case 503:
      return 'Service temporarily unavailable — try again shortly.'
    default:
      return null
  }
}
