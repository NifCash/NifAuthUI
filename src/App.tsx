import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './auth/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { RequireCapability } from './components/RequireCapability'
import { AdminBranchRequestsPage } from './pages/AdminBranchRequestsPage'
import { AdminOrgRequestsPage } from './pages/AdminOrgRequestsPage'
import { BranchRequestPage } from './pages/BranchRequestPage'
import { ChangePasswordPage } from './pages/ChangePasswordPage'
import { HomePage } from './pages/HomePage'
import { LoginPage } from './pages/LoginPage'
import { MyOrgPage } from './pages/MyOrgPage'
import { OrgRequestPage } from './pages/OrgRequestPage'
import { OrgRolesPage } from './pages/OrgRolesPage'
import { RegisterPage } from './pages/RegisterPage'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/change-password" element={<ChangePasswordPage />} />
            <Route
              path="/org-request"
              element={
                <RequireCapability when={(c) => c.canRequestOrg}>
                  <OrgRequestPage />
                </RequireCapability>
              }
            />
            <Route
              path="/admin/org-requests"
              element={
                <RequireCapability when={(c) => c.canApproveOrg}>
                  <AdminOrgRequestsPage />
                </RequireCapability>
              }
            />
            <Route
              path="/admin/branch-requests"
              element={
                <RequireCapability when={(c) => c.canApproveBranch}>
                  <AdminBranchRequestsPage />
                </RequireCapability>
              }
            />
            <Route
              path="/my-org"
              element={
                <RequireCapability when={(c) => c.canManageOrg}>
                  <MyOrgPage />
                </RequireCapability>
              }
            />
            <Route
              path="/my-org/roles"
              element={
                <RequireCapability when={(c) => c.canManageRoles}>
                  <OrgRolesPage />
                </RequireCapability>
              }
            />
            <Route
              path="/my-org/branch-request"
              element={
                <RequireCapability when={(c) => c.canRequestBranch}>
                  <BranchRequestPage />
                </RequireCapability>
              }
            />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
