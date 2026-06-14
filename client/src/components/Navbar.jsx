import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  LayoutDashboard,
  FolderOpen,
  FilePlus,
  ShieldCheck,
  LogOut,
  ChevronDown,
  User,
} from 'lucide-react'
import { useState, useRef, useEffect } from 'react'

const NavItem = ({ to, icon: Icon, label }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
        isActive
          ? 'bg-brand-50 text-brand-700'
          : 'text-ink-muted hover:bg-surface-tertiary hover:text-ink'
      }`
    }
  >
    <Icon size={16} />
    {label}
  </NavLink>
)

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth()
  const navigate = useNavigate()
  const [dropOpen, setDropOpen] = useState(false)
  const dropRef = useRef(null)

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) {
        setDropOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="h-16 bg-surface border-b border-surface-border flex items-center px-4 sm:px-6 gap-4 sticky top-0 z-30">
      {/* Logo */}
      <Link to={isAdmin ? '/admin' : '/dashboard'} className="flex items-center gap-2.5 mr-2">
        <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center flex-shrink-0">
          <span className="text-white font-display font-bold text-sm">C</span>
        </div>
        <span className="font-display font-bold text-ink text-base hidden sm:block">
          ComplaintDesk
        </span>
      </Link>

      {/* Nav links */}
      <nav className="flex items-center gap-1 flex-1">
        {isAdmin ? (
          <NavItem to="/admin" icon={ShieldCheck} label="Admin Dashboard" />
        ) : (
          <>
            <NavItem to="/dashboard"    icon={LayoutDashboard} label="Dashboard" />
            <NavItem to="/complaints"   icon={FolderOpen}      label="My Complaints" />
            <NavItem to="/complaints/new" icon={FilePlus}      label="Raise Complaint" />
          </>
        )}
      </nav>

      {/* User dropdown */}
      <div className="relative" ref={dropRef}>
        <button
          onClick={() => setDropOpen((s) => !s)}
          className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-lg hover:bg-surface-tertiary transition-colors"
        >
          <div className="w-7 h-7 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0">
            <span className="text-brand-700 font-semibold text-xs uppercase">
              {user?.name?.charAt(0) || 'U'}
            </span>
          </div>
          <span className="text-sm font-medium text-ink hidden sm:block max-w-[120px] truncate">
            {user?.name}
          </span>
          <ChevronDown
            size={14}
            className={`text-ink-light transition-transform ${dropOpen ? 'rotate-180' : ''}`}
          />
        </button>

        {dropOpen && (
          <div className="absolute right-0 top-full mt-2 w-52 bg-surface rounded-xl border border-surface-border shadow-panel py-1 z-50 animate-slide-up">
            {/* User info */}
            <div className="px-4 py-3 border-b border-surface-border">
              <p className="text-sm font-semibold text-ink truncate">{user?.name}</p>
              <p className="text-xs text-ink-muted truncate">{user?.email}</p>
              {isAdmin && (
                <span className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-brand-700 bg-brand-50 px-2 py-0.5 rounded-full">
                  <ShieldCheck size={10} />
                  Admin
                </span>
              )}
            </div>

            {/* Profile link */}
            <button
              onClick={() => { setDropOpen(false) }}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-ink-muted hover:bg-surface-secondary hover:text-ink transition-colors"
            >
              <User size={15} />
              Profile
            </button>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
            >
              <LogOut size={15} />
              Sign out
            </button>
          </div>
        )}
      </div>
    </header>
  )
}