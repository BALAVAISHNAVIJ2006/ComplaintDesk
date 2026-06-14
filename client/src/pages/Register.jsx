import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { Eye, EyeOff, UserPlus } from 'lucide-react'

export default function Register() {
  const { register } = useAuth()
  const navigate     = useNavigate()

  const [form, setForm]         = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading]   = useState(false)
  const [errors, setErrors]     = useState({})

  const validate = () => {
    const e = {}
    if (!form.name.trim())            e.name    = 'Full name is required'
    if (!form.email)                  e.email   = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email'
    if (!form.password)               e.password = 'Password is required'
    else if (form.password.length < 6) e.password = 'Password must be at least 6 characters'
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (ev) => {
    ev.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      const user = await register(form.name.trim(), form.email, form.password)
      toast.success(`Account created! Welcome, ${user.name}!`)
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const field = (id, label, type, placeholder, key, extra = {}) => (
    <div>
      <label className="label" htmlFor={id}>{label}</label>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        value={form[key]}
        onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
        className={`input ${errors[key] ? 'border-red-300 focus:border-red-400 focus:ring-red-400/20' : ''}`}
        {...extra}
      />
      {errors[key] && <p className="text-xs text-red-500 mt-1">{errors[key]}</p>}
    </div>
  )

  return (
    <div className="min-h-screen bg-surface-secondary flex items-center justify-center p-4">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-brand-100/60 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-brand-50 blur-3xl" />
      </div>

      <div className="w-full max-w-md animate-slide-up relative">
        <div className="text-center mb-8">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-brand-600 items-center justify-center mb-4 shadow-panel">
            <span className="text-white font-display font-bold text-2xl">C</span>
          </div>
          <h1 className="font-display text-3xl font-bold text-ink">Create account</h1>
          <p className="text-ink-muted text-sm mt-1">Join ComplaintDesk today</p>
        </div>

        <div className="card p-8 shadow-panel">
          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            {field('name', 'Full Name', 'text', 'John Doe', 'name', { autoComplete: 'name' })}
            {field('email', 'Email Address', 'email', 'you@example.com', 'email', { autoComplete: 'email' })}

            {/* Password */}
            <div>
              <label className="label" htmlFor="password">Password</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPass ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Min. 6 characters"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  className={`input pr-11 ${errors.password ? 'border-red-300 focus:border-red-400 focus:ring-red-400/20' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-light hover:text-ink-muted transition-colors"
                >
                  {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="label" htmlFor="confirmPassword">Confirm Password</label>
              <input
                id="confirmPassword"
                type={showPass ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="Repeat password"
                value={form.confirmPassword}
                onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))}
                className={`input ${errors.confirmPassword ? 'border-red-300 focus:border-red-400 focus:ring-red-400/20' : ''}`}
              />
              {errors.confirmPassword && <p className="text-xs text-red-500 mt-1">{errors.confirmPassword}</p>}
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3 text-base mt-2">
              {loading
                ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <UserPlus size={18} />
              }
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-ink-muted mt-5">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-600 font-medium hover:text-brand-700 transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}