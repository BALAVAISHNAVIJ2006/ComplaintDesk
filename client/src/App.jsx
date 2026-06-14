import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'

// Pages
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import RaiseComplaint from './pages/RaiseComplaint'
import MyComplaints from './pages/MyComplaints'
import ComplaintDetail from './pages/ComplaintDetail'
import EditComplaint from './pages/EditComplaint'
import AdminDashboard from './pages/AdminDashboard'
import AdminComplaintView from './pages/AdminComplaintView'

// Components
import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/AdminRoute'
import Layout from './components/Layout'

export default function App() {
  const { user, loading, isAdmin } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-secondary">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-4 border-brand-200 border-t-brand-600 animate-spin" />
          <p className="text-sm text-ink-muted font-medium">Loading ComplaintDesk…</p>
        </div>
      </div>
    )
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={!user ? <Login /> : <Navigate to={isAdmin ? '/admin' : '/dashboard'} replace />} />
      <Route path="/register" element={!user ? <Register /> : <Navigate to={isAdmin ? '/admin' : '/dashboard'} replace />} />

      {/* Protected user routes */}
      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/complaints" element={<MyComplaints />} />
        <Route path="/complaints/new" element={<RaiseComplaint />} />
        <Route path="/complaints/:id" element={<ComplaintDetail />} />
        <Route path="/complaints/:id/edit" element={<EditComplaint />} />
      </Route>

      {/* Protected admin routes */}
      <Route element={<AdminRoute><Layout /></AdminRoute>}>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/complaints/:id" element={<AdminComplaintView />} />
      </Route>

      {/* Fallback */}
      <Route path="/" element={<Navigate to={user ? (isAdmin ? '/admin' : '/dashboard') : '/login'} replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}