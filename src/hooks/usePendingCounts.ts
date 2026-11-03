import { useEffect, useState } from 'react'
import { listBranchRequests, listOrgRequests } from '../api/orgApi'

/** `undefined` = loading, `null` = failed or not permitted, number = count. */
export type PendingCount = number | null | undefined

export type PendingCounts = {
  org: PendingCount
  branch: PendingCount
}

type Options = {
  canApproveOrg: boolean
  canApproveBranch: boolean
  enabled?: boolean
}

/** Loads pending org/branch request counts using the existing list endpoints. */
export function usePendingCounts({
  canApproveOrg,
  canApproveBranch,
  enabled = true,
}: Options): PendingCounts {
  const [org, setOrg] = useState<PendingCount>(canApproveOrg ? undefined : null)
  const [branch, setBranch] = useState<PendingCount>(canApproveBranch ? undefined : null)

  useEffect(() => {
    if (!enabled) return
    let cancelled = false

    if (canApproveOrg) {
      listOrgRequests({ status: 'Pending' })
        .then((items) => {
          if (!cancelled) setOrg(items.length)
        })
        .catch((err: unknown) => {
          console.error('[pending] org requests count failed', err)
          if (!cancelled) setOrg(null)
        })
    }

    if (canApproveBranch) {
      listBranchRequests({ status: 'Pending' })
        .then((items) => {
          if (!cancelled) setBranch(items.length)
        })
        .catch((err: unknown) => {
          console.error('[pending] branch requests count failed', err)
          if (!cancelled) setBranch(null)
        })
    }

    return () => {
      cancelled = true
    }
  }, [canApproveOrg, canApproveBranch, enabled])

  return { org, branch }
}
