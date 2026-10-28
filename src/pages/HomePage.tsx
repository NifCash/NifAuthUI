import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

export function HomePage() {
  const { user, logout } = useAuth()

  if (!user) return null

  return (
    <div className="app-shell">
      <header className="topbar">
        <p className="brand compact">NifCash</p>
        <nav>
          <Link to="/change-password">Parolu dəyiş</Link>
          <button type="button" className="linkish" onClick={logout}>
            Çıxış
          </button>
        </nav>
      </header>

      <main className="content">
        <h1>Salam, {user.fullName}</h1>
        <p className="lede">{user.email}</p>

        <dl className="profile-grid">
          <div>
            <dt>Status</dt>
            <dd>{user.isActive ? 'Aktiv' : 'Deaktiv'}</dd>
          </div>
          <div>
            <dt>SuperAdmin</dt>
            <dd>{user.isSuperAdmin ? 'Bəli' : 'Xeyr'}</dd>
          </div>
          <div>
            <dt>Rollar</dt>
            <dd>{user.roles.length ? user.roles.join(', ') : '—'}</dd>
          </div>
          <div>
            <dt>Əməliyyat hüququ</dt>
            <dd>{user.canOperate ? 'Var' : 'Yox'}</dd>
          </div>
        </dl>
      </main>
    </div>
  )
}
