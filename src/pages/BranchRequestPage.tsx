import { useEffect, useState, type FormEvent } from 'react'
import { AppShell } from '../components/AppShell'
import { useAuth } from '../auth/AuthContext'
import { getCapabilities } from '../auth/capabilities'
import {
  listBranchRequests,
  submitBranchRequest,
  type BranchCreateRequestDto,
} from '../api/orgApi'

export function BranchRequestPage() {
  const { user } = useAuth()
  const caps = getCapabilities(user)
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [items, setItems] = useState<BranchCreateRequestDto[]>([])
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const organizationId = user?.organizationId

  async function refresh() {
    if (!organizationId) return
    setItems(await listBranchRequests({ organizationId, mine: true }))
  }

  useEffect(() => {
    void refresh().catch((err: unknown) =>
      setError(err instanceof Error ? err.message : 'Yükləmə xətası'),
    )
  }, [organizationId])

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    if (!organizationId || !caps.canRequestBranch) return
    setError(null)
    setSuccess(null)
    setSubmitting(true)
    try {
      await submitBranchRequest(organizationId, name.trim(), code.trim())
      setSuccess('Branch request göndərildi.')
      setName('')
      setCode('')
      await refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Request uğursuz')
    } finally {
      setSubmitting(false)
    }
  }

  if (!organizationId) {
    return (
      <AppShell title="Branch request" lede="Əvvəlcə organization-ınız olmalıdır.">
        <p className="muted">Organization yoxdur.</p>
      </AppShell>
    )
  }

  return (
    <AppShell
      title="Branch request"
      lede="Yeni branch üçün request göndərin. Təsdiq ayrı permission-dur."
    >
      {caps.canRequestBranch ? (
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
        <h2>Mənim branch request-lərim</h2>
        {!items.length ? <p className="muted">Hələ request yoxdur.</p> : null}
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Ad</th>
                <th>Kod</th>
                <th>Status</th>
                <th>Qeyd</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td>{item.name}</td>
                  <td>{item.code}</td>
                  <td>{item.status}</td>
                  <td>{item.reviewNote || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </AppShell>
  )
}
