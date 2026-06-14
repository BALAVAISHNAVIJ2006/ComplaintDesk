import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children }) {
  const { user, loading, isAdmin } = useAuth()

  if (loading) return null

  if (!user) return <Navigate to="/login" replace />

  // Prevent admin users from accessing regular user routes
  if (isAdmin) return <Navigate to="/admin" replace />

  return children
}