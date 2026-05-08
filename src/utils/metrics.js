// ─── STATUS CALCULATORS ───────────────────────────────────────────────────

/** Positive metrics: higher = better */
export function calcPositiveStatus(real, goal) {
  if (!goal || goal === 0) return { pct: 0, status: 'gray' }
  const pct = (real / goal) * 100
  if (pct >= 100) return { pct, status: 'green' }
  if (pct >= 70) return { pct, status: 'yellow' }
  return { pct, status: 'red' }
}

/** Cost metrics: lower = better */
export function calcCostStatus(real, goal) {
  if (!goal || goal === 0) return { pct: 0, status: 'gray' }
  const pct = (real / goal) * 100
  if (pct <= 100) return { pct, status: 'green' }
  if (pct <= 120) return { pct, status: 'yellow' }
  return { pct, status: 'red' }
}

/** Derive overall client status from all metric statuses */
export function calcOverallStatus(statuses) {
  const counts = { red: 0, yellow: 0, green: 0 }
  statuses.forEach(s => { if (counts[s] !== undefined) counts[s]++ })
  if (counts.red >= 2) return 'red'
  if (counts.yellow >= 2 || counts.red >= 1) return 'yellow'
  return 'green'
}

/** Build full status object for a client given goals and aggregated metrics */
export function buildClientStatus(goals, metrics) {
  if (!metrics) return null

  const leads = calcPositiveStatus(metrics.leadsTotal, goals.leads)
  const cpa = calcCostStatus(metrics.cpa, goals.cpa)
  const vendas = calcPositiveStatus(metrics.vendas, goals.vendas)
  const valorVenda = calcPositiveStatus(metrics.valorVenda, goals.valorVenda)
  const roas = calcPositiveStatus(metrics.roas, goals.roas)
  const cac = calcCostStatus(metrics.cac, goals.cac)
  const ticketMedio = calcPositiveStatus(metrics.ticketMedio, goals.ticketMedio)
  const investimento = calcPositiveStatus(metrics.investimento, goals.investimento)

  const overall = calcOverallStatus([
    leads.status, cpa.status, vendas.status, roas.status,
    valorVenda.status, cac.status,
  ])

  return { leads, cpa, vendas, valorVenda, roas, cac, ticketMedio, investimento, overall }
}

// ─── FORMATTERS ──────────────────────────────────────────────────────────

export function fmtBRL(val) {
  if (val === undefined || val === null) return 'R$ —'
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val)
}

export function fmtNum(val, decimals = 0) {
  if (val === undefined || val === null) return '—'
  return new Intl.NumberFormat('pt-BR', { maximumFractionDigits: decimals }).format(val)
}

export function fmtPct(val, decimals = 2) {
  if (val === undefined || val === null) return '—'
  return `${Number(val).toFixed(decimals)}%`
}

export function fmtDate(str) {
  if (!str) return '—'
  const [y, m, d] = str.split('-')
  return `${d}/${m}/${y}`
}

export function fmtShortDate(str) {
  if (!str) return ''
  const [, m, d] = str.split('-')
  return `${d}/${m}`
}

// ─── PERIOD FILTER ────────────────────────────────────────────────────────

export function filterByDays(data, days) {
  if (!days || days === 'all') return data
  return data.slice(-Number(days))
}

// ─── TOTALS ACROSS ALL CLIENTS ───────────────────────────────────────────

export function calcGrandTotals(aggregatedList) {
  return aggregatedList.reduce((acc, { metrics: m }) => {
    if (!m) return acc
    acc.investimento += m.investimento
    acc.leadsTotal += m.leadsTotal
    acc.vendas += m.vendas
    acc.valorVenda += m.valorVenda
    return acc
  }, { investimento: 0, leadsTotal: 0, vendas: 0, valorVenda: 0 })
}
