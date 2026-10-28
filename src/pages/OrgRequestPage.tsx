import { useEffect, useState, type FormEvent } from 'react'
import { AppShell } from '../components/AppShell'
import { listOrgRequests, submitOrgRequest, type OrganizationCreateRequestDto } from '../api/orgApi'
import { useAuth } from '../auth/AuthContext'
import { getCapabilities } from '../auth/capabilities'

export function OrgRequestPage() {
  const { user } = useAuth()
  const caps = getCapabilities(user)
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [items, setItems] = useState<OrganizationCreateRequestDto[]>([])
  const [submitting, setSubmitting] = useState(false)

  async function refresh() {
    setItems(await listOrgRequests({ mine: true }))
  }

  useEffect(() => {
    void refresh().catch((err: unknown) =>
      setError(err instanceof Error ? err.message : 'Yükləmə xətası'),
    )
  }, [])

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    if (!caps.canRequestOrg) return
    setError(null)
    setSuccess(null)
    setSubmitting(true)
    try {
      await submitOrgRequest(name.trim(), code.trim())
      setSuccess('Request göndərildi. SuperAdmin təsdiqini gözləyin.')
      setName('')
      setCode('')
      await refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Request uğursuz oldu')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AppShell
      title="Organization request"
      lede="Rol-suz istifadəçi org yaratmaq üçün request aça bilər."
    >
      {caps.canRequestOrg ? (
        <form className="stack-form panel" onSubmit={onSubmit}>
          <label>
            Ad
            <input value={name} onChange={(e) => setName(e.target.value)} required />
          </label>
          <label>
            Kod
            <input value={code} onChange={(e) => setCode(e.target.value)} required />
          </label>
          {error ? <p className="form-error">{error}</p> : null}
          {success ? <p className="form-success">{success}</p> : null}
          <button type="submit" disabled={submitting}>
            {submitting ? 'Göndərilir…' : 'Request göndər'}
          </button>
        </form>
      ) : (
        <p className="muted">Bu əməliyyat üçün icazəniz yoxdur.</p>
      )}

      <section className="table-section">
        <h2>Mənim request-lərim</h2>
        <RequestTable items={items} />
      </section>
    </AppShell>
  )
}

function RequestTable({ items }: { items: OrganizationCreateRequestDto[] }) {
  if (!items.length) return <p className="muted">Hələ request yoxdur.</p>
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Ad</th>
            <th>Kod</th>
            <th>Status</th>
            <th>Tarix</th>
            <th>Qeyd</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td>{item.name}</td>
              <td>{item.code}</td>
              <td>{item.status}</td>
              <td>{new Date(item.createdAt).toLocaleString()}</td>
              <td>{item.reviewNote || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
