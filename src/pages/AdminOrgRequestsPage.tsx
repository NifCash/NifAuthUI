import { useEffect, useState } from 'react'
import { AppShell } from '../components/AppShell'
import {
  approveOrgRequest,
  listOrgRequests,
  rejectOrgRequest,
  type OrganizationCreateRequestDto,
} from '../api/orgApi'

export function AdminOrgRequestsPage() {
  const [items, setItems] = useState<OrganizationCreateRequestDto[]>([])
  const [error, setError] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)

  async function refresh() {
    setItems(await listOrgRequests({ status: 'Pending' }))
  }

  useEffect(() => {
    void refresh().catch((err: unknown) =>
      setError(err instanceof Error ? err.message : 'Yükləmə xətası'),
    )
  }, [])

  async function onApprove(id: string) {
    setBusyId(id)
    setError(null)
    try {
      await approveOrgRequest(id)
      await refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Təsdiq uğursuz')
    } finally {
      setBusyId(null)
    }
  }

  async function onReject(id: string) {
    const note = window.prompt('İmtina səbəbi (opsional)') ?? undefined
    setBusyId(id)
    setError(null)
    try {
      await rejectOrgRequest(id, note)
      await refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'İmtina uğursuz')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <AppShell
      title="Organization request təsdiqi"
      lede="Təsdiq zamanı org + default MAIN branch yaradılır, requester SuperOrgAdmin olur."
    >
      {error ? <p className="form-error">{error}</p> : null}
      {!items.length ? <p className="muted">Gözləyən request yoxdur.</p> : null}
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Request</th>
              <th>User</th>
              <th>Tarix</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td>
                  {item.name} <span className="muted">({item.code})</span>
                </td>
                <td>
                  {item.requesterFullName}
                  <div className="muted">{item.requesterEmail}</div>
                </td>
                <td>{new Date(item.createdAt).toLocaleString()}</td>
                <td className="row-actions">
                  <button
                    type="button"
                    disabled={busyId === item.id}
                    onClick={() => void onApprove(item.id)}
                  >
                    Təsdiq
                  </button>
                  <button
                    type="button"
                    className="secondary"
                    disabled={busyId === item.id}
                    onClick={() => void onReject(item.id)}
                  >
                    İmtina
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppShell>
  )
}
