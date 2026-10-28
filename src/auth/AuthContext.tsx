import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

import {
  changePassword as changePasswordApi,
  fetchMe,
  login as loginApi,
  refreshToken as refreshTokenApi,
  type MeResponse,
} from '../api/authApi'
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  setTokens,
} from './tokenStorage'

type AuthContextValue = {
  user: MeResponse | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>
  accessToken: string | null
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<MeResponse | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(getAccessToken())
  const [loading, setLoading] = useState(true)

  const bootstrap = useCallback(async () => {
    const token = getAccessToken()
    if (!token) {
      setLoading(false)
      return
    }

    try {
      const me = await fetchMe(token)
      setUser(me)
      setAccessToken(token)
    } catch {
      const refresh = getRefreshToken()
      if (!refresh) {
        clearTokens()
        setAccessToken(null)
        setUser(null)
        setLoading(false)
        return
      }

      try {
        const tokens = await refreshTokenApi(refresh)
        setTokens(tokens.access_token, tokens.refresh_token ?? refresh)
        setAccessToken(tokens.access_token)
        setUser(await fetchMe(tokens.access_token))
      } catch {
        clearTokens()
        setAccessToken(null)
        setUser(null)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void bootstrap()
  }, [bootstrap])

  const login = useCallback(async (email: string, password: string) => {
    const tokens = await loginApi(email, password)
    setTokens(tokens.access_token, tokens.refresh_token)
    setAccessToken(tokens.access_token)
    setUser(await fetchMe(tokens.access_token))
  }, [])

  const logout = useCallback(() => {
    clearTokens()
    setAccessToken(null)
    setUser(null)
  }, [])

  const changePassword = useCallback(
    async (currentPassword: string, newPassword: string) => {
      const token = getAccessToken()
      if (!token) throw new Error('Not authenticated')
      await changePasswordApi(token, currentPassword, newPassword)
    },
    [],
  )

  const value = useMemo(
    () => ({ user, loading, login, logout, changePassword, accessToken }),
    [user, loading, login, logout, changePassword, accessToken],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
