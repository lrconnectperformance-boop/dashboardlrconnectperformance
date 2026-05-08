export default function StatusBadge({ status, size = 'sm', showDot = true }) {
  const map = {
    green: { label: 'Meta alcançada', cls: 'badge-green', dot: 'bg-emerald-500' },
    yellow: { label: 'Em atenção', cls: 'badge-yellow', dot: 'bg-amber-500' },
    red: { label: 'Abaixo do projetado', cls: 'badge-red', dot: 'bg-red-500' },
    gray: { label: 'Sem dados', cls: 'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-50 text-slate-500 border border-slate-200', dot: 'bg-slate-400' },
  }
  const cfg = map[status] || map.gray
  if (size === 'dot') {
    return <span className={`inline-block w-2.5 h-2.5 rounded-full ${cfg.dot}`} />
  }
  return (
    <span className={cfg.cls}>
      {showDot && <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />}
      {cfg.label}
    </span>
  )
}

export function StatusDot({ status, size = 8 }) {
  const colors = { green: 'bg-emerald-500', yellow: 'bg-amber-400', red: 'bg-red-500', gray: 'bg-slate-300' }
  return (
    <span
      className={`inline-block rounded-full ${colors[status] || colors.gray}`}
      style={{ width: size, height: size }}
    />
  )
}
