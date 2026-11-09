/** Success envelope returned by every API endpoint. */
export interface ApiResponse<T> {
  success: true
  statusCode: number
  message: string
  data: T
  timestamp: string
}

/** Error envelope returned by every API endpoint. */
export interface ApiErrorBody {
  success: false
  statusCode: number
  code: string
  message: string | string[]
  details?: Array<{ field?: string; errors?: string[] } | string>
  requestId: string | null
}

/** Keyset pagination (newest first). Pass `nextCursor` as `cursor` for the next page. */
export interface CursorPage<T> {
  items: T[]
  nextCursor: string | null
}

export interface CursorParams {
  cursor?: string
  limit?: number
}
