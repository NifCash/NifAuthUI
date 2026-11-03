// User-facing error messages (Azerbaijani) and helpers that map technical
// failures to them. This module has no imports so it can be unit-tested with
// `node --test` directly.

export const ERROR_MESSAGES = {
  network: 'Bağlantı yoxdur. İnternetini yoxla və yenidən cəhd et.',
  server: 'Server xətası. Bir az sonra yenidən cəhd et.',
  invalidCredentials: 'Email və ya parol səhvdir.',
  emptyCredentials: 'Email və parolu daxil et.',
  forbidden: 'Bu əməliyyat üçün icazən yoxdur.',
  generic: 'Xəta baş verdi. Yenidən cəhd et.',
} as const

export type ErrorContext = 'default' | 'login'

/** Error whose `message` is always safe to show to the user. */
export class ApiRequestError extends Error {
  readonly status: number
  readonly detail: string

  constructor(message: string, status: number, detail: string) {
    super(message)
    this.name = 'ApiRequestError'
    this.status = status
    this.detail = detail
  }
}

/**
 * Maps an HTTP status (and optional server-provided description) to a
 * user-facing message. `status` 0 means the request never reached the server.
 */
export function messageForStatus(
  status: number,
  context: ErrorContext = 'default',
  serverDescription?: string | null,
): string {
  if (status === 0) return ERROR_MESSAGES.network
  if (status >= 500) return ERROR_MESSAGES.server
  if (context === 'login' && (status === 400 || status === 401)) {
    return ERROR_MESSAGES.invalidCredentials
  }
  if (status === 403) return ERROR_MESSAGES.forbidden
  // Domain validation errors (e.g. "code already exists") carry an explicit
  // description from the API; keep it so forms stay informative.
  if (
    context !== 'login' &&
    serverDescription &&
    (status === 400 || status === 404 || status === 409 || status === 422)
  ) {
    return serverDescription
  }
  return ERROR_MESSAGES.generic
}

/** True when `fetch` itself failed (offline, DNS, CORS, "Load failed", …). */
export function isNetworkError(err: unknown): boolean {
  return err instanceof TypeError
}

/** Returns a message that is safe to show for any thrown value. */
export function toUserMessage(err: unknown): string {
  if (err instanceof ApiRequestError) return err.message
  if (isNetworkError(err)) return ERROR_MESSAGES.network
  return ERROR_MESSAGES.generic
}
