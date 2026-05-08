import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  DollarSign, Users, Target, TrendingUp, ShoppingCart,
  AlertTriangle, CheckCircle, XCircle, ChevronRight, ArrowUpRight, ArrowDownRight,
} from 'lucide-react'
import Layout from '../components/Layout'
import { ChartCard, SingleAreaChart } from '../components/DailyChart'
import DonutChart from '../components/DonutChart'
import StatusBadge, { StatusDot } from '../components/StatusBadge'
import PeriodFilter from '../components/PeriodFilter'
import { clients, getAllClientsAggregated, allDailyData } from '../data/mockData'
import { buildClientStatus, fmtBRL, fmtNum, fmtPct, fmtDate, filterByDays } from '../utils/metrics'

const CANAL_COLORS = { Facebook: '#1877F2', Google: '#EA4335' }

export default function Dashboard() {
  const navigate = useNavigate()
  const [period, setPeriod] = useState(30)
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterCanal, setFilterCanal] = useState('all')

  const aggregated = useMemo(() => getAllClientsAggregated(period), [period])

  const rows = useMemo(() => aggregated.map(({ client, metrics }) => {
    const status = buildClientStatus(client.goals, metrics)
    return { client, metrics, status }
  }), [aggregated])

  const filtered = useMemo(() => rows.filter(r => {
    if (filterStatus !== 'all' && r.status?.overall !== filterStatus) return false
    if (filterCanal !== 'all' && r.client.canal !== filterCanal) return false
    return true
  }), [rows, filterStatus, filterCanal])

  const statusCounts = useMemo(() => ({
    green: rows.filter(r => r.status?.overall === 'green').length,
    yellow: rows.filter(r => r.status?.overall === 'yellow').length,
    red: rows.filter(r => r.status?.overall === 'red').length,
  }), [rows])

  const totals = useMemo(() => {
    return rows.reduce((acc, { metrics: m }) => {
      if (!m) return acc
      acc.investimento += m.investimento
      acc.leads += m.leadsTotal
      acc.vendas += m.vendas
      acc.receita += m.valorVenda
      acc.cpa += m.cpa
      acc.roas += m.roas
      return acc
    }, { investimento: 0, leads: 0, vendas: 0, receita: 0, cpa: 0, roas: 0 })
  }, [rows])

  // Daily chart data — all clients combined
  const chartData = useMemo(() => {
    const byDate = {}
    allDailyData.filter(d => {
      const today = new Date('2026-05-08')
      const date = new Date(d.date)
      const diff = Math.floor((today - date) / 86400000)
      return diff < period
    }).forEach(d => {
      if (!byDate[d.date]) byDate[d.date] = {
        date: d.date, investimento: 0, leadsTotal: 0, vendas: 0, valorVenda: 0, impressoes: 0, cliques: 0,
      }
      byDate[d.date].investimento += d.investimento
      byDate[d.date].leadsTotal += d.leadsTotal
      byDate[d.date].vendas += d.vendas
      byDate[d.date].valorVenda += d.valorVenda
      byDate[d.date].impressoes += d.impressoes
      byDate[d.date].cliques += d.cliques
    })
    return Object.values(byDate).sort((a, b) => a.date.localeCompare(b.date))
  }, [period])

  const summaryCards = [
    { label: 'Investimento Total', value: fmtBRL(totals.investimento), icon: DollarSign, color: '#06B6D4', trend: 8 },
    { label: 'Leads Totais', value: fmtNum(totals.leads), icon: Target, color: '#8B5CF6', trend: 12 },
    { label: 'Total de Vendas', value: fmtNum(totals.vendas), icon: ShoppingCart, color: '#10B981', trend: 5 },
    { label: 'Receita Total', value: fmtBRL(totals.receita), icon: TrendingUp, color: '#F59E0B', trend: 9 },
    { label: 'CPA Médio', value: fmtBRL(totals.cpa / rows.length), icon: Target, color: '#EF4444', trend: -3 },
    { label: 'ROAS Médio', value: `${(totals.roas / rows.length).toFixed(2)}x`, icon: ArrowUpRight, color: '#06B6D4', trend: 4 },
    { label: 'Clientes Ativos', value: `${rows.length}`, icon: Users, color: '#8B5CF6' },
    { label: 'Clientes em Alerta', value: `${statusCounts.yellow}`, icon: AlertTriangle, color: '#F59E0B' },
    { label: 'Clientes Críticos', value: `${statusCounts.red}`, icon: XCircle, color: '#EF4444' },
  ]

  return (
    <Layout title="Dashboard Geral" subtitle="Visão consolidada de todas as contas">
      <div className="space-y-6 animate-slide-up">

        {/* Period + Filters */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <PeriodFilter value={period} onChange={setPeriod} />
          <div className="flex items-center gap-2">
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="text-xs border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-400/30">
              <option value="all">Todos os status</option>
              <option value="green">Meta alcançada</option>
              <option value="yellow">Em atenção</option>
              <option value="red">Crítico</option>
            </select>
            <select
              value={filterCanal}
              onChange={e => setFilterCanal(e.target.value)}
              className="text-xs border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-400/30">
              <option value="all">Todos os canais</option>
              <option value="Facebook">Facebook</option>
              <option value="Google">Google</option>
            </select>
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {summaryCards.map(card => (
            <div key={card.label} className="card card-hover p-4 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl"
                style={{ background: `linear-gradient(90deg, ${card.color}, transparent)` }} />
              <div className="flex items-start justify-between mb-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: `${card.color}18` }}>
                  <card.icon size={15} style={{ color: card.color }} />
                </div>
                {card.trend !== undefined && (
                  <span className={`text-xs font-semibold flex items-center gap-0.5 ${card.trend >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                    {card.trend >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                    {Math.abs(card.trend)}%
                  </span>
                )}
              </div>
              <p className="text-xl font-bold text-slate-900">{card.value}</p>
              <p className="text-xs text-slate-400 mt-0.5">{card.label}</p>
            </div>
          ))}
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2">
            <ChartCard
              title="Investimento Diário"
              subtitle={`Últimos ${period} dias — todos os clientes`}
              actions={<PeriodFilter value={period} onChange={setPeriod} />}>
              <SingleAreaChart
                data={chartData}
                dataKey="investimento"
                name="Investimento"
                color="#06B6D4"
                formatter={v => fmtBRL(v)}
                height={220}
              />
            </ChartCard>
          </div>
          <div>
            <ChartCard title="Status dos Clientes" subtitle="Distribuição atual">
              <DonutChart
                green={statusCounts.green}
                yellow={statusCounts.yellow}
                red={statusCounts.red}
              />
            </ChartCard>
          </div>
        </div>

        {/* Charts grid 2 */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          <ChartCard title="Leads por Dia" subtitle="Total consolidado">
            <SingleAreaChart data={chartData} dataKey="leadsTotal" name="Leads" color="#8B5CF6" formatter={v => fmtNum(v)} height={160} />
          </ChartCard>
          <ChartCard title="Vendas por Dia" subtitle="Total consolidado">
            <SingleAreaChart data={chartData} dataKey="vendas" name="Vendas" color="#10B981" formatter={v => fmtNum(v)} height={160} />
          </ChartCard>
          <ChartCard title="Receita por Dia" subtitle="Total consolidado">
            <SingleAreaChart data={chartData} dataKey="valorVenda" name="Receita" color="#F59E0B" formatter={v => fmtBRL(v)} height={160} />
          </ChartCard>
        </div>

        {/* Rankings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Ranking performance */}
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-slate-800 mb-4">Ranking de Performance</h3>
            <div className="space-y-3">
              {[...rows]
                .sort((a, b) => (b.metrics?.roas || 0) - (a.metrics?.roas || 0))
                .map(({ client, metrics, status }, i) => (
                  <div key={client.id}
                    onClick={() => navigate(`/clientes/${client.id}`)}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors">
                    <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-500 text-xs font-bold flex items-center justify-center">
                      {i + 1}
                    </span>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                      style={{ background: client.color }}>
                      {client.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate">{client.name}</p>
                      <p className="text-xs text-slate-400">{client.canal}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-slate-800">{metrics?.roas?.toFixed(2)}x</p>
                      <p className="text-xs text-slate-400">ROAS</p>
                    </div>
                    <StatusDot status={status?.overall} />
                  </div>
                ))}
            </div>
          </div>

          {/* Ranking CPA */}
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-slate-800 mb-4">Ranking de CPA</h3>
            <div className="space-y-3">
              {[...rows]
                .sort((a, b) => (a.metrics?.cpa || 999) - (b.metrics?.cpa || 999))
                .map(({ client, metrics, status }, i) => (
                  <div key={client.id}
                    onClick={() => navigate(`/clientes/${client.id}`)}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors">
                    <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-500 text-xs font-bold flex items-center justify-center">
                      {i + 1}
                    </span>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                      style={{ background: client.color }}>
                      {client.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate">{client.name}</p>
                      <p className="text-xs text-slate-400">{client.sector}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-slate-800">{fmtBRL(metrics?.cpa)}</p>
                      <p className="text-xs text-slate-400">CPA</p>
                    </div>
                    <StatusDot status={status?.cpa?.status} />
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Main Table */}
        <div className="card overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-800">Tabela de Contas</h3>
              <p className="text-xs text-slate-400 mt-0.5">{filtered.length} de {rows.length} clientes</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  {['Cliente', 'Canal', 'Investimento', 'Leads', 'CPA', 'Vendas', 'ROAS', '% Atingido', 'Status', 'Atualização'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(({ client, metrics, status }) => {
                  const avgPct = status ? (
                    [status.leads.pct, status.vendas.pct, status.roas.pct].reduce((a, b) => a + b, 0) / 3
                  ) : 0

                  return (
                    <tr key={client.id}
                      onClick={() => navigate(`/clientes/${client.id}`)}
                      className="border-b border-slate-50 hover:bg-slate-50/80 cursor-pointer transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
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
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full text-white"
                          style={{ background: CANAL_COLORS[client.canal] || '#64748B' }}>
                          {client.canal}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-800">{fmtBRL(metrics?.investimento)}</p>
                          <p className="text-xs text-slate-400">meta: {fmtBRL(client.goals.investimento)}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-800">{fmtNum(metrics?.leadsTotal)}</p>
                          <p className="text-xs text-slate-400">meta: {fmtNum(client.goals.leads)}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <StatusDot status={status?.cpa?.status} />
                          <div>
                            <p className="text-sm font-semibold text-slate-800">{fmtBRL(metrics?.cpa)}</p>
                            <p className="text-xs text-slate-400">meta: {fmtBRL(client.goals.cpa)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-800">{fmtNum(metrics?.vendas)}</p>
                          <p className="text-xs text-slate-400">meta: {fmtNum(client.goals.vendas)}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <StatusDot status={status?.roas?.status} />
                          <div>
                            <p className="text-sm font-semibold text-slate-800">{metrics?.roas?.toFixed(2)}x</p>
                            <p className="text-xs text-slate-400">meta: {client.goals.roas}x</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-sm font-bold" style={{ color: avgPct >= 100 ? '#10B981' : avgPct >= 70 ? '#F59E0B' : '#EF4444' }}>
                            {fmtPct(avgPct)}
                          </p>
                          <div className="w-16 h-1 bg-slate-100 rounded-full mt-1">
                            <div className="h-1 rounded-full" style={{
                              width: `${Math.min(avgPct, 100)}%`,
                              background: avgPct >= 100 ? '#10B981' : avgPct >= 70 ? '#F59E0B' : '#EF4444',
                            }} />
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={status?.overall} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs text-slate-400">{fmtDate(metrics?.lastUpdated)}</p>
                          <ChevronRight size={14} className="text-slate-300" />
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  )
}
