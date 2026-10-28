import { useEffect, useState } from 'react'
import { AppShell } from '../components/AppShell'
import {
  approveBranchRequest,
  listBranchRequests,
  rejectBranchRequest,
  type BranchCreateRequestDto,
} from '../api/orgApi'

export function AdminBranchRequestsPage() {
  const [items, setItems] = useState<BranchCreateRequestDto[]>([])
  const [error, setError] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)

  async function refresh() {
    setItems(await listBranchRequests({ status: 'Pending' }))
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
      await approveBranchRequest(id)
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
      await rejectBranchRequest(id, note)
      await refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'İmtina uğursuz')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <AppShell title="Branch request təsdiqi" lede="SuperOrgAdmin branch request-lərini təsdiq/imtina edin.">
      {error ? <p className="form-error">{error}</p> : null}
      {!items.length ? <p className="muted">Gözləyən request yoxdur.</p> : null}
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Branch</th>
              <th>Organization</th>
              <th>User</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td>
                  {item.name} <span className="muted">({item.code})</span>
                </td>
                <td>{item.organizationName}</td>
                <td>
                  {item.requesterFullName}
                  <div className="muted">{item.requesterEmail}</div>
                </td>
                <td className="row-actions">
                  <button type="button" disabled={busyId === item.id} onClick={() => void onApprove(item.id)}>
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
