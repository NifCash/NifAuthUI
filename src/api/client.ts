import { getAccessToken } from '../auth/tokenStorage'

export type ApiError = {
  error?: string
  error_description?: string
}

export async function readError(response: Response): Promise<string> {
  try {
    const data = (await response.json()) as ApiError
    return data.error_description || data.error || response.statusText
  } catch {
    return response.statusText || 'Request failed'
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

  return fetch(path, { ...init, headers })
}

export async function apiJson<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await apiFetch(path, init)
  if (!response.ok) throw new Error(await readError(response))
  if (response.status === 204) return undefined as T
  return (await response.json()) as T
}
