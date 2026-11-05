import { test } from 'node:test'
import assert from 'node:assert/strict'
import { getCapabilities } from '../src/auth/capabilities.ts'

const base = {
  isSuperAdmin: false,
  roles: [] as string[],
  permissions: [] as string[],
  organizationId: null as string | null,
}

test('no user gives no capabilities', () => {
  const caps = getCapabilities(null)
  assert.equal(caps.canRequestOrg, false)
  assert.equal(caps.canManageOrg, false)
  assert.equal(caps.canApproveBranch, false)
})

test('role-less customer without org can request an org', () => {
  const caps = getCapabilities({ ...base } as any)
  assert.equal(caps.canRequestOrg, true)
  assert.equal(caps.canRequestBranch, false)
})

test('user with an org cannot request another org', () => {
  const caps = getCapabilities({ ...base, organizationId: 'org-1' } as any)
  assert.equal(caps.canRequestOrg, false)
})

test('SuperOrgAdmin manages own org but cannot approve globally', () => {
  const caps = getCapabilities({
    ...base,
    roles: ['SuperOrgAdmin'],
    organizationId: 'org-1',
    permissions: ['branch.request.approve', 'org.request.approve'],
  } as any)
  assert.equal(caps.canManageOrg, true)
  assert.equal(caps.canManageRoles, true)
  assert.equal(caps.canApproveOrg, false)
  assert.equal(caps.canApproveBranch, false)
})

test('super admin can approve org and branch requests', () => {
  const caps = getCapabilities({ ...base, isSuperAdmin: true } as any)
  assert.equal(caps.canApproveOrg, true)
  assert.equal(caps.canApproveBranch, true)
  assert.equal(caps.canRequestOrg, false)
})

test('wildcard permission grants branch request within an org', () => {
  const caps = getCapabilities({
    ...base,
    organizationId: 'org-1',
    roles: ['Member'],
    permissions: ['*'],
  } as any)
  assert.equal(caps.canRequestBranch, true)
})
