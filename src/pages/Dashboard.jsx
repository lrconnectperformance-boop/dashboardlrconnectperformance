import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  DollarSign, Users, Target, TrendingUp,
  ChevronRight, ArrowUpRight, RefreshCw,
} from 'lucide-react'
import Layout from '../components/Layout'
import { clients } from '../data/mockData'
import { fmtBRL, fmtNum, fmtPct } from '../utils/metrics'
import { fetchSheetCSV, parseMainSummary, normalizeSummary } from '../utils/sheetsApi'

// ─── HOOK ─────────────────────────────────────────────────────────────────────
function useAllSummaries() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    const live = clients.filter(c => c.isLive)
    Promise.all(
      live.map(async client => {
        try {
          const csv = await fetchSheetCSV(client.sheetsId, client.sheetsTab)
          const summary = normalizeSummary(parseMainSummary(csv))
          return { client, summary, error: null }
        } catch (err) {
          return { client, summary: null, error: err.message }
        }
      })
    ).then(results => {
      setRows(results)
      setLoading(false)
    })
  }

  useEffect(() => { load() }, [])

  return { rows, loading, refetch: load }
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function clientCPA(summary) {
  const invest = summary?.investimento?.real ?? 0
  const leads  = summary?.leadsTotal?.real  ?? 0
  return leads > 0 ? invest / leads : 0
}

function goalPct(real, goal) {
  if (!goal || goal === 0) return null
  return (real / goal) * 100
}

function StatusPill({ pct }) {
  if (pct === null) return <span className="text-xs text-slate-400">—</span>
  const color = pct >= 80 ? '#10B981' : pct >= 50 ? '#F59E0B' : '#EF4444'
  const label = pct >= 80 ? 'No ritmo' : pct >= 50 ? 'Atenção' : 'Crítico'
  return (
    <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
      style={{ background: `${color}20`, color }}>
      {label}
    </span>
  )
}

// ─── COMPONENT ────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const navigate = useNavigate()
  const [filterCanal, setFilterCanal] = useState('all')
  const { rows, loading, refetch } = useAllSummaries()

  const filtered = useMemo(() =>
    rows.filter(r => filterCanal === 'all' || r.client.canal.includes(filterCanal))
  , [rows, filterCanal])

  const totals = useMemo(() => {
    return rows.reduce((acc, { summary: s }) => {
      acc.investimento += s?.investimento?.real ?? 0
      acc.leads        += s?.leadsTotal?.real   ?? 0
      return acc
    }, { investimento: 0, leads: 0 })
  }, [rows])

  const avgCPA = totals.leads > 0 ? totals.investimento / totals.leads : 0

  const summaryCards = [
    { label: 'Investimento MTD',  value: fmtBRL(totals.investimento), icon: DollarSign, color: '#06B6D4' },
    { label: 'Leads MTD',         value: fmtNum(totals.leads),        icon: Target,     color: '#8B5CF6' },
    { label: 'CPA Médio',         value: fmtBRL(avgCPA),              icon: TrendingUp, color: '#F59E0B' },
    { label: 'Clientes Ativos',   value: `${clients.filter(c => c.isLive).length}`, icon: Users, color: '#10B981' },
  ]

  const rankingCPA = useMemo(() =>
    [...rows]
      .filter(r => r.summary)
      .sort((a, b) => {
        const ca = clientCPA(a.summary)
        const cb = clientCPA(b.summary)
        if (ca === 0 && cb === 0) return 0
        if (ca === 0) return 1
        if (cb === 0) return -1
        return ca - cb
      })
  , [rows])

  return (
    <Layout title="Dashboard Geral" subtitle="Visão consolidada — mês atual">
      <div className="space-y-6 animate-slide-up">

        {/* Top bar */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <select
              value={filterCanal}
              onChange={e => setFilterCanal(e.target.value)}
              className="text-xs border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-400/30">
              <option value="all">Todos os canais</option>
              <option value="Facebook">Facebook</option>
              <option value="Google">Google</option>
            </select>
          </div>
          <button
            onClick={refetch}
            disabled={loading}
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 transition-colors">
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            {loading ? 'Carregando…' : 'Atualizar'}
          </button>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {summaryCards.map(card => (
            <div key={card.label} className="card p-5 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl"
                style={{ background: `linear-gradient(90deg, ${card.color}, transparent)` }} />
              <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
                style={{ background: `${card.color}18` }}>
                <card.icon size={16} style={{ color: card.color }} />
              </div>
              <p className="text-2xl font-bold text-slate-900">
                {loading ? <span className="inline-block w-20 h-6 bg-slate-100 animate-pulse rounded" /> : card.value}
              </p>
              <p className="text-xs text-slate-400 mt-1">{card.label}</p>
            </div>
          ))}
        </div>

        {/* Ranking CPA + Table row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Ranking de CPA */}
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-slate-800 mb-4">Ranking de CPA</h3>
            {loading ? (
              <div className="space-y-3">
                {[1,2,3,4,5].map(i => (
                  <div key={i} className="h-12 bg-slate-50 animate-pulse rounded-xl" />
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {rankingCPA.map(({ client, summary }, i) => {
                  const cpa   = clientCPA(summary)
                  const leads = summary?.leadsTotal?.real ?? 0
                  return (
                    <div key={client.id}
                      onClick={() => navigate(`/clientes/${client.id}`)}
                      className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors">
                      <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-500 text-xs font-bold flex items-center justify-center flex-shrink-0">
                        {i + 1}
                      </span>
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                        style={{ background: client.color }}>
                        {client.avatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-800 truncate">{client.name}</p>
                        <p className="text-xs text-slate-400">{leads} leads</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-bold text-slate-800">{cpa > 0 ? fmtBRL(cpa) : '—'}</p>
                        <p className="text-xs text-slate-400">CPA</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Main Table */}
          <div className="lg:col-span-2 card overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100">
              <h3 className="text-sm font-semibold text-slate-800">Contas — Mês Atual</h3>
              <p className="text-xs text-slate-400 mt-0.5">{filtered.length} de {rows.length} clientes</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100">
                    {['Cliente', 'Canal', 'Investimento', 'Leads', 'CPA', '% Meta Leads', ''].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className="border-b border-slate-50">
                        <td colSpan={7} className="px-4 py-4">
                          <div className="h-8 bg-slate-50 animate-pulse rounded-lg" />
                        </td>
                      </tr>
                    ))
                  ) : filtered.map(({ client, summary }) => {
                    const invest = summary?.investimento?.real ?? 0
                    const leads  = summary?.leadsTotal?.real   ?? 0
                    const cpa    = clientCPA(summary)
                    const pct    = goalPct(leads, client.goals?.leads)

                    return (
                      <tr key={client.id}
                        onClick={() => navigate(`/clientes/${client.id}`)}
                        className="border-b border-slate-50 hover:bg-slate-50/80 cursor-pointer transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                              style={{ background: client.color }}>
                              {client.avatar}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-slate-800 whitespace-nowrap">{client.name}</p>
                              <p className="text-xs text-slate-400">{client.sector}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs font-medium text-slate-500 whitespace-nowrap">{client.canal}</span>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm font-semibold text-slate-800">{invest > 0 ? fmtBRL(invest) : '—'}</p>
                          <p className="text-xs text-slate-400">meta: {fmtBRL(client.goals?.investimento)}</p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm font-semibold text-slate-800">{leads > 0 ? fmtNum(leads) : '—'}</p>
                          <p className="text-xs text-slate-400">meta: {fmtNum(client.goals?.leads)}</p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm font-semibold text-slate-800">{cpa > 0 ? fmtBRL(cpa) : '—'}</p>
                          <p className="text-xs text-slate-400">meta: {fmtBRL(client.goals?.cpa)}</p>
                        </td>
                        <td className="px-4 py-3">
                          {pct !== null ? (
                            <div>
                              <p className="text-sm font-bold" style={{
                                color: pct >= 80 ? '#10B981' : pct >= 50 ? '#F59E0B' : '#EF4444'
                              }}>
                                {fmtPct(pct)}
                              </p>
                              <div className="w-16 h-1 bg-slate-100 rounded-full mt-1">
                                <div className="h-1 rounded-full" style={{
                                  width: `${Math.min(pct, 100)}%`,
                                  background: pct >= 80 ? '#10B981' : pct >= 50 ? '#F59E0B' : '#EF4444',
                                }} />
                              </div>
                            </div>
                          ) : <span className="text-xs text-slate-400">—</span>}
                        </td>
                        <td className="px-4 py-3">
                          <ChevronRight size={14} className="text-slate-300" />
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
