import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'

const RADIAN = Math.PI / 180
const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, value, name }) => {
  if (value === 0) return null
  const r = innerRadius + (outerRadius - innerRadius) * 0.5
  const x = cx + r * Math.cos(-midAngle * RADIAN)
  const y = cy + r * Math.sin(-midAngle * RADIAN)
  return (
    <text x={x} y={y} fill="#fff" textAnchor="middle" dominantBaseline="central" fontSize={13} fontWeight={700}>
      {value}
    </text>
  )
}

export default function DonutChart({ green = 0, yellow = 0, red = 0 }) {
  const data = [
    { name: 'Meta alcançada', value: green, color: '#10B981' },
    { name: 'Em atenção', value: yellow, color: '#F59E0B' },
    { name: 'Abaixo do projetado', value: red, color: '#EF4444' },
  ].filter(d => d.value > 0)

  const total = green + yellow + red

  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={55} outerRadius={80}
            dataKey="value" labelLine={false} label={renderLabel} strokeWidth={2} stroke="#fff">
            {data.map((entry, i) => <Cell key={i} fill={entry.color} />)}
          </Pie>
          <Tooltip
            formatter={(v, n) => [`${v} clientes`, n]}
            contentStyle={{ background: '#0F2040', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 12 }}
            labelStyle={{ color: '#94A3B8' }}
            itemStyle={{ color: '#fff' }}
          />
        </PieChart>
      </ResponsiveContainer>
      {/* Center label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-2xl font-bold text-slate-800">{total}</span>
        <span className="text-xs text-slate-400">clientes</span>
      </div>
      {/* Legend */}
      <div className="flex justify-center gap-4 mt-2">
        {[
          { label: 'OK', color: 'bg-emerald-500', count: green },
          { label: 'Atenção', color: 'bg-amber-400', count: yellow },
          { label: 'Crítico', color: 'bg-red-500', count: red },
        ].map(l => (
          <div key={l.label} className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${l.color}`} />
            <span className="text-xs text-slate-500">{l.label}: <b className="text-slate-700">{l.count}</b></span>
          </div>
        ))}
      </div>
    </div>
  )
}
