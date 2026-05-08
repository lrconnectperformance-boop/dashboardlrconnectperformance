import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, ExternalLink, TrendingUp, TrendingDown,
  DollarSign, Target, ShoppingCart, Users, Zap, Eye, MousePointer,
} from 'lucide-react'
import Layout from '../components/Layout'
import { ChartCard, SingleAreaChart } from '../components/DailyChart'
import StatusBadge, { StatusDot } from '../components/StatusBadge'
import PeriodFilter from '../components/PeriodFilter'
import { clients, getClientData, aggregateClient } from '../data/mockData'
import { buildClientStatus, fmtBRL, fmtNum, fmtPct, fmtDate, fmtShortDate } from '../utils/metrics'

export default function ClientDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [period, setPeriod] = useState(30)

  const client = clients.find(c => c.id === Number(id))
  if (!client) return (
    <Layout title="Cliente não encontrado">
      <button onClick={() => navigate('/clientes')} className="btn-ghost flex items-center gap-2">
        <ArrowLeft size={14} /> Voltar
      </button>
    </Layout>
  )

  const dailyData = getClientData(client.id, period)
  const metrics = aggregateClient(client.id, period)
  const status = buildClientStatus(client.goals, metrics)

  const topMetrics = [
    {
      label: 'Investimento', value: fmtBRL(metrics?.investimento),
      goal: fmtBRL(client.goals.investimento), pct: status?.investimento?.pct,
      status: status?.investimento?.status, icon: DollarSign, color: '#06B6D4',
    },
    {
      label: 'Leads Totais', value: fmtNum(metrics?.leadsTotal),
      goal: fmtNum(client.goals.leads), pct: status?.leads?.pct,
      status: status?.leads?.status, icon: Target, color: '#8B5CF6',
    },
    {
      label: 'CPA', value: fmtBRL(metrics?.cpa),
      goal: fmtBRL(client.goals.cpa), pct: status?.cpa?.pct,
      status: status?.cpa?.status, icon: Zap, color: '#EF4444',
      note: 'Custo — menor é melhor',
    },
    {
      label: 'Vendas', value: fmtNum(metrics?.vendas),
      goal: fmtNum(client.goals.vendas), pct: status?.vendas?.pct,
      status: status?.vendas?.status, icon: ShoppingCart, color: '#10B981',
    },
    {
      label: 'Receita', value: fmtBRL(metrics?.valorVenda),
      goal: fmtBRL(client.goals.valorVenda), pct: status?.valorVenda?.pct,
      status: status?.valorVenda?.status, icon: TrendingUp, color: '#F59E0B',
    },
    {
      label: 'ROAS', value: `${metrics?.roas?.toFixed(2)}x`,
      goal: `${client.goals.roas}x`, pct: status?.roas?.pct,
      status: status?.roas?.status, icon: TrendingUp, color: '#06B6D4',
    },
    {
      label: 'CAC', value: fmtBRL(metrics?.cac),
      goal: fmtBRL(client.goals.cac), pct: status?.cac?.pct,
      status: status?.cac?.status, icon: Users, color: '#EF4444',
      note: 'Custo — menor é melhor',
    },
    {
      label: 'Ticket Médio', value: fmtBRL(metrics?.ticketMedio),
      goal: fmtBRL(client.goals.ticketMedio), pct: status?.ticketMedio?.pct,
      status: status?.ticketMedio?.status, icon: DollarSign, color: '#10B981',
    },
  ]

  const charts = [
    { key: 'impressoes', name: 'Impressões', color: '#06B6D4', fmt: v => fmtNum(v) },
    { key: 'cliques', name: 'Cliques', color: '#8B5CF6', fmt: v => fmtNum(v) },
    { key: 'investimento', name: 'Investimento', color: '#F59E0B', fmt: v => fmtBRL(v) },
    { key: 'leadsTotal', name: 'Leads', color: '#10B981', fmt: v => fmtNum(v) },
    { key: 'cpa', name: 'CPA', color: '#EF4444', fmt: v => fmtBRL(v) },
    { key: 'ctr', name: 'CTR', color: '#06B6D4', fmt: v => `${v.toFixed(2)}%` },
    { key: 'roas', name: 'ROAS', color: '#8B5CF6', fmt: v => `${v.toFixed(2)}x` },
    { key: 'vendas', name: 'Vendas', color: '#10B981', fmt: v => fmtNum(v) },
    { key: 'valorVenda', name: 'Receita', color: '#F59E0B', fmt: v => fmtBRL(v) },
  ]

  const barColors = { green: 'bg-emerald-500', yellow: 'bg-amber-400', red: 'bg-red-500', gray: 'bg-slate-300' }

  return (
    <Layout title={client.name} subtitle={`${client.sector} · ${client.canal}`}>
      <div className="space-y-6 animate-slide-up">

        {/* Back + header */}
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/clientes')}
              className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 hover:bg-slate-100 transition-colors text-slate-500">
              <ArrowLeft size={16} />
            </button>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg"
              style={{ background: `linear-gradient(135deg, ${client.color}, ${client.color}99)` }}>
              {client.avatar}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900">{client.name}</h2>
                <StatusBadge status={status?.overall} />
              </div>
              <p className="text-sm text-slate-400">{client.sector} · Ativo desde {fmtDate(client.createdAt)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <PeriodFilter value={period} onChange={setPeriod} />
            <a href={client.sheetsUrl} target="_blank" rel="noreferrer"
              className="btn-ghost flex items-center gap-1.5 text-xs">
              <ExternalLink size={13} />
              Ver Sheets
            </a>
          </div>
        </div>

        {/* Top metric cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {topMetrics.map(m => {
            const barPct = Math.min(m.pct || 0, 100)
            return (
              <div key={m.label} className="card p-4 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl"
                  style={{ background: `linear-gradient(90deg, ${m.color}, transparent)` }} />
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-slate-500 font-medium">{m.label}</p>
                  <div className="flex items-center gap-1.5">
                    <StatusDot status={m.status} size={7} />
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                      style={{ background: `${m.color}15` }}>
                      <m.icon size={13} style={{ color: m.color }} />
                    </div>
                  </div>
                </div>
                <p className="text-xl font-bold text-slate-900">{m.value}</p>
                <p className="text-xs text-slate-400 mt-0.5">meta: {m.goal}</p>
                {m.pct !== undefined && (
                  <div className="mt-2">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-400">Atingido</span>
                      <span className={`font-semibold ${
                        m.status === 'green' ? 'text-emerald-600' :
                        m.status === 'yellow' ? 'text-amber-600' : 'text-red-600'
                      }`}>{fmtPct(m.pct)}</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full">
                      <div className={`h-1.5 rounded-full ${barColors[m.status] || 'bg-slate-300'}`}
                        style={{ width: `${barPct}%` }} />
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Daily charts grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {charts.map(c => (
            <ChartCard key={c.key} title={`${c.name} por Dia`} subtitle={`Últimos ${period} dias`}>
              <SingleAreaChart
                data={dailyData}
                dataKey={c.key}
                name={c.name}
                color={c.color}
                formatter={c.fmt}
                height={150}
              />
            </ChartCard>
          ))}
        </div>

        {/* Projetado vs Realizado comparison */}
        <div className="card p-6">
          <h3 className="text-sm font-semibold text-slate-800 mb-5">Projetado vs Realizado</h3>
          <div className="space-y-4">
            {[
              { label: 'Investimento', real: metrics?.investimento, goal: client.goals.investimento, fmt: fmtBRL, s: status?.investimento, cost: false },
              { label: 'Leads', real: metrics?.leadsTotal, goal: client.goals.leads, fmt: fmtNum, s: status?.leads, cost: false },
              { label: 'CPA', real: metrics?.cpa, goal: client.goals.cpa, fmt: fmtBRL, s: status?.cpa, cost: true },
              { label: 'Vendas', real: metrics?.vendas, goal: client.goals.vendas, fmt: fmtNum, s: status?.vendas, cost: false },
              { label: 'Receita', real: metrics?.valorVenda, goal: client.goals.valorVenda, fmt: fmtBRL, s: status?.valorVenda, cost: false },
              { label: 'ROAS', real: metrics?.roas, goal: client.goals.roas, fmt: v => `${v?.toFixed(2)}x`, s: status?.roas, cost: false },
              { label: 'CAC', real: metrics?.cac, goal: client.goals.cac, fmt: fmtBRL, s: status?.cac, cost: true },
              { label: 'Ticket Médio', real: metrics?.ticketMedio, goal: client.goals.ticketMedio, fmt: fmtBRL, s: status?.ticketMedio, cost: false },
            ].map(row => {
              const pct = row.s?.pct || 0
              const barPct = Math.min(pct, 100)
              const diff = row.real - row.goal
              const isPositiveDiff = row.cost ? diff <= 0 : diff >= 0

              return (
                <div key={row.label} className="grid grid-cols-12 items-center gap-3">
                  <div className="col-span-2">
                    <p className="text-xs font-medium text-slate-500">{row.label}</p>
                  </div>
                  <div className="col-span-2 text-right">
                    <p className="text-xs text-slate-400">{row.fmt(row.goal)}</p>
                    <p className="text-xs text-slate-300">projetado</p>
                  </div>
                  <div className="col-span-5">
                    <div className="relative h-2 bg-slate-100 rounded-full">
                      <div className={`absolute h-2 rounded-full ${barColors[row.s?.status] || 'bg-slate-300'}`}
                        style={{ width: `${barPct}%` }} />
                      <div className="absolute right-0 top-0 h-2 w-px bg-slate-300" />
                    </div>
                    <p className={`text-xs font-semibold mt-0.5 ${
                      row.s?.status === 'green' ? 'text-emerald-600' :
                      row.s?.status === 'yellow' ? 'text-amber-600' : 'text-red-600'
                    }`}>{fmtPct(pct)}</p>
                  </div>
                  <div className="col-span-2 text-right">
                    <p className="text-xs font-bold text-slate-800">{row.fmt(row.real)}</p>
                    <p className={`text-xs font-medium ${isPositiveDiff ? 'text-emerald-600' : 'text-red-500'}`}>
                      {isPositiveDiff ? '+' : ''}{row.fmt(diff)}
                    </p>
                  </div>
                  <div className="col-span-1 flex justify-end">
                    <StatusDot status={row.s?.status} size={8} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Daily data table */}
        <div className="card overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <h3 className="text-sm font-semibold text-slate-800">Dados Diários Completos</h3>
            <p className="text-xs text-slate-400 mt-0.5">Últimos {period} dias</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  {['Data', 'Invest.', 'Impressões', 'Cliques', 'CTR', 'CPC', 'Leads WPP', 'Leads Form', 'Total', 'CPA', 'Vendas', 'Receita', 'ROAS'].map(h => (
                    <th key={h} className="px-3 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[...dailyData].reverse().map((d, i) => (
                  <tr key={i} className="border-b border-slate-50 hover:bg-slate-50/80 transition-colors">
                    <td className="px-3 py-2.5 text-xs font-medium text-slate-600">{fmtDate(d.date)}</td>
                    <td className="px-3 py-2.5 text-xs text-slate-700">{fmtBRL(d.investimento)}</td>
                    <td className="px-3 py-2.5 text-xs text-slate-700">{fmtNum(d.impressoes)}</td>
                    <td className="px-3 py-2.5 text-xs text-slate-700">{fmtNum(d.cliques)}</td>
                    <td className="px-3 py-2.5 text-xs text-slate-700">{fmtPct(d.ctr)}</td>
                    <td className="px-3 py-2.5 text-xs text-slate-700">{fmtBRL(d.cpc)}</td>
                    <td className="px-3 py-2.5 text-xs text-slate-700">{fmtNum(d.leadsWpp)}</td>
                    <td className="px-3 py-2.5 text-xs text-slate-700">{fmtNum(d.leadsFrm)}</td>
                    <td className="px-3 py-2.5 text-xs font-semibold text-slate-800">{fmtNum(d.leadsTotal)}</td>
                    <td className="px-3 py-2.5 text-xs text-slate-700">{fmtBRL(d.cpa)}</td>
                    <td className="px-3 py-2.5 text-xs text-slate-700">{fmtNum(d.vendas)}</td>
                    <td className="px-3 py-2.5 text-xs text-slate-700">{fmtBRL(d.valorVenda)}</td>
                    <td className="px-3 py-2.5 text-xs font-semibold text-slate-800">{d.roas?.toFixed(2)}x</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  )
}
