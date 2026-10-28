import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './auth/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { AdminBranchRequestsPage } from './pages/AdminBranchRequestsPage'
import { AdminOrgRequestsPage } from './pages/AdminOrgRequestsPage'
import { BranchRequestPage } from './pages/BranchRequestPage'
import { ChangePasswordPage } from './pages/ChangePasswordPage'
import { HomePage } from './pages/HomePage'
import { LoginPage } from './pages/LoginPage'
import { MyOrgPage } from './pages/MyOrgPage'
import { OrgRequestPage } from './pages/OrgRequestPage'
import { OrgRolesPage } from './pages/OrgRolesPage'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/change-password" element={<ChangePasswordPage />} />
            <Route path="/org-request" element={<OrgRequestPage />} />
            <Route path="/admin/org-requests" element={<AdminOrgRequestsPage />} />
            <Route path="/admin/branch-requests" element={<AdminBranchRequestsPage />} />
            <Route path="/my-org" element={<MyOrgPage />} />
            <Route path="/my-org/roles" element={<OrgRolesPage />} />
            <Route path="/my-org/branch-request" element={<BranchRequestPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
