import { Link, NavLink } from 'react-router-dom'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useAuth } from '../auth/AuthContext'
import { getCapabilities } from '../auth/capabilities'

type Props = {
  children: ReactNode
  title: string
  lede?: string
}

export function AppShell({ children, title, lede }: Props) {
  const { user, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const toggleRef = useRef<HTMLButtonElement>(null)
  const navRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!menuOpen) return

    navRef.current?.querySelector<HTMLElement>('a, button')?.focus()

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setMenuOpen(false)
        toggleRef.current?.focus()
      }
    }

    function onPointerDown(event: PointerEvent) {
      const target = event.target as Node
      if (navRef.current?.contains(target) || toggleRef.current?.contains(target)) return
      setMenuOpen(false)
    }

    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('pointerdown', onPointerDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('pointerdown', onPointerDown)
    }
  }, [menuOpen])

  if (!user) return null

  const caps = getCapabilities(user)

  return (
    <div className="app-shell">
      <header className="topbar">
        <Link to="/" className="brand compact">
          NifCash
        </Link>
        <button
          ref={toggleRef}
          type="button"
          className="menu-toggle"
          aria-label="Menyu"
          aria-expanded={menuOpen}
          aria-controls="topbar-nav"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
          </svg>
        </button>
        <nav
          id="topbar-nav"
          ref={navRef}
          className={menuOpen ? 'is-open' : undefined}
          onClick={() => setMenuOpen(false)}
        >
          {caps.canRequestOrg ? <NavLink to="/org-request">Org request</NavLink> : null}
          {caps.canApproveOrg ? <NavLink to="/admin/org-requests">Org təsdiq</NavLink> : null}
          {caps.canApproveBranch ? <NavLink to="/admin/branch-requests">Branch təsdiq</NavLink> : null}
          {caps.canManageOrg ? <NavLink to="/my-org">Org</NavLink> : null}
          {caps.canManageRoles ? <NavLink to="/my-org/roles">Rollar</NavLink> : null}
          {caps.canRequestBranch ? <NavLink to="/my-org/branch-request">Branch request</NavLink> : null}
          <NavLink to="/profile">Profil</NavLink>
          <NavLink to="/change-password">Parol</NavLink>
          <button type="button" className="linkish menu-logout" onClick={logout}>
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
