import { Link, NavLink } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuth } from '../auth/AuthContext'

type Props = {
  children: ReactNode
  title: string
  lede?: string
}

export function AppShell({ children, title, lede }: Props) {
  const { user, logout } = useAuth()
  if (!user) return null

  const isSuperAdmin = user.isSuperAdmin
  const isOrgAdmin = user.roles.includes('SuperOrgAdmin')
  // Only role-less customers (never SuperAdmin / OrgAdmin).
  const canRequestOrg = !isSuperAdmin && !user.organizationId && user.roles.length === 0
  // Global approve permission — SuperOrgAdmin never receives this permission.
  const canApproveOrg =
    isSuperAdmin ||
    (!isOrgAdmin && (user.permissions.includes('org.request.approve') || user.permissions.includes('*')))
  const canApproveBranch =
    isSuperAdmin || user.permissions.includes('branch.request.approve') || user.permissions.includes('*')

  return (
    <div className="app-shell">
      <header className="topbar">
        <Link to="/" className="brand compact">
          NifCash
        </Link>
        <nav>
          {canRequestOrg ? <NavLink to="/org-request">Org request</NavLink> : null}
          {canApproveOrg ? <NavLink to="/admin/org-requests">Org təsdiq</NavLink> : null}
          {canApproveBranch ? <NavLink to="/admin/branch-requests">Branch təsdiq</NavLink> : null}
          {isOrgAdmin && user.organizationId ? (
            <>
              <NavLink to="/my-org">Org</NavLink>
              <NavLink to="/my-org/roles">Rollar</NavLink>
              <NavLink to="/my-org/branch-request">Branch request</NavLink>
            </>
          ) : null}
          <NavLink to="/change-password">Parol</NavLink>
          <button type="button" className="linkish" onClick={logout}>
            Çıxış
          </button>
        </nav>
      </header>
      <main className="content">
        <h1>{title}</h1>
        {lede ? <p className="lede">{lede}</p> : null}
        {children}
      </main>
    </div>
  )
}
