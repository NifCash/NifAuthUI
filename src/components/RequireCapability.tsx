import { Navigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { getCapabilities, type Capabilities } from '../auth/capabilities'

type Props = {
  when: (caps: Capabilities) => boolean
  children: React.ReactNode
}

export function RequireCapability({ when, children }: Props) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="page-shell center">
        <p className="muted">Yüklənir…</p>
      </div>
    )
  }

  const caps = getCapabilities(user)
  if (!when(caps)) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
