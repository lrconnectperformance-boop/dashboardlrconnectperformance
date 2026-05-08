import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Users, History,
  LogOut, ChevronRight,
} from 'lucide-react'

const nav = [
  { to: '/dashboard', label: 'Dashboard Geral', icon: LayoutDashboard },
  { to: '/clientes', label: 'Clientes', icon: Users },
  { to: '/historico', label: 'Histórico', icon: History },
]

export default function Sidebar() {
  const navigate = useNavigate()

  return (
    <aside className="w-64 min-h-screen bg-sidebar flex flex-col flex-shrink-0 relative">
      {/* cyan glow top */}
      <div className="absolute top-0 left-0 right-0 h-32 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(0,212,255,0.08) 0%, transparent 70%)' }} />

      {/* Logo */}
      <div className="px-6 pt-8 pb-6 border-b border-white/8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0"
            style={{ background: 'rgba(255,255,255,0.06)' }}>
            <img src="/logo.svg" alt="L&R" className="w-8 h-8 object-contain" />
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-tight">L&amp;R Connect</p>
            <p className="text-cyan-400 text-xs font-medium">Performance</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        <p className="text-slate-600 text-xs font-semibold uppercase tracking-widest px-4 mb-3">Menu</p>
        {nav.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to}
            className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}>
            <Icon size={18} />
            <span className="flex-1">{label}</span>
            <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div className="px-4 pb-6 border-t border-white/8 pt-4">
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 cursor-pointer transition-all">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center overflow-hidden flex-shrink-0">
            <img src="/logo.svg" alt="LR" className="w-6 h-6 object-contain" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-semibold truncate">L&amp;R Connect</p>
            <p className="text-slate-500 text-xs truncate">Admin</p>
          </div>
          <button
            onClick={() => navigate('/')}
            className="text-slate-500 hover:text-red-400 transition-colors">
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </aside>
  )
}
