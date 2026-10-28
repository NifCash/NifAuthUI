const ACCESS_KEY = 'nifcash.access_token'
const REFRESH_KEY = 'nifcash.refresh_token'

export function getAccessToken(): string | null {
  return sessionStorage.getItem(ACCESS_KEY)
}

export function getRefreshToken(): string | null {
  return sessionStorage.getItem(REFRESH_KEY)
}

export function setTokens(accessToken: string, refreshToken?: string | null): void {
  sessionStorage.setItem(ACCESS_KEY, accessToken)
  if (refreshToken) {
    sessionStorage.setItem(REFRESH_KEY, refreshToken)
  }
}

export function clearTokens(): void {
  sessionStorage.removeItem(ACCESS_KEY)
  sessionStorage.removeItem(REFRESH_KEY)
}
