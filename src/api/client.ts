import { getAccessToken } from '../auth/tokenStorage'
import { ApiRequestError, ERROR_MESSAGES, messageForStatus, type ErrorContext } from './errors'

export type ApiError = {
  error?: string
  error_description?: string
}

/**
 * Wraps `fetch` so a transport failure (TypeError such as "Load failed" or
 * "Failed to fetch") becomes an ApiRequestError with a user-facing message.
 */
export async function safeFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  try {
    return await fetch(input, init)
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') throw err
    console.error('[api] network error', input, err)
    const detail = err instanceof Error ? err.message : String(err)
    throw new ApiRequestError(ERROR_MESSAGES.network, 0, detail)
  }
}

/** Builds a user-safe error from a non-OK response; technical detail goes to console. */
export async function toApiError(
  response: Response,
  context: ErrorContext = 'default',
): Promise<ApiRequestError> {
  let description: string | undefined
  let raw = ''
  try {
    raw = await response.text()
    const data = JSON.parse(raw) as ApiError
    description = data.error_description || data.error || undefined
  } catch {
    // Body was empty or not JSON; keep raw text for the console only.
  }
  const detail = `${response.status} ${response.statusText} ${raw}`.trim()
  console.error('[api] request failed', response.url, detail)
  return new ApiRequestError(messageForStatus(response.status, context, description), response.status, detail)
}

export async function parseJson<T>(response: Response): Promise<T> {
  try {
    return (await response.json()) as T
  } catch (err) {
    console.error('[api] invalid JSON response', response.url, err)
    throw new ApiRequestError(ERROR_MESSAGES.generic, response.status, String(err))
  }
}

export async function apiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const token = getAccessToken()
  const headers = new Headers(init.headers)
  if (!headers.has('Accept')) headers.set('Accept', 'application/json')
  if (token) headers.set('Authorization', `Bearer ${token}`)
  if (init.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  return safeFetch(path, { ...init, headers })
}

export async function apiJson<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await apiFetch(path, init)
  if (!response.ok) throw await toApiError(response)
  if (response.status === 204) return undefined as T
  return parseJson<T>(response)
}
