import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, ExternalLink, RefreshCw, Wifi, WifiOff,
  DollarSign, Target, Zap, MousePointer, Eye, TrendingUp, MessageCircle, AlertCircle,
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from 'recharts'
import Layout from '../components/Layout'
import StatusBadge, { StatusDot } from '../components/StatusBadge'
import { clients } from '../data/mockData'
import { useSheetData } from '../hooks/useSheetData'
import { calcPositiveStatus, calcCostStatus, fmtBRL, fmtNum, fmtPct } from '../utils/metrics'

// ─── HELPERS ─────────────────────────────────────────────────────────────
const fmtShort = str => {
  if (!str) return ''
  const [, , d] = str.split('-')
  return `${parseInt(d, 10)}`
}

const CustomTooltip = ({ active, payload, label, formatter }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: '#0F2040', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '8px 12px', fontSize: 12 }}>
      <p style={{ color: '#94A3B8', marginBottom: 4 }}>Dia {label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: '#fff', fontWeight: 600 }}>
          {formatter ? formatter(p.value) : p.value}
        </p>
      ))}
    </div>
  )
}

// ─── DAILY BAR CHART ─────────────────────────────────────────────────────
function DailyBarChart({ data, dataKey, color, formatter, goalLine }) {
  const formatted = data.map(d => ({ ...d, day: fmtShort(d.date) }))
  return (
    <ResponsiveContainer width="100%" height={140}>
      <BarChart data={formatted} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
        <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#94A3B8' }} tickLine={false} axisLine={false} />
        <YAxis tick={{ fontSize: 10, fill: '#94A3B8' }} tickLine={false} axisLine={false}
          tickFormatter={v => formatter ? formatter(v) : v} />
        <Tooltip content={<CustomTooltip formatter={formatter} />} cursor={{ fill: 'rgba(6,182,212,0.06)' }} />
        {goalLine && (
          <ReferenceLine y={goalLine} stroke={color} strokeDasharray="4 4" strokeOpacity={0.4}
            label={{ value: 'Meta', position: 'insideTopRight', fontSize: 9, fill: color }} />
        )}
        <Bar dataKey={dataKey} fill={color} radius={[4, 4, 0, 0]} maxBarSize={32} />
      </BarChart>
    </ResponsiveContainer>
  )
}

// ─── CHART CARD ──────────────────────────────────────────────────────────
function ChartCard({ title, icon: Icon, color, total, goal, isCost, fmtFn, children }) {
  const s = goal != null
    ? (isCost ? calcCostStatus(total, goal) : calcPositiveStatus(total, goal))
    : null

  return (
    <div className="card p-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl"
        style={{ background: `linear-gradient(90deg, ${color}, transparent)` }} />
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${color}18` }}>
            <Icon size={14} style={{ color }} />
          </div>
          <p className="text-xs font-semibold text-slate-600">{title}</p>
        </div>
        {s && <StatusDot status={s.status} size={7} />}
      </div>

      <div className="flex items-baseline gap-2 mb-1">
        <p className="text-lg font-bold text-slate-900">{fmtFn ? fmtFn(total) : total}</p>
        {s && (
          <span className={`text-xs font-semibold ${
            s.status === 'green' ? 'text-emerald-600' :
            s.status === 'yellow' ? 'text-amber-600' : 'text-red-600'
          }`}>{fmtPct(s.pct)} da meta</span>
        )}
      </div>

      {children}
    </div>
  )
}

// ─── SUMMARY CARD ────────────────────────────────────────────────────────
function SummaryCard({ label, real, goal, isCost, icon: Icon, color, fmtFn = fmtBRL }) {
  const s = isCost ? calcCostStatus(real, goal) : calcPositiveStatus(real, goal)
  const barPct = Math.min(s.pct || 0, 100)
  const barColors = { green: 'bg-emerald-500', yellow: 'bg-amber-400', red: 'bg-red-500', gray: 'bg-slate-300' }
  return (
    <div className="card p-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl"
        style={{ background: `linear-gradient(90deg, ${color}, transparent)` }} />
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs text-slate-500 font-medium">{label}</p>
        <div className="flex items-center gap-1.5">
          <StatusDot status={s.status} size={7} />
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${color}15` }}>
            <Icon size={13} style={{ color }} />
          </div>
        </div>
      </div>
      <p className="text-xl font-bold text-slate-900">{fmtFn(real)}</p>
      <p className="text-xs text-slate-400 mt-0.5">meta: {fmtFn(goal)}</p>
      <div className="mt-2">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-slate-400">Atingido</span>
          <span className={`font-semibold ${
            s.status === 'green' ? 'text-emerald-600' :
            s.status === 'yellow' ? 'text-amber-600' : 'text-red-600'
          }`}>{fmtPct(s.pct)}</span>
        </div>
        <div className="w-full h-1.5 bg-slate-100 rounded-full">
          <div className={`h-1.5 rounded-full ${barColors[s.status] || 'bg-slate-300'}`}
            style={{ width: `${barPct}%` }} />
        </div>
      </div>
    </div>
  )
}

// ─── MTD QUADRO (tabela Métrica / Meta / Realizado / %) ──────────────────
function MTDQuadro({ title, color, metrics }) {
  const statusColors = {
    green: 'text-emerald-600 bg-emerald-50',
    yellow: 'text-amber-600 bg-amber-50',
    red: 'text-red-600 bg-red-50',
    gray: 'text-slate-400 bg-slate-50',
  }
  return (
    <div className="card overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100"
        style={{ borderLeft: `3px solid ${color}` }}>
        <div className="w-2 h-5 rounded-full flex-shrink-0" style={{ background: color }} />
        <h3 className="text-sm font-bold text-slate-800">{title}</h3>
      </div>
      <table className="w-full">
        <thead>
          <tr className="bg-slate-50/60 border-b border-slate-100">
            <th className="px-5 py-2.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">Métrica</th>
            <th className="px-5 py-2.5 text-right text-xs font-semibold text-slate-400 uppercase tracking-wide">Meta</th>
            <th className="px-5 py-2.5 text-right text-xs font-semibold text-slate-400 uppercase tracking-wide">Realizado</th>
            <th className="px-5 py-2.5 text-right text-xs font-semibold text-slate-400 uppercase tracking-wide">%</th>
            <th className="px-5 py-2.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide w-32">Progresso</th>
          </tr>
        </thead>
        <tbody>
          {metrics.map(({ label, obj, isCost, fmt }) => {
            const s = isCost ? calcCostStatus(obj.real, obj.goal) : calcPositiveStatus(obj.real, obj.goal)
            const barPct = Math.min(s.pct || 0, 100)
            const barColors = { green: 'bg-emerald-500', yellow: 'bg-amber-400', red: 'bg-red-500', gray: 'bg-slate-300' }
            return (
              <tr key={label} className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors">
                <td className="px-5 py-3 text-sm font-medium text-slate-700">{label}</td>
                <td className="px-5 py-3 text-sm text-slate-400 text-right font-mono">{fmt(obj.goal)}</td>
                <td className="px-5 py-3 text-sm font-bold text-slate-800 text-right font-mono">{fmt(obj.real)}</td>
                <td className="px-5 py-3 text-right">
                  <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${statusColors[s.status]}`}>
                    {fmtPct(s.pct)}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <div className="w-full h-1.5 bg-slate-100 rounded-full">
                    <div className={`h-1.5 rounded-full ${barColors[s.status]}`} style={{ width: `${barPct}%` }} />
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

// ─── DAILY TABLE ─────────────────────────────────────────────────────────
function DailyTable({ rows, title, color, totals }) {
  const { totalInvest, totalImpr, totalCliq, totalWpp, totalLeads, avgCTR, avgCPC, avgCPA } = totals
  return (
    <div className="card overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
        <div className="w-2 h-5 rounded-full" style={{ background: color }} />
        <div>
          <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
          <p className="text-xs text-slate-400 mt-0.5">{rows.length} dias com dados</p>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100">
              {['Data', 'Investimento', 'Impressões', 'Cliques', 'CTR', 'CPC', 'Leads', 'Msg Wpp', 'CPA'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((d, i) => (
              <tr key={i} className="border-b border-slate-50 hover:bg-slate-50/80 transition-colors">
                <td className="px-4 py-2.5 text-xs font-medium text-slate-700">
                  {d.date.split('-').reverse().join('/')}
                </td>
                <td className="px-4 py-2.5 text-xs text-slate-700">{fmtBRL(d.investimento)}</td>
                <td className="px-4 py-2.5 text-xs text-slate-700">{fmtNum(d.impressoes)}</td>
                <td className="px-4 py-2.5 text-xs text-slate-700">{fmtNum(d.cliques)}</td>
                <td className="px-4 py-2.5 text-xs text-slate-700">{fmtPct(d.ctr)}</td>
                <td className="px-4 py-2.5 text-xs text-slate-700">{fmtBRL(d.cpc)}</td>
                <td className="px-4 py-2.5 text-xs font-semibold text-slate-800">{fmtNum(d.leads)}</td>
                <td className="px-4 py-2.5 text-xs text-slate-700">{fmtNum(d.mensagemWpp)}</td>
                <td className="px-4 py-2.5 text-xs font-semibold text-slate-800">{fmtBRL(d.cpa)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-slate-50 border-t-2 border-slate-200">
            <tr>
              <td className="px-4 py-2.5 text-xs font-bold text-slate-700">Total / Média</td>
              <td className="px-4 py-2.5 text-xs font-bold text-slate-800">{fmtBRL(totalInvest)}</td>
              <td className="px-4 py-2.5 text-xs font-bold text-slate-800">{fmtNum(totalImpr)}</td>
              <td className="px-4 py-2.5 text-xs font-bold text-slate-800">{fmtNum(totalCliq)}</td>
              <td className="px-4 py-2.5 text-xs font-bold text-slate-800">{fmtPct(avgCTR)}</td>
              <td className="px-4 py-2.5 text-xs font-bold text-slate-800">{fmtBRL(avgCPC)}</td>
              <td className="px-4 py-2.5 text-xs font-bold text-slate-800">{fmtNum(totalLeads)}</td>
              <td className="px-4 py-2.5 text-xs font-bold text-slate-800">{fmtNum(totalWpp)}</td>
              <td className="px-4 py-2.5 text-xs font-bold text-slate-800">{fmtBRL(avgCPA)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────
export default function ClientDetailLive() {
  const { id } = useParams()
  const navigate = useNavigate()
  const client = clients.find(c => c.id === Number(id))

  const { summary, daily, dailyGoogle, loading, error, refetch, lastUpdated } = useSheetData(
    client?.sheetsId,
    client?.sheetsTab,
    client?.sheetsTabDaily,
    client?.sheetsTabDailyGoogle ?? null,
  )

  if (!client) return (
    <Layout title="Cliente não encontrado">
      <button onClick={() => navigate('/clientes')} className="btn-ghost flex items-center gap-2">
        <ArrowLeft size={14} /> Voltar
      </button>
    </Layout>
  )

  const overallStatus = () => {
    if (!summary) return 'gray'
    const ss = [
      calcPositiveStatus(summary.leadsTotal.real, summary.leadsTotal.goal).status,
      calcCostStatus(summary.cpa.real, summary.cpa.goal).status,
      calcPositiveStatus(summary.investimento.real, summary.investimento.goal).status,
    ]
    if (ss.filter(s => s === 'red').length >= 2) return 'red'
    if (ss.some(s => s === 'red') || ss.some(s => s === 'yellow')) return 'yellow'
    return 'green'
  }

  // Daily totals
  const totalInvest = daily.reduce((a, d) => a + d.investimento, 0)
  const totalLeads  = daily.reduce((a, d) => a + d.leads, 0)
  const totalCliq   = daily.reduce((a, d) => a + d.cliques, 0)
  const totalImpr   = daily.reduce((a, d) => a + d.impressoes, 0)
  const totalWpp    = daily.reduce((a, d) => a + d.mensagemWpp, 0)
  const avgCPA      = totalLeads > 0 ? totalInvest / totalLeads : 0
  const avgCPC      = totalCliq  > 0 ? totalInvest / totalCliq  : 0
  const avgCTR      = totalImpr  > 0 ? (totalCliq  / totalImpr) * 100 : 0

  const dailyGoals      = client.goals
  const dailyLeadGoal   = daily.length > 0 ? dailyGoals.leads  / 31 : null
  const dailyCPAGoal    = dailyGoals.cpa
  const dailyInvestGoal = daily.length > 0 ? dailyGoals.investimento / 31 : null

  const dailyTotals = { totalInvest, totalImpr, totalCliq, totalWpp, totalLeads, avgCTR, avgCPC, avgCPA }

  // Google daily totals
  const ggInvest = dailyGoogle.reduce((a, d) => a + d.investimento, 0)
  const ggLeads  = dailyGoogle.reduce((a, d) => a + d.leads, 0)
  const ggCliq   = dailyGoogle.reduce((a, d) => a + d.cliques, 0)
  const ggImpr   = dailyGoogle.reduce((a, d) => a + d.impressoes, 0)
  const ggWpp    = dailyGoogle.reduce((a, d) => a + d.mensagemWpp, 0)
  const ggAvgCPA = ggLeads > 0 ? ggInvest / ggLeads : 0
  const ggAvgCPC = ggCliq  > 0 ? ggInvest / ggCliq  : 0
  const ggAvgCTR = ggImpr  > 0 ? (ggCliq  / ggImpr) * 100 : 0
  const googleTotals = { totalInvest: ggInvest, totalImpr: ggImpr, totalCliq: ggCliq, totalWpp: ggWpp, totalLeads: ggLeads, avgCTR: ggAvgCTR, avgCPC: ggAvgCPC, avgCPA: ggAvgCPA }

  return (
    <Layout
      title={client.name}
      subtitle="Dados ao vivo · Principal + Principal MTD"
      onRefresh={refetch}
    >
      <div className="space-y-6 animate-slide-up">

        {/* ── Header ── */}
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
                {!loading && summary && <StatusBadge status={overallStatus()} />}
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                {loading ? (
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <RefreshCw size={11} className="animate-spin" /> Carregando planilha...
                  </span>
                ) : error ? (
                  <span className="text-xs text-red-500 flex items-center gap-1">
                    <WifiOff size={11} /> Erro ao carregar
                  </span>
                ) : (
                  <span className="text-xs text-emerald-600 flex items-center gap-1">
                    <Wifi size={11} />
                    Ao vivo · {lastUpdated?.toLocaleTimeString('pt-BR')}
                    {daily.length > 0 && <span className="text-slate-400 ml-1">· {daily.length} dias com dados</span>}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={refetch} disabled={loading}
              className="btn-ghost flex items-center gap-1.5 text-xs">
              <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
              Atualizar
            </button>
            <a href={client.sheetsUrl} target="_blank" rel="noreferrer"
              className="btn-ghost flex items-center gap-1.5 text-xs">
              <ExternalLink size={13} />
              Abrir Sheets
            </a>
          </div>
        </div>

        {/* ── Error ── */}
        {error && (
          <div className="card p-5 border-l-4 border-red-400 bg-red-50/50 flex items-start gap-3">
            <AlertCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-red-700">Erro ao carregar planilha</p>
              <p className="text-xs text-red-500 mt-1">{error}</p>
              <button onClick={refetch} className="mt-2 text-xs text-red-600 font-semibold hover:underline">
                Tentar novamente
              </button>
            </div>
          </div>
        )}

        {/* ── Skeleton ── */}
        {loading && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="card p-4 animate-pulse">
                  <div className="h-3 bg-slate-100 rounded w-2/3 mb-3" />
                  <div className="h-6 bg-slate-100 rounded w-1/2 mb-2" />
                  <div className="h-2 bg-slate-100 rounded w-full" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── DATA ── */}
        {!loading && (summary || daily.length > 0) && (
          <>
            {summary && (
              <>
                {/* ── TOTAIS COMBINADOS ── */}
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">
                    Totais MTD — Projetado vs Realizado
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <SummaryCard label="Investimento Total" real={summary.investimento.real} goal={summary.investimento.goal}
                      icon={DollarSign} color="#06B6D4" fmtFn={fmtBRL} />
                    <SummaryCard label="Leads Totais" real={summary.leadsTotal.real} goal={summary.leadsTotal.goal}
                      icon={Target} color="#8B5CF6" fmtFn={fmtNum} />
                    <SummaryCard label="CPA Geral" real={summary.cpa.real} goal={summary.cpa.goal}
                      isCost icon={Zap} color="#EF4444" fmtFn={fmtBRL} />
                  </div>
                </div>

                {/* ── FACEBOOK ADS ── */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#1877F2' }} />
                    <p className="text-xs font-bold text-slate-700 uppercase tracking-widest">Facebook Ads</p>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                    <SummaryCard label="Investimento" real={summary.fb.investimento.real} goal={summary.fb.investimento.goal}
                      icon={DollarSign} color="#1877F2" fmtFn={fmtBRL} />
                    <SummaryCard label="Leads" real={summary.fb.leads.real} goal={summary.fb.leads.goal}
                      icon={Target} color="#1877F2" fmtFn={fmtNum} />
                    <SummaryCard label="CPA" real={summary.fb.cpa.real} goal={summary.fb.cpa.goal}
                      isCost icon={Zap} color="#1877F2" fmtFn={fmtBRL} />
                    <SummaryCard label="CPC" real={summary.fb.cpc.real} goal={summary.fb.cpc.goal}
                      isCost icon={MousePointer} color="#1877F2" fmtFn={fmtBRL} />
                    <SummaryCard label="CTR" real={summary.fb.ctr.real} goal={summary.fb.ctr.goal}
                      icon={TrendingUp} color="#1877F2" fmtFn={v => `${(v || 0).toFixed(2)}%`} />
                  </div>
                </div>

                {/* ── GOOGLE ADS ── */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#EA4335' }} />
                    <p className="text-xs font-bold text-slate-700 uppercase tracking-widest">Google Ads</p>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                    <SummaryCard label="Investimento" real={summary.gg.investimento.real} goal={summary.gg.investimento.goal}
                      icon={DollarSign} color="#EA4335" fmtFn={fmtBRL} />
                    <SummaryCard label="Leads" real={summary.gg.leads.real} goal={summary.gg.leads.goal}
                      icon={Target} color="#EA4335" fmtFn={fmtNum} />
                    <SummaryCard label="CPA" real={summary.gg.cpa.real} goal={summary.gg.cpa.goal}
                      isCost icon={Zap} color="#EA4335" fmtFn={fmtBRL} />
                    <SummaryCard label="CPC" real={summary.gg.cpc.real} goal={summary.gg.cpc.goal}
                      isCost icon={MousePointer} color="#EA4335" fmtFn={fmtBRL} />
                    <SummaryCard label="CTR" real={summary.gg.ctr.real} goal={summary.gg.ctr.goal}
                      icon={TrendingUp} color="#EA4335" fmtFn={v => `${(v || 0).toFixed(2)}%`} />
                  </div>
                </div>
              </>
            )}

            {/* ── GRÁFICOS DIÁRIOS ── */}
            {daily.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">
                  Evolução Diária — Principal MTD ({daily.length} dias)
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">

                  <ChartCard title="Investimento / Dia" icon={DollarSign} color="#06B6D4"
                    total={totalInvest} goal={summary?.investimento.goal} fmtFn={fmtBRL}>
                    <DailyBarChart data={daily} dataKey="investimento" color="#06B6D4"
                      formatter={fmtBRL} goalLine={dailyInvestGoal} />
                  </ChartCard>

                  <ChartCard title="Leads / Dia" icon={Target} color="#8B5CF6"
                    total={totalLeads} goal={summary?.leadsTotal.goal} fmtFn={fmtNum}>
                    <DailyBarChart data={daily} dataKey="leads" color="#8B5CF6"
                      formatter={fmtNum} goalLine={dailyLeadGoal} />
                  </ChartCard>

                  <ChartCard title="CPA / Dia" icon={Zap} color="#EF4444"
                    total={avgCPA} goal={summary?.cpa.goal} isCost fmtFn={fmtBRL}>
                    <DailyBarChart data={daily} dataKey="cpa" color="#EF4444"
                      formatter={fmtBRL} goalLine={dailyCPAGoal} />
                  </ChartCard>

                  <ChartCard title="Mensagem Wpp / Dia" icon={MessageCircle} color="#10B981"
                    total={totalWpp} fmtFn={fmtNum}>
                    <DailyBarChart data={daily} dataKey="mensagemWpp" color="#10B981"
                      formatter={fmtNum} />
                  </ChartCard>

                  <ChartCard title="Cliques / Dia" icon={MousePointer} color="#F59E0B"
                    total={totalCliq} fmtFn={fmtNum}>
                    <DailyBarChart data={daily} dataKey="cliques" color="#F59E0B"
                      formatter={fmtNum} />
                  </ChartCard>

                  <ChartCard title="Impressões / Dia" icon={Eye} color="#64748B"
                    total={totalImpr} fmtFn={v => fmtNum(v)}>
                    <DailyBarChart data={daily} dataKey="impressoes" color="#64748B"
                      formatter={fmtNum} />
                  </ChartCard>

                  <ChartCard title="CPC / Dia" icon={MousePointer} color="#1877F2"
                    total={avgCPC} isCost fmtFn={fmtBRL}>
                    <DailyBarChart data={daily} dataKey="cpc" color="#1877F2"
                      formatter={fmtBRL} />
                  </ChartCard>

                  <ChartCard title="CTR / Dia" icon={TrendingUp} color="#06B6D4"
                    total={avgCTR} fmtFn={v => `${(v || 0).toFixed(2)}%`}>
                    <DailyBarChart data={daily} dataKey="ctr" color="#06B6D4"
                      formatter={v => `${(v || 0).toFixed(2)}%`} />
                  </ChartCard>

                </div>
              </div>
            )}

            {/* ── GRÁFICOS DIÁRIOS GOOGLE ── */}
            {dailyGoogle.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">
                  Evolução Diária — MTD Google Ads ({dailyGoogle.length} dias)
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">

                  <ChartCard title="Investimento / Dia" icon={DollarSign} color="#EA4335"
                    total={ggInvest} goal={summary?.gg.investimento.goal} fmtFn={fmtBRL}>
                    <DailyBarChart data={dailyGoogle} dataKey="investimento" color="#EA4335"
                      formatter={fmtBRL} goalLine={dailyGoogle.length > 0 ? (summary?.gg.investimento.goal || 0) / 31 : null} />
                  </ChartCard>

                  <ChartCard title="Leads / Dia" icon={Target} color="#EA4335"
                    total={ggLeads} goal={summary?.gg.leads.goal} fmtFn={fmtNum}>
                    <DailyBarChart data={dailyGoogle} dataKey="leads" color="#EA4335"
                      formatter={fmtNum} goalLine={dailyGoogle.length > 0 ? (summary?.gg.leads.goal || 0) / 31 : null} />
                  </ChartCard>

                  <ChartCard title="CPA / Dia" icon={Zap} color="#FF6B6B"
                    total={ggAvgCPA} goal={summary?.gg.cpa.goal} isCost fmtFn={fmtBRL}>
                    <DailyBarChart data={dailyGoogle} dataKey="cpa" color="#FF6B6B"
                      formatter={fmtBRL} goalLine={summary?.gg.cpa.goal} />
                  </ChartCard>

                  <ChartCard title="Cliques / Dia" icon={MousePointer} color="#F59E0B"
                    total={ggCliq} fmtFn={fmtNum}>
                    <DailyBarChart data={dailyGoogle} dataKey="cliques" color="#F59E0B"
                      formatter={fmtNum} />
                  </ChartCard>

                  <ChartCard title="Impressões / Dia" icon={Eye} color="#64748B"
                    total={ggImpr} fmtFn={fmtNum}>
                    <DailyBarChart data={dailyGoogle} dataKey="impressoes" color="#64748B"
                      formatter={fmtNum} />
                  </ChartCard>

                  <ChartCard title="CPC / Dia" icon={MousePointer} color="#EA4335"
                    total={ggAvgCPC} isCost fmtFn={fmtBRL}>
                    <DailyBarChart data={dailyGoogle} dataKey="cpc" color="#EA4335"
                      formatter={fmtBRL} />
                  </ChartCard>

                  <ChartCard title="CTR / Dia" icon={TrendingUp} color="#FB923C"
                    total={ggAvgCTR} fmtFn={v => `${(v || 0).toFixed(2)}%`}>
                    <DailyBarChart data={dailyGoogle} dataKey="ctr" color="#FB923C"
                      formatter={v => `${(v || 0).toFixed(2)}%`} />
                  </ChartCard>

                </div>
              </div>
            )}

            {/* ── TABELAS DIÁRIAS ── */}
            {daily.length > 0 && (
              <div className="space-y-4">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
                  Dados Diários Completos
                </p>

                {/* Facebook */}
                <DailyTable
                  rows={daily}
                  title="Facebook Ads — Dados Diários"
                  color="#1877F2"
                  totals={dailyTotals}
                />

                {dailyGoogle.length > 0 && (
                  <DailyTable
                    rows={dailyGoogle}
                    title="Google Ads — Dados Diários"
                    color="#EA4335"
                    totals={googleTotals}
                  />
                )}
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  )
}
