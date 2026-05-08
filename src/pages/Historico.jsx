import { CheckCircle, XCircle, AlertTriangle, RefreshCw, Database, Clock } from 'lucide-react'
import Layout from '../components/Layout'
import { syncLogs } from '../data/mockData'

const STATUS_CFG = {
  success: { icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-50', label: 'Sucesso', badgeCls: 'badge-green' },
  error: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-50', label: 'Erro', badgeCls: 'badge-red' },
  warning: { icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-50', label: 'Aviso', badgeCls: 'badge-yellow' },
}

export default function Historico() {
  const stats = {
    total: syncLogs.length,
    success: syncLogs.filter(l => l.status === 'success').length,
    error: syncLogs.filter(l => l.status === 'error').length,
    warning: syncLogs.filter(l => l.status === 'warning').length,
    rows: syncLogs.reduce((a, l) => a + l.rows, 0),
  }

  return (
    <Layout title="Histórico de Sincronização" subtitle="Logs de atualização dos dados via Google Sheets">
      <div className="space-y-6 animate-slide-up">

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total de syncs', value: stats.total, icon: Database, color: '#06B6D4' },
            { label: 'Sucesso', value: stats.success, icon: CheckCircle, color: '#10B981' },
            { label: 'Com erros', value: stats.error, icon: XCircle, color: '#EF4444' },
            { label: 'Linhas importadas', value: stats.rows, icon: RefreshCw, color: '#8B5CF6' },
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

        {/* Log table */}
        <div className="card overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-800">Log de Atualizações</h3>
              <p className="text-xs text-slate-400 mt-0.5">Últimas {syncLogs.length} sincronizações</p>
            </div>
            <button className="btn-ghost flex items-center gap-1.5 text-xs">
              <RefreshCw size={13} />
              Sincronizar agora
            </button>
          </div>

          <div className="divide-y divide-slate-50">
            {syncLogs.map(log => {
              const cfg = STATUS_CFG[log.status] || STATUS_CFG.success
              const Icon = cfg.icon
              return (
                <div key={log.id} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50/80 transition-colors">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg.bg}`}>
                    <Icon size={16} className={cfg.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800">{log.clientName}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Clock size={11} className="text-slate-400" />
                      <p className="text-xs text-slate-400">{log.timestamp}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={cfg.badgeCls + ' inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold'}>
                      {log.status === 'success' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                      {log.status === 'error' && <span className="w-1.5 h-1.5 rounded-full bg-red-500" />}
                      {log.status === 'warning' && <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />}
                      {cfg.label}
                    </span>
                    <p className="text-xs text-slate-400 mt-1">
                      {log.rows > 0 ? `${log.rows} linha${log.rows !== 1 ? 's' : ''} importada${log.rows !== 1 ? 's' : ''}` : 'Sem dados'}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Info card */}
        <div className="card p-5 border-l-4 border-cyan-400 bg-cyan-50/50">
          <h4 className="text-sm font-semibold text-slate-800 mb-1">Como funciona a integração</h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            O sistema conecta ao Google Sheets via API e importa os dados automaticamente.
            Cada linha nova na planilha dispara uma atualização nos gráficos e tabelas.
            Use o botão "Atualizar dados" no topo para forçar uma sincronização manual.
          </p>
          <div className="flex gap-6 mt-3">
            {[
              { label: 'Frequência automática', val: 'A cada 30 min' },
              { label: 'Última verificação', val: '08/05/2026 09:14' },
              { label: 'Clientes conectados', val: '5 / 5' },
            ].map(i => (
              <div key={i.label}>
                <p className="text-xs text-slate-400">{i.label}</p>
                <p className="text-xs font-semibold text-slate-700">{i.val}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  )
}
