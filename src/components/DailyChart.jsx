import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Area, AreaChart, ReferenceLine,
} from 'recharts'
import { fmtShortDate } from '../utils/metrics'

const COLORS = ['#06B6D4', '#8B5CF6', '#F59E0B', '#10B981', '#EF4444']

const CustomTooltip = ({ active, payload, label, formatter }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="glass-dark rounded-xl px-3 py-2.5 shadow-xl text-xs">
      <p className="text-slate-300 mb-1.5 font-medium">{label}</p>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-slate-400">{p.name}:</span>
          <span className="text-white font-semibold">
            {formatter ? formatter(p.value) : p.value}
          </span>
        </div>
      ))}
    </div>
  )
}

/** Single-series area chart */
export function SingleAreaChart({ data, dataKey, name, color = '#06B6D4', formatter, height = 200, goal }) {
  const formatted = data.map(d => ({
    ...d,
    date: fmtShortDate(d.date),
  }))

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={formatted} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id={`grad-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.2} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
        <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94A3B8' }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
        <YAxis tick={{ fontSize: 10, fill: '#94A3B8' }} tickLine={false} axisLine={false}
          tickFormatter={v => formatter ? formatter(v) : v} />
        <Tooltip content={<CustomTooltip formatter={formatter} />} />
        {goal && <ReferenceLine y={goal} stroke={color} strokeDasharray="4 4" strokeOpacity={0.5} />}
        <Area type="monotone" dataKey={dataKey} name={name} stroke={color} strokeWidth={2}
          fill={`url(#grad-${dataKey})`} dot={false} activeDot={{ r: 4, strokeWidth: 2 }} />
      </AreaChart>
    </ResponsiveContainer>
  )
}

/** Multi-series line chart */
export function MultiLineChart({ data, series, height = 220 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
        <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94A3B8' }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
        <YAxis tick={{ fontSize: 10, fill: '#94A3B8' }} tickLine={false} axisLine={false} />
        <Tooltip content={<CustomTooltip />} />
        {series.map((s, i) => (
          <Line key={s.key} type="monotone" dataKey={s.key} name={s.name}
            stroke={s.color || COLORS[i % COLORS.length]}
            strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
        ))}
      </LineChart>
    </ResponsiveContainer>
  )
}

/** Chart card wrapper */
export function ChartCard({ title, subtitle, children, actions }) {
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
          {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
        </div>
        {actions}
      </div>
      {children}
    </div>
  )
}
