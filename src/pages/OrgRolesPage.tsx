import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { AppShell } from '../components/AppShell'
import { useAuth } from '../auth/AuthContext'
import {
  assignRole,
  createCustomRole,
  listOrgAssignments,
  listOrgRoles,
  listPermissions,
  lookupUser,
  revokeAssignment,
  type PermissionDto,
  type RoleAssignmentDto,
  type RoleDto,
} from '../api/orgApi'

export function OrgRolesPage() {
  const { user } = useAuth()
  const organizationId = user?.organizationId
  const [roles, setRoles] = useState<RoleDto[]>([])
  const [permissions, setPermissions] = useState<PermissionDto[]>([])
  const [assignments, setAssignments] = useState<RoleAssignmentDto[]>([])
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [roleCode, setRoleCode] = useState('')
  const [roleName, setRoleName] = useState('')
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([])

  const [assignEmail, setAssignEmail] = useState('')
  const [assignRoleCode, setAssignRoleCode] = useState('Cashier')

  const grantablePermissions = useMemo(() => {
    if (!user) return []
    if (user.permissions.includes('*')) return permissions
    return permissions.filter((p) => user.permissions.includes(p.code))
  }, [permissions, user])

  async function refresh() {
    if (!organizationId) return
    const [r, p, a] = await Promise.all([
      listOrgRoles(organizationId),
      listPermissions({ forOrganization: true }),
      listOrgAssignments(organizationId),
    ])
    setRoles(r)
    setPermissions(p)
    setAssignments(a)
  }

  useEffect(() => {
    void refresh().catch((err: unknown) =>
      setError(err instanceof Error ? err.message : 'Yükləmə xətası'),
    )
  }, [organizationId])

  async function onCreateRole(event: FormEvent) {
    event.preventDefault()
    if (!organizationId) return
    setError(null)
    setSuccess(null)
    try {
      await createCustomRole({
        code: roleCode.trim(),
        name: roleName.trim(),
        organizationId,
        permissionCodes: selectedPermissions,
      })
      setRoleCode('')
      setRoleName('')
      setSelectedPermissions([])
      setSuccess('Custom rol yaradıldı.')
      await refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Rol yaradılmadı')
    }
  }

  async function onAssign(event: FormEvent) {
    event.preventDefault()
    if (!organizationId) return
    setError(null)
    setSuccess(null)
    try {
      const found = await lookupUser(assignEmail.trim())
      if (!found) throw new Error('User tapılmadı')
      await assignRole({
        userId: found.id,
        roleCode: assignRoleCode,
        organizationId,
      })
      setAssignEmail('')
      setSuccess(`${found.email} üçün ${assignRoleCode} assign olundu.`)
      await refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Assign uğursuz')
    }
  }

  async function onRevoke(id: string) {
    setError(null)
    try {
      await revokeAssignment(id)
      await refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Revoke uğursuz')
    }
  }

  if (!organizationId) {
    return (
      <AppShell title="Rol idarəetmə" lede="Organization tələb olunur.">
        <p className="muted">Organization yoxdur.</p>
      </AppShell>
    )
  }

  return (
    <AppShell
      title="Permission & Role Management"
      lede="SuperOrgAdmin öz org-u üçün custom rol yarada və assign edə bilər."
    >
      {error ? <p className="form-error">{error}</p> : null}
      {success ? <p className="form-success">{success}</p> : null}

      <section className="split-panels">
        <form className="stack-form panel" onSubmit={onCreateRole}>
          <h2>Custom rol yarat</h2>
          <label>
            Kod
            <input value={roleCode} onChange={(e) => setRoleCode(e.target.value)} required />
          </label>
          <label>
            Ad
            <input value={roleName} onChange={(e) => setRoleName(e.target.value)} required />
          </label>
          <fieldset className="perm-list">
            <legend>Permissions</legend>
            {grantablePermissions.map((p) => {
              const checked = selectedPermissions.includes(p.code)
              return (
                <label key={p.id} className="check-row">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() =>
                      setSelectedPermissions((prev) =>
                        checked ? prev.filter((c) => c !== p.code) : [...prev, p.code],
                      )
                    }
                  />
                  <span>
                    <strong>{p.code}</strong>
                    <small>{p.name}</small>
                  </span>
                </label>
              )
            })}
          </fieldset>
          <button type="submit">Rol yarat</button>
        </form>

        <form className="stack-form panel" onSubmit={onAssign}>
          <h2>Rol assign et</h2>
          <label>
            User email
            <input
              type="email"
              value={assignEmail}
              onChange={(e) => setAssignEmail(e.target.value)}
              required
            />
          </label>
          <label>
            Rol
            <select value={assignRoleCode} onChange={(e) => setAssignRoleCode(e.target.value)}>
              {roles
                .filter((r) => r.code !== 'SuperAdmin' && r.code !== 'SuperAgent')
                .map((r) => (
                  <option key={r.id} value={r.code}>
                    {r.name} ({r.code})
                  </option>
                ))}
            </select>
          </label>
          <button type="submit">Assign</button>
        </form>
      </section>

      <section className="table-section">
        <h2>Mövcud assignment-lər</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Rol</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {assignments.map((a) => (
                <tr key={a.id}>
                  <td>
                    {a.userFullName}
                    <div className="muted">{a.userEmail}</div>
                  </td>
                  <td>{a.roleCode}</td>
                  <td>
                    <button type="button" className="secondary" onClick={() => void onRevoke(a.id)}>
                      Revoke
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </AppShell>
  )
}
