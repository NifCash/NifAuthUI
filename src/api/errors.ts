// User-facing error messages (Azerbaijani) and helpers that map technical
// failures to them. This module has no imports so it can be unit-tested with
// `node --test` directly.

export const ERROR_MESSAGES = {
  network: 'Bağlantı yoxdur. İnternetini yoxla və yenidən cəhd et.',
  server: 'Server xətası. Bir az sonra yenidən cəhd et.',
  invalidCredentials: 'Email və ya parol səhvdir.',
  emptyCredentials: 'Email və parolu daxil et.',
  forbidden: 'Bu əməliyyat üçün icazən yoxdur.',
  tooManyRequests: 'Çox cəhd edildi, bir az sonra yenə yoxla.',
  checkInput: 'Məlumatları yoxla.',
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

/** Parsed JSON error body. ProblemDetails (validation) bodies have no `error` field. */
export type ErrorBody = {
  error?: string | null
  error_description?: string | null
}

/**
 * Maps an HTTP status (and optional parsed error body) to a user-facing
 * message. `status` 0 means the request never reached the server.
 *
 * Login rules: the API deliberately returns the same 401 `invalid_credentials`
 * for unknown email, inactive account and wrong password, so all of them map
 * to one message. A 400 only means bad credentials when `error` is
 * `invalid_grant`; a 400 without `error` is a validation (ProblemDetails)
 * response.
 */
export function messageForStatus(
  status: number,
  context: ErrorContext = 'default',
  body?: ErrorBody | null,
): string {
  if (status === 0) return ERROR_MESSAGES.network
  if (status >= 500) return ERROR_MESSAGES.server
  if (status === 429) return ERROR_MESSAGES.tooManyRequests
  const code = body?.error || undefined
  if (context === 'login') {
    if (status === 401 || code === 'invalid_credentials') return ERROR_MESSAGES.invalidCredentials
    if (status === 400) {
      if (code === 'invalid_grant') return ERROR_MESSAGES.invalidCredentials
      if (!code) return ERROR_MESSAGES.checkInput
      return ERROR_MESSAGES.generic
    }
  }
  if (status === 403) return ERROR_MESSAGES.forbidden
  // Domain validation errors (e.g. "code already exists") carry an explicit
  // description from the API; keep it so non-login forms stay informative.
  // Only `error_description` is shown; a bare `error` is a technical code
  // (e.g. `invalid_request`) and must never reach the user.
  const description = body?.error_description
  if (
    context !== 'login' &&
    description &&
    (status === 400 || status === 404 || status === 409 || status === 422)
  ) {
    return description
  }
  return ERROR_MESSAGES.generic
}

/**
 * Returns a message that is safe to show for any thrown value.
 * Network failures are already converted to ApiRequestError (status 0) in
 * `safeFetch`, so any other error (including TypeError) is a code bug and
 * gets the generic message instead of being disguised as "no connection".
 */
export function toUserMessage(err: unknown): string {
  if (err instanceof ApiRequestError) return err.message
  return ERROR_MESSAGES.generic
}
