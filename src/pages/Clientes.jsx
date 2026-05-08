import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Plus, Search, ExternalLink, ChevronRight,
  Facebook, Globe, Target, TrendingUp, Users,
} from 'lucide-react'
import Layout from '../components/Layout'
import { clients } from '../data/mockData'
import { fmtBRL, fmtNum } from '../utils/metrics'
import { useSheetSummary } from '../hooks/useSheetData'

const CANAL_COLORS = {
  Facebook: '#1877F2',
  Google: '#EA4335',
  'Facebook + Google': '#6366F1',
}
const CANAL_ICONS = { Facebook: Facebook, Google: Globe, 'Facebook + Google': Globe }

function LiveMetrics({ client }) {
  const { summary, loading } = useSheetSummary(client.sheetsId, client.sheetsTab)

  const invest = summary?.investimento?.real ?? null
  const leads  = summary?.leadsTotal?.real  ?? null
  const cpa    = summary?.cpa?.real         ?? null

  const metrics = [
    { label: 'Investimento', val: loading ? '...' : fmtBRL(invest), goal: fmtBRL(client.goals.investimento) },
    { label: 'Leads',        val: loading ? '...' : fmtNum(leads),  goal: fmtNum(client.goals.leads) },
    { label: 'CPA',          val: loading ? '...' : fmtBRL(cpa),    goal: fmtBRL(client.goals.cpa) },
  ]

  return (
    <div className="grid grid-cols-3 gap-3">
      {metrics.map(m => (
        <div key={m.label} className="bg-slate-50 rounded-xl p-3">
          <p className="text-xs text-slate-500 mb-0.5">{m.label}</p>
          <p className="text-sm font-bold text-slate-800">{m.val}</p>
          <p className="text-xs text-slate-400">meta: {m.goal}</p>
        </div>
      ))}
    </div>
  )
}

export default function Clientes() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [newClient, setNewClient] = useState({ name: '', canal: 'Facebook', sheetsUrl: '', sector: '' })

  const rows = clients
    .filter(c => c.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <Layout title="Clientes" subtitle="Gerencie contas e integrações com Google Sheets">
      <div className="space-y-6 animate-slide-up">

        {/* Toolbar */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar cliente..."
              className="pl-8 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl
                         focus:outline-none focus:ring-2 focus:ring-cyan-400/30 focus:border-cyan-400 w-64"
            />
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="btn-primary flex items-center gap-2 text-sm">
            <Plus size={15} />
            Novo Cliente
          </button>
        </div>

        {/* New client form */}
        {showForm && (
          <div className="card p-6 border-2 border-cyan-200/60 animate-slide-up">
            <h3 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <Plus size={15} className="text-cyan-500" />
              Cadastrar Novo Cliente
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Nome do cliente</label>
                <input
                  value={newClient.name}
                  onChange={e => setNewClient({ ...newClient, name: e.target.value })}
                  placeholder="Ex: Clínica Bella"
                  className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-400/30"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Setor</label>
                <input
                  value={newClient.sector}
                  onChange={e => setNewClient({ ...newClient, sector: e.target.value })}
                  placeholder="Ex: Saúde & Estética"
                  className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-400/30"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Canal</label>
                <select
                  value={newClient.canal}
                  onChange={e => setNewClient({ ...newClient, canal: e.target.value })}
                  className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-400/30">
                  <option>Facebook</option>
                  <option>Google</option>
                  <option>Ambos</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Link Google Sheets</label>
                <input
                  value={newClient.sheetsUrl}
                  onChange={e => setNewClient({ ...newClient, sheetsUrl: e.target.value })}
                  placeholder="https://docs.google.com/..."
                  className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-400/30"
                />
              </div>
            </div>
            <div className="flex items-center gap-3 mt-4">
              <button className="btn-primary text-sm py-2 px-5">Salvar cliente</button>
              <button onClick={() => setShowForm(false)} className="btn-ghost text-sm">Cancelar</button>
            </div>
          </div>
        )}

        {/* Summary stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total de clientes', value: clients.length, icon: Users, color: '#06B6D4' },
            { label: 'Meta alcançada', value: 0, icon: Target, color: '#10B981' },
            { label: 'Em atenção', value: 0, icon: TrendingUp, color: '#F59E0B' },
            { label: 'Críticos', value: 0, icon: Target, color: '#EF4444' },
          ].map(s => (
            <div key={s.label} className="card p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${s.color}15` }}>
                <s.icon size={18} style={{ color: s.color }} />
              </div>
              <div>
                <p className="text-xl font-bold text-slate-900">{s.value}</p>
                <p className="text-xs text-slate-400">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Client cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {rows.map(client => {
            const CanalIcon = CANAL_ICONS[client.canal] || Globe

            return (
              <div
                key={client.id}
                onClick={() => navigate(`/clientes/${client.id}`)}
                className="card card-hover p-5 cursor-pointer relative overflow-hidden">
                {/* accent */}
                <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl"
                  style={{ background: `linear-gradient(90deg, ${client.color}, transparent)` }} />

                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold"
                      style={{ background: `linear-gradient(135deg, ${client.color}, ${client.color}99)` }}>
                      {client.avatar}
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800 text-sm">{client.name}</h3>
                      <p className="text-xs text-slate-400">{client.sector}</p>
                    </div>
                  </div>
                  {client.isLive && (
                    <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Ao vivo</span>
                  )}
                </div>

                {/* Canal badge */}
                <div className="flex items-center gap-2 mb-4">
                  <span className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full text-white"
                    style={{ background: CANAL_COLORS[client.canal] || '#64748B' }}>
                    <CanalIcon size={11} />
                    {client.canal}
                  </span>
                  <a
                    href={client.sheetsUrl}
                    target="_blank"
                    rel="noreferrer"
                    onClick={e => e.stopPropagation()}
                    className="flex items-center gap-1 text-xs text-slate-400 hover:text-cyan-500 transition-colors">
                    <ExternalLink size={11} />
                    Sheets
                  </a>
                </div>

                {/* Live metrics */}
                {client.isLive
                  ? <LiveMetrics client={client} />
                  : (
                    <div className="grid grid-cols-3 gap-3">
                      {['Investimento', 'Leads', 'CPA'].map(l => (
                        <div key={l} className="bg-slate-50 rounded-xl p-3">
                          <p className="text-xs text-slate-500 mb-0.5">{l}</p>
                          <p className="text-sm font-bold text-slate-400">—</p>
                        </div>
                      ))}
                    </div>
                  )}

                <div className="flex items-center justify-end mt-4 pt-4 border-t border-slate-100">
                  <ChevronRight size={14} className="text-slate-300" />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </Layout>
  )
}
