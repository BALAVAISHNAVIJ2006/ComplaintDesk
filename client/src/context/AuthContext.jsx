import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import axiosInstance from '../api/axios'
import toast from 'react-hot-toast'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [token, setToken]     = useState(() => localStorage.getItem('cd_token'))
  const [loading, setLoading] = useState(true)

  // Fetch current user profile on mount / token change
  useEffect(() => {
    if (!token) {
      setLoading(false)
      return
    }
    axiosInstance.get('/auth/me')
      .then(res => setUser(res.data.user))
      .catch(() => {
        localStorage.removeItem('cd_token')
        setToken(null)
        setUser(null)
      })
      .finally(() => setLoading(false))
  }, [token])

  const login = useCallback(async (email, password) => {
    const res = await axiosInstance.post('/auth/login', { email, password })
    const { token: jwt, user: userData } = res.data
    localStorage.setItem('cd_token', jwt)
    setToken(jwt)
    setUser(userData)
    return userData
  }, [])

  const register = useCallback(async (name, email, password) => {
    const res = await axiosInstance.post('/auth/register', { name, email, password })
    const { token: jwt, user: userData } = res.data
    localStorage.setItem('cd_token', jwt)
    setToken(jwt)
    setUser(userData)
    return userData
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('cd_token')
    setToken(null)
    setUser(null)
    toast.success('Logged out successfully')
  }, [])

  const isAdmin = user?.role === 'admin'

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}