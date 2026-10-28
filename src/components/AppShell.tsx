import { Link, NavLink } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuth } from '../auth/AuthContext'
import { getCapabilities } from '../auth/capabilities'

type Props = {
  children: ReactNode
  title: string
  lede?: string
}

export function AppShell({ children, title, lede }: Props) {
  const { user, logout } = useAuth()
  if (!user) return null

  const caps = getCapabilities(user)

  return (
    <div className="app-shell">
      <header className="topbar">
        <Link to="/" className="brand compact">
          NifCash
        </Link>
        <nav>
          {caps.canRequestOrg ? <NavLink to="/org-request">Org request</NavLink> : null}
          {caps.canApproveOrg ? <NavLink to="/admin/org-requests">Org təsdiq</NavLink> : null}
          {caps.canApproveBranch ? <NavLink to="/admin/branch-requests">Branch təsdiq</NavLink> : null}
          {caps.canManageOrg ? <NavLink to="/my-org">Org</NavLink> : null}
          {caps.canManageRoles ? <NavLink to="/my-org/roles">Rollar</NavLink> : null}
          {caps.canRequestBranch ? <NavLink to="/my-org/branch-request">Branch request</NavLink> : null}
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
