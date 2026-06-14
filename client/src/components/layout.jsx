import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  LayoutDashboard, FilePlus, FileText, ShieldCheck,
  LogOut, Menu, X, ChevronRight, Bell
} from 'lucide-react'
import { useState } from 'react'
import clsx from 'clsx'

const userNav = [
  { to: '/dashboard',      icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/complaints',     icon: FileText,         label: 'My Complaints' },
  { to: '/complaints/new', icon: FilePlus,         label: 'Raise Complaint' },
]

const adminNav = [
  { to: '/admin', icon: ShieldCheck, label: 'Admin Panel' },
]

export default function Layout() {
  const { user, isAdmin, logout } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Show only admin navigation items for admins; regular users see userNav
  const navItems = isAdmin ? adminNav : userNav

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const Sidebar = ({ mobile = false }) => (
    <div className={clsx(
      'flex flex-col h-full',
      mobile ? 'p-4' : 'p-5'
    )}>
      {/* Logo */}
      <div className="flex items-center gap-3 mb-8 px-1">
        <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center flex-shrink-0">
          <span className="text-white font-display font-bold text-base">C</span>
        </div>
        <div>
          <p className="font-display font-bold text-ink text-base leading-none">ComplaintDesk</p>
          <p className="text-[10px] text-ink-light mt-0.5">Ticket Management</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/dashboard' || to === '/admin'}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) => clsx(
              'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all',
              isActive
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-ink-muted hover:bg-surface-tertiary hover:text-ink'
            )}
          >
            <Icon size={18} />
            <span className="flex-1">{label}</span>
            <ChevronRight size={14} className="opacity-0 group-hover:opacity-40 transition-opacity" />
          </NavLink>
        ))}
      </nav>

      {/* User section */}
      <div className="border-t border-surface-border pt-4 space-y-2">
        {/* Role badge */}
        {isAdmin && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-brand-50 border border-brand-100">
            <ShieldCheck size={14} className="text-brand-600" />
            <span className="text-xs font-medium text-brand-700">Administrator</span>
          </div>
        )}

        {/* User info */}
        <div className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-surface-tertiary transition-colors">
          <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-semibold text-brand-700">
              {user?.name?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-ink truncate">{user?.name}</p>
            <p className="text-xs text-ink-light truncate">{user?.email}</p>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-ink-muted hover:bg-red-50 hover:text-red-600 transition-all"
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-surface-secondary flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-surface-border flex-shrink-0 fixed inset-y-0 left-0 z-30">
        <Sidebar />
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-ink/40 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile sidebar drawer */}
      <div className={clsx(
        'fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-300 lg:hidden',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <button
          onClick={() => setSidebarOpen(false)}
          className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-surface-tertiary transition-colors"
        >
          <X size={18} className="text-ink-muted" />
        </button>
        <Sidebar mobile />
      </div>

      {/* Main content */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Mobile top bar */}
        <header className="lg:hidden sticky top-0 z-20 bg-white border-b border-surface-border px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-xl hover:bg-surface-tertiary transition-colors"
          >
            <Menu size={20} className="text-ink-muted" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center">
              <span className="text-white font-display font-bold text-sm">C</span>
            </div>
            <span className="font-display font-bold text-ink">ComplaintDesk</span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}