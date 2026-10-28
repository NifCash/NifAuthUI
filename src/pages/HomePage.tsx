import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { getCapabilities } from '../auth/capabilities'
import { AppShell } from '../components/AppShell'

export function HomePage() {
  const { user } = useAuth()
  if (!user) return null

  const caps = getCapabilities(user)

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
        {caps.canRequestOrg ? (
          <Link className="action-card" to="/org-request">
            Organization yaratmaq üçün request
          </Link>
        ) : null}
        {caps.canManageOrg ? (
          <Link className="action-card" to="/my-org">
            Organization idarəetmə
          </Link>
        ) : null}
        {caps.canManageRoles ? (
          <Link className="action-card" to="/my-org/roles">
            Rol və permission idarəetmə
          </Link>
        ) : null}
        {caps.canRequestBranch ? (
          <Link className="action-card" to="/my-org/branch-request">
            Yeni branch request
          </Link>
        ) : null}
        {caps.canApproveOrg ? (
          <Link className="action-card" to="/admin/org-requests">
            Gözləyən org request-lər
          </Link>
        ) : null}
        {caps.canApproveBranch ? (
          <Link className="action-card" to="/admin/branch-requests">
            Gözləyən branch request-lər
          </Link>
        ) : null}
      </div>
    </AppShell>
  )
}
