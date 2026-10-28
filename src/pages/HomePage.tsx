import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { AppShell } from '../components/AppShell'

export function HomePage() {
  const { user } = useAuth()
  if (!user) return null

  const canRequestOrg =
    !user.organizationId &&
    (user.roles.length === 0 ||
      user.permissions.includes('org.request.create') ||
      user.permissions.includes('*'))

  return (
    <AppShell title={`Salam, ${user.fullName}`} lede={user.email}>
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
          <dd>{user.roles.length ? user.roles.join(', ') : 'Rol yoxdur'}</dd>
        </div>
        <div>
          <dt>Organization</dt>
          <dd>{user.organizationId ? user.organizationId : '—'}</dd>
        </div>
      </dl>

      <div className="action-links">
        {canRequestOrg ? (
          <Link className="action-card" to="/org-request">
            Organization yaratmaq üçün request
          </Link>
        ) : null}
        {user.roles.includes('SuperOrgAdmin') ? (
          <Link className="action-card" to="/my-org">
            Organization idarəetmə
          </Link>
        ) : null}
        {user.isSuperAdmin ? (
          <Link className="action-card" to="/admin/org-requests">
            Gözləyən org request-lər
          </Link>
        ) : null}
      </div>
    </AppShell>
  )
}
