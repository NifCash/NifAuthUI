import { parseJson, safeFetch, toApiError } from './client'

export type TokenResponse = {
  access_token: string
  refresh_token?: string
  expires_in?: number
  token_type?: string
  scope?: string
}

export type MeResponse = {
  id: string
  email: string
  fullName: string
  isActive: boolean
  isSuperAdmin: boolean
  roles: string[]
  permissions: string[]
  organizationId?: string | null
  canOperate: boolean
}

export type RegisterResponse = {
  userId: string
  email: string
  fullName: string
}

export async function register(
  email: string,
  password: string,
  fullName: string,
): Promise<RegisterResponse> {
  const response = await safeFetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ email, password, fullName }),
  })

  if (!response.ok) {
    throw await toApiError(response)
  }

  return parseJson<RegisterResponse>(response)
}

export async function login(email: string, password: string): Promise<TokenResponse> {
  const response = await safeFetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ email, password }),
  })

  if (!response.ok) {
    throw await toApiError(response, 'login')
  }

  return parseJson<TokenResponse>(response)
}

export async function fetchMe(accessToken: string): Promise<MeResponse> {
  const response = await safeFetch('/api/auth/me', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
    },
  })

  if (!response.ok) {
    throw await toApiError(response)
  }

  return parseJson<MeResponse>(response)
}

export async function changePassword(
  accessToken: string,
  currentPassword: string,
  newPassword: string,
): Promise<void> {
  const response = await safeFetch('/api/auth/change-password', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({ currentPassword, newPassword }),
  })

  if (!response.ok) {
    throw await toApiError(response)
  }
}

export async function refreshToken(refreshTokenValue: string): Promise<TokenResponse> {
  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: refreshTokenValue,
    client_id: 'nifcash.swagger',
  })

  const response = await safeFetch('/connect/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
    },
    body,
  })

  if (!response.ok) {
    throw await toApiError(response)
  }

  return parseJson<TokenResponse>(response)
}
