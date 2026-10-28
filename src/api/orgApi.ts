import { apiJson } from './client'

export type OrganizationDto = { id: string; name: string; code: string }
export type BranchDto = { id: string; organizationId: string; name: string; code: string }

export type OrganizationCreateRequestDto = {
  id: string
  requesterUserId: string
  requesterEmail: string
  requesterFullName: string
  name: string
  code: string
  status: string
  reviewerUserId?: string | null
  reviewNote?: string | null
  createdAt: string
  reviewedAt?: string | null
  createdOrganizationId?: string | null
}

export type BranchCreateRequestDto = {
  id: string
  requesterUserId: string
  requesterEmail: string
  requesterFullName: string
  organizationId: string
  organizationName: string
  name: string
  code: string
  status: string
  reviewerUserId?: string | null
  reviewNote?: string | null
  createdAt: string
  reviewedAt?: string | null
  createdBranchId?: string | null
}

export type RoleDto = {
  id: string
  code: string
  name: string
  isSystem: boolean
  organizationId?: string | null
  agentCompanyId?: string | null
}

export type PermissionDto = {
  id: string
  code: string
  name: string
  description: string
}

export type RoleAssignmentDto = {
  id: string
  userId: string
  userEmail: string
  userFullName: string
  roleId: string
  roleCode: string
  roleName: string
  organizationId?: string | null
  branchId?: string | null
  agentCompanyId?: string | null
}

export type UserLookupDto = {
  id: string
  email: string
  fullName: string
  isActive: boolean
}

export function listOrgRequests(params?: { status?: string; mine?: boolean }) {
  const q = new URLSearchParams()
  if (params?.status) q.set('status', params.status)
  if (params?.mine) q.set('mine', 'true')
  const suffix = q.toString() ? `?${q}` : ''
  return apiJson<OrganizationCreateRequestDto[]>(`/api/organization-requests${suffix}`)
}

export function submitOrgRequest(name: string, code: string) {
  return apiJson<OrganizationCreateRequestDto>('/api/organization-requests', {
    method: 'POST',
    body: JSON.stringify({ name, code }),
  })
}

export function approveOrgRequest(id: string, note?: string) {
  return apiJson<OrganizationCreateRequestDto>(`/api/organization-requests/${id}/approve`, {
    method: 'POST',
    body: JSON.stringify({ note: note || null }),
  })
}

export function rejectOrgRequest(id: string, note?: string) {
  return apiJson<OrganizationCreateRequestDto>(`/api/organization-requests/${id}/reject`, {
    method: 'POST',
    body: JSON.stringify({ note: note || null }),
  })
}

export function listBranchRequests(params?: { organizationId?: string; status?: string; mine?: boolean }) {
  const q = new URLSearchParams()
  if (params?.organizationId) q.set('organizationId', params.organizationId)
  if (params?.status) q.set('status', params.status)
  if (params?.mine) q.set('mine', 'true')
  const suffix = q.toString() ? `?${q}` : ''
  return apiJson<BranchCreateRequestDto[]>(`/api/branch-requests${suffix}`)
}

export function submitBranchRequest(organizationId: string, name: string, code: string) {
  return apiJson<BranchCreateRequestDto>('/api/branch-requests', {
    method: 'POST',
    body: JSON.stringify({ organizationId, name, code }),
  })
}

export function approveBranchRequest(id: string, note?: string) {
  return apiJson<BranchCreateRequestDto>(`/api/branch-requests/${id}/approve`, {
    method: 'POST',
    body: JSON.stringify({ note: note || null }),
  })
}

export function rejectBranchRequest(id: string, note?: string) {
  return apiJson<BranchCreateRequestDto>(`/api/branch-requests/${id}/reject`, {
    method: 'POST',
    body: JSON.stringify({ note: note || null }),
  })
}

export function getMyOrganization() {
  return apiJson<OrganizationDto | null>('/api/organizations/mine')
}

export function listBranches(organizationId: string) {
  return apiJson<BranchDto[]>(`/api/organizations/${organizationId}/branches`)
}

export function listOrgAssignments(organizationId: string) {
  return apiJson<RoleAssignmentDto[]>(`/api/organizations/${organizationId}/assignments`)
}

export function listOrgRoles(organizationId: string) {
  return apiJson<RoleDto[]>(`/api/organizations/${organizationId}/roles`)
}

export function listPermissions() {
  return apiJson<PermissionDto[]>('/api/roles/permissions')
}

export function createCustomRole(body: {
  code: string
  name: string
  permissionCodes: string[]
  organizationId: string
  description?: string
}) {
  return apiJson<RoleDto>('/api/roles/custom', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export function assignRole(body: {
  userId: string
  roleCode: string
  organizationId?: string
  branchId?: string
}) {
  return apiJson<void>('/api/roles/assign', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export function revokeAssignment(assignmentId: string) {
  return apiJson<void>(`/api/roles/assignments/${assignmentId}`, { method: 'DELETE' })
}

export function lookupUser(email: string) {
  return apiJson<UserLookupDto | null>(`/api/users/lookup?email=${encodeURIComponent(email)}`)
}
