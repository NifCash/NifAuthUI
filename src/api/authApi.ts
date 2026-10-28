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

export type ApiError = {
  error?: string
  error_description?: string
}

async function readError(response: Response): Promise<string> {
  try {
    const data = (await response.json()) as ApiError
    return data.error_description || data.error || response.statusText
  } catch {
    return response.statusText || 'Request failed'
  }
}

export async function login(email: string, password: string): Promise<TokenResponse> {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ email, password }),
  })

  if (!response.ok) {
    throw new Error(await readError(response))
  }

  return (await response.json()) as TokenResponse
}

export async function fetchMe(accessToken: string): Promise<MeResponse> {
  const response = await fetch('/api/auth/me', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error(await readError(response))
  }

  return (await response.json()) as MeResponse
}

export async function changePassword(
  accessToken: string,
  currentPassword: string,
  newPassword: string,
): Promise<void> {
  const response = await fetch('/api/auth/change-password', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({ currentPassword, newPassword }),
  })

  if (!response.ok) {
    throw new Error(await readError(response))
  }
}

export async function refreshToken(refreshTokenValue: string): Promise<TokenResponse> {
  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: refreshTokenValue,
    client_id: 'nifcash.swagger',
  })

  const response = await fetch('/connect/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
    },
    body,
  })

  if (!response.ok) {
    throw new Error(await readError(response))
  }

  return (await response.json()) as TokenResponse
}
