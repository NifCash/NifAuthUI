import { Link, NavLink, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuth } from '../auth/AuthContext'
import { getCapabilities } from '../auth/capabilities'
import { usePendingCounts, type PendingCount, type PendingCounts } from '../hooks/usePendingCounts'
import { TabIcon, type TabIconName } from './TabIcons'

type Props = {
  children: ReactNode
  title: string
  lede?: string
  /** Pass counts if the page already loads them, to avoid duplicate requests. */
  pendingCounts?: PendingCounts
}

type Tab = {
  to: string
  label: string
  icon: TabIconName
  badge?: PendingCount
  /** Extra path prefixes that should mark this tab active. */
  alsoActive?: string[]
}

export function AppShell({ children, title, lede, pendingCounts }: Props) {
  const { user, logout } = useAuth()
  const location = useLocation()
  const caps = getCapabilities(user)
  const ownCounts = usePendingCounts({
    canApproveOrg: caps.canApproveOrg,
    canApproveBranch: caps.canApproveBranch,
    enabled: !pendingCounts,
  })

  if (!user) return null

  const counts = pendingCounts ?? ownCounts

  const tabs: Tab[] = [{ to: '/', label: 'Ana', icon: 'home' }]
  if (caps.canRequestOrg) tabs.push({ to: '/org-request', label: 'Org', icon: 'org' })
  if (caps.canApproveOrg) {
    tabs.push({ to: '/admin/org-requests', label: 'Org', icon: 'org', badge: counts.org })
  }
  if (caps.canApproveBranch) {
    tabs.push({ to: '/admin/branch-requests', label: 'Branch', icon: 'branch', badge: counts.branch })
  }
  if (caps.canManageOrg) tabs.push({ to: '/my-org', label: 'Org', icon: 'org' })
  if (caps.canManageRoles) tabs.push({ to: '/my-org/roles', label: 'Rollar', icon: 'roles' })
  if (caps.canRequestBranch) {
    tabs.push({ to: '/my-org/branch-request', label: 'Branch', icon: 'branch' })
  }
  tabs.push({ to: '/account', label: 'Hesab', icon: 'account', alsoActive: ['/change-password'] })

  function isActive(tab: Tab): boolean {
    const path = location.pathname
    if (tab.to === '/') return path === '/'
    if (path === tab.to) return true
    return Boolean(tab.alsoActive?.some((p) => path === p || path.startsWith(`${p}/`)))
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <Link to="/" className="brand compact">
          NifCash
        </Link>
        <nav className="topbar-nav">
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
      <nav className="tabbar" aria-label="Əsas naviqasiya">
        {tabs.map((tab) => {
          const active = isActive(tab)
          const showBadge = typeof tab.badge === 'number' && tab.badge > 0
          return (
            <Link
              key={tab.to}
              to={tab.to}
              className={active ? 'tab active' : 'tab'}
              aria-current={active ? 'page' : undefined}
            >
              <span className="tab-icon-wrap">
                <TabIcon name={tab.icon} />
                {showBadge ? (
                  <span className="tab-badge" aria-label={`${tab.badge} gözləyən sorğu`}>
                    {(tab.badge as number) > 99 ? '99+' : tab.badge}
                  </span>
                ) : null}
              </span>
              <span className="tab-label">{tab.label}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
