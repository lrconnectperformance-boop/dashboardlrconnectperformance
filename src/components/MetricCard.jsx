import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { fmtPct } from '../utils/metrics'

export default function MetricCard({
  label, value, goal, pct, status, icon: Icon, color = '#06B6D4', trend,
  subLabel, compact = false,
}) {
  const statusColors = {
    green: 'from-emerald-500/10 to-emerald-500/5 border-emerald-200/60',
    yellow: 'from-amber-500/10 to-amber-500/5 border-amber-200/60',
    red: 'from-red-500/10 to-red-500/5 border-red-200/60',
    gray: 'from-slate-100 to-slate-50 border-slate-200',
  }
  const barColors = { green: 'bg-emerald-500', yellow: 'bg-amber-400', red: 'bg-red-500', gray: 'bg-slate-300' }
  const barPct = Math.min(pct || 0, 100)

  if (compact) {
    return (
      <div className={`card p-4 bg-gradient-to-br ${statusColors[status] || statusColors.gray}`}>
        <div className="flex items-start justify-between mb-1">
          <span className="text-xs text-slate-500 font-medium">{label}</span>
          {Icon && <Icon size={14} className="text-slate-400" />}
        </div>
        <div className="text-lg font-bold text-slate-800">{value}</div>
        {pct !== undefined && (
          <div className={`w-full h-1 rounded-full bg-slate-200 mt-2`}>
            <div className={`h-1 rounded-full ${barColors[status]}`} style={{ width: `${barPct}%` }} />
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="card card-hover p-5 relative overflow-hidden">
      {/* accent bar */}
      <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl"
        style={{ background: `linear-gradient(90deg, ${color}, transparent)` }} />

      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">{label}</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
          {subLabel && <p className="text-xs text-slate-400 mt-0.5">{subLabel}</p>}
        </div>
        {Icon && (
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: `${color}18` }}>
            <Icon size={18} style={{ color }} />
          </div>
        )}
      </div>

      {goal !== undefined && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Meta: {goal}</span>
            <span className={`font-semibold ${
              status === 'green' ? 'text-emerald-600' :
              status === 'yellow' ? 'text-amber-600' : 'text-red-600'
            }`}>
              {fmtPct(pct)}
            </span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-slate-100">
            <div
              className={`h-1.5 rounded-full transition-all duration-500 ${barColors[status] || barColors.gray}`}
              style={{ width: `${barPct}%` }}
            />
          </div>
        </div>
      )}

      {trend !== undefined && (
        <div className={`flex items-center gap-1 mt-2 text-xs font-semibold ${
          trend > 0 ? 'text-emerald-600' : trend < 0 ? 'text-red-500' : 'text-slate-400'
        }`}>
          {trend > 0 ? <TrendingUp size={12} /> : trend < 0 ? <TrendingDown size={12} /> : <Minus size={12} />}
          {trend > 0 ? '+' : ''}{trend}% vs período anterior
        </div>
      )}
    </div>
  )
}
