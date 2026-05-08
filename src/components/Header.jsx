import { RefreshCw, Bell, Search } from 'lucide-react'
import { useState } from 'react'

export default function Header({ title, subtitle, onRefresh }) {
  const [refreshing, setRefreshing] = useState(false)

  const handleRefresh = () => {
    setRefreshing(true)
    setTimeout(() => setRefreshing(false), 1200)
    onRefresh?.()
  }

  return (
    <header className="h-16 bg-white border-b border-slate-100 flex items-center px-6 gap-4 flex-shrink-0">
      <div className="flex-1">
        <h1 className="text-slate-900 font-bold text-base leading-tight">{title}</h1>
        {subtitle && <p className="text-slate-400 text-xs">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-2">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            placeholder="Buscar cliente..."
            className="pl-8 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl
                       focus:outline-none focus:ring-2 focus:ring-cyan-400/30 focus:border-cyan-400
                       placeholder:text-slate-400 w-48 transition-all"
          />
        </div>

        {/* Refresh */}
        <button
          onClick={handleRefresh}
          className="btn-ghost flex items-center gap-2 text-xs">
          <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
          Atualizar dados
        </button>

        {/* Bell */}
        <button className="relative w-9 h-9 flex items-center justify-center rounded-xl hover:bg-slate-100 transition-colors text-slate-500">
          <Bell size={16} />
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-cyan-500" />
        </button>
      </div>
    </header>
  )
}
