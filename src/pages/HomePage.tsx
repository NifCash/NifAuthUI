import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { getCapabilities } from '../auth/capabilities'
import { AppShell } from '../components/AppShell'
import { usePendingCounts, type PendingCount } from '../hooks/usePendingCounts'

function formatCount(count: PendingCount): string {
  if (count === undefined) return '…'
  if (count === null) return '—'
  return String(count)
}

function PendingCard({ to, label, count }: { to: string; label: string; count: PendingCount }) {
  const hasPending = typeof count === 'number' && count > 0
  return (
    <Link className="action-card nav-card" to={to}>
      <span>{label}</span>
      <span className="nav-card-meta">
        <span className={hasPending ? 'nav-card-count pending' : 'nav-card-count'}>
          {formatCount(count)}
        </span>
        <span className="nav-card-chevron" aria-hidden="true">
          ›
        </span>
      </span>
    </Link>
  )
}

export function HomePage() {
  const { user } = useAuth()
  const caps = getCapabilities(user)
  const counts = usePendingCounts({
    canApproveOrg: caps.canApproveOrg,
    canApproveBranch: caps.canApproveBranch,
  })

  if (!user) return null

  return (
    <AppShell title={`Salam, ${user.fullName}`} lede={user.email} pendingCounts={counts}>
      <div className="chips">
        <span className={user.isActive ? 'chip' : 'chip muted-chip'}>
          {user.isActive ? 'Aktiv' : 'Deaktiv'}
        </span>
        {user.isSuperAdmin ? <span className="chip">SuperAdmin</span> : null}
      </div>

      <div className="profile-lines">
        {user.roles.length ? (
          <p>
            <span className="muted">Rollar:</span> {user.roles.join(', ')}
          </p>
        ) : null}
        {user.organizationId ? (
          <p>
            <span className="muted">Organization:</span>{' '}
            <span className="break-anywhere">{user.organizationId}</span>
          </p>
        ) : null}
      </div>

      <div className="action-links">
        {caps.canApproveOrg ? (
          <PendingCard to="/admin/org-requests" label="Gözləyən org sorğuları" count={counts.org} />
        ) : null}
        {caps.canApproveBranch ? (
          <PendingCard
            to="/admin/branch-requests"
            label="Gözləyən branch sorğuları"
            count={counts.branch}
          />
        ) : null}
        {caps.canRequestOrg ? (
          <Link className="action-card nav-card" to="/org-request">
            <span>Organization yaratmaq üçün request</span>
            <span className="nav-card-chevron" aria-hidden="true">›</span>
          </Link>
        ) : null}
        {caps.canManageOrg ? (
          <Link className="action-card nav-card" to="/my-org">
            <span>Organization idarəetmə</span>
            <span className="nav-card-chevron" aria-hidden="true">›</span>
          </Link>
        ) : null}
        {caps.canManageRoles ? (
          <Link className="action-card nav-card" to="/my-org/roles">
            <span>Rol və permission idarəetmə</span>
            <span className="nav-card-chevron" aria-hidden="true">›</span>
          </Link>
        ) : null}
        {caps.canRequestBranch ? (
          <Link className="action-card nav-card" to="/my-org/branch-request">
            <span>Yeni branch request</span>
            <span className="nav-card-chevron" aria-hidden="true">›</span>
          </Link>
        ) : null}
      </div>
    </AppShell>
  )
}
