import { isAxiosError } from 'axios'
import type { ApiErrorBody } from '@/types/api.types'

export interface ApiError {
  status: number | null
  code: string
  message: string
  /** Field name → messages, from validation errors. */
  fieldErrors: Record<string, string[]>
}

/** An error raised in the client (mock API, local validation) with the same shape as a server error. */
export class AppError extends Error {
  readonly status: number
  readonly code: string
  readonly fieldErrors: Record<string, string[]>

  constructor(status: number, code: string, message: string, fieldErrors: Record<string, string[]> = {}) {
    super(message)
    this.status = status
    this.code = code
    this.fieldErrors = fieldErrors
  }
}

/** Normalizes any thrown value (axios error, network failure, bug) into a displayable error. */
export function toApiError(error: unknown): ApiError {
  if (error instanceof AppError) {
    return { status: error.status, code: error.code, message: error.message, fieldErrors: error.fieldErrors }
  }
  if (isAxiosError<ApiErrorBody>(error)) {
    const body = error.response?.data
    if (body && typeof body === 'object' && 'code' in body) {
      const fieldErrors: Record<string, string[]> = {}
      const list: string[] = []
      for (const detail of body.details ?? []) {
        if (typeof detail === 'string') list.push(detail)
        else if (detail.field) fieldErrors[detail.field] = detail.errors ?? []
      }
      const message =
        list.length > 0
          ? list.join('. ')
          : Array.isArray(body.message)
            ? body.message.join('. ')
            : body.message
      return { status: body.statusCode, code: body.code, message, fieldErrors }
    }
    if (!error.response) {
      return {
        status: null,
        code: 'NETWORK_ERROR',
        message: 'Cannot reach the server. Check your connection and try again.',
        fieldErrors: {},
      }
    }
  }
  return {
    status: null,
    code: 'UNKNOWN_ERROR',
    message: 'Something went wrong. Please try again.',
    fieldErrors: {},
  }
}

export const errorMessage = (error: unknown) => toApiError(error).message
