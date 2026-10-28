import type { MeResponse } from '../api/authApi'

function hasPermission(user: MeResponse, code: string): boolean {
  if (user.isSuperAdmin) return true
  if (user.permissions.includes('*')) return true
  return user.permissions.includes(code)
}

export type Capabilities = {
  canRequestOrg: boolean
  canApproveOrg: boolean
  canRequestBranch: boolean
  canApproveBranch: boolean
  canManageOrg: boolean
  canManageRoles: boolean
}

export function getCapabilities(user: MeResponse | null | undefined): Capabilities {
  if (!user) {
    return {
      canRequestOrg: false,
      canApproveOrg: false,
      canRequestBranch: false,
      canApproveBranch: false,
      canManageOrg: false,
      canManageRoles: false,
    }
  }

  const isOrgAdmin = user.roles.includes('SuperOrgAdmin')
  const hasOrg = Boolean(user.organizationId)

  // Only role-less customers may submit org create requests.
  const canRequestOrg = !user.isSuperAdmin && !hasOrg && user.roles.length === 0

  // Global approve — never for SuperOrgAdmin even if somehow present.
  const canApproveOrg =
    user.isSuperAdmin ||
    (!isOrgAdmin && hasPermission(user, 'org.request.approve'))

  const canRequestBranch =
    hasOrg && (isOrgAdmin || hasPermission(user, 'branch.request.create'))

  // Global approve — SuperOrgAdmin must not get this via org-scoped roles.
  const canApproveBranch =
    user.isSuperAdmin ||
    (!isOrgAdmin && hasPermission(user, 'branch.request.approve'))

  const canManageOrg = hasOrg && (isOrgAdmin || hasPermission(user, 'org.manage'))

  const canManageRoles =
    hasOrg && (isOrgAdmin || hasPermission(user, 'roles.manage'))

  return {
    canRequestOrg,
    canApproveOrg,
    canRequestBranch,
    canApproveBranch,
    canManageOrg,
    canManageRoles,
  }
}
