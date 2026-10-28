import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AppShell } from '../components/AppShell'
import { useAuth } from '../auth/AuthContext'
import {
  getMyOrganization,
  listBranches,
  type BranchDto,
  type OrganizationDto,
} from '../api/orgApi'

export function MyOrgPage() {
  const { user } = useAuth()
  const [org, setOrg] = useState<OrganizationDto | null>(null)
  const [branches, setBranches] = useState<BranchDto[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    void (async () => {
      try {
        const mine = await getMyOrganization()
        setOrg(mine)
        if (mine) setBranches(await listBranches(mine.id))
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Yükləmə xətası')
      }
    })()
  }, [user?.organizationId])

  return (
    <AppShell title="Mənim Organization" lede="Default MAIN branch avtomatik yaradılır.">
      {error ? <p className="form-error">{error}</p> : null}
      {!org ? (
        <p className="muted">Organization tapılmadı.</p>
      ) : (
        <>
          <dl className="profile-grid">
            <div>
              <dt>Ad</dt>
              <dd>{org.name}</dd>
            </div>
            <div>
              <dt>Kod</dt>
              <dd>{org.code}</dd>
            </div>
          </dl>

          <div className="action-links">
            <Link className="action-card" to="/my-org/roles">
              Rol və permission idarəetmə
            </Link>
            <Link className="action-card" to="/my-org/branch-request">
              Yeni branch request
            </Link>
          </div>

          <section className="table-section">
            <h2>Branches</h2>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Ad</th>
                    <th>Kod</th>
                  </tr>
                </thead>
                <tbody>
                  {branches.map((b) => (
                    <tr key={b.id}>
                      <td>{b.name}</td>
                      <td>{b.code}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </AppShell>
  )
}
