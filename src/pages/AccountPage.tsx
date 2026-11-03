import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { AppShell } from '../components/AppShell'

export function AccountPage() {
  const { user, logout } = useAuth()
  if (!user) return null

  return (
    <AppShell title="Hesab">
      <section className="account-info">
        <p className="account-name">{user.fullName}</p>
        <p className="account-email">{user.email}</p>
      </section>

      <div className="action-links">
        <Link className="action-card nav-card" to="/change-password">
          <span>Parolu dəyiş</span>
          <span className="nav-card-meta" aria-hidden="true">
            <span className="nav-card-chevron">›</span>
          </span>
        </Link>
      </div>

      <div className="account-logout">
        <button type="button" className="logout-button" onClick={logout}>
          Çıxış
        </button>
      </div>
    </AppShell>
  )
}
