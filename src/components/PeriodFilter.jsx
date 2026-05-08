export default function PeriodFilter({ value, onChange }) {
  const options = [
    { label: '7D', value: 7 },
    { label: '15D', value: 15 },
    { label: '30D', value: 30 },
  ]
  return (
    <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-0.5">
      {options.map(o => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-150 ${
            value === o.value
              ? 'bg-white text-slate-800 shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
          }`}>
          {o.label}
        </button>
      ))}
    </div>
  )
}
