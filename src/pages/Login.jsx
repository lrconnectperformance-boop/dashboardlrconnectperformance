import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, ArrowRight, Shield, BarChart3, TrendingUp } from 'lucide-react'
import { login } from '../auth'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    setTimeout(() => {
      const ok = login(email, password)
      if (ok) {
        navigate('/dashboard')
      } else {
        setError('E-mail ou senha incorretos.')
        setLoading(false)
      }
    }, 600)
  }

  return (
    <div className="min-h-screen flex" style={{ background: 'linear-gradient(135deg, #050D1A 0%, #0F2040 50%, #0A1628 100%)' }}>
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-16 relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 pointer-events-none">
          <div style={{
            position: 'absolute', top: '-20%', left: '-10%',
            width: 500, height: 500, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(0,212,255,0.06) 0%, transparent 70%)',
          }} />
          <div style={{
            position: 'absolute', bottom: '-10%', right: '-20%',
            width: 400, height: 400, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 70%)',
          }} />
          {/* Grid lines */}
          <svg className="absolute inset-0 w-full h-full opacity-5" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
                <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#06B6D4" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0"
            style={{ background: 'rgba(255,255,255,0.06)' }}>
            <img src="/logo.svg" alt="L&R" className="w-8 h-8 object-contain" />
          </div>
          <div>
            <p className="text-white font-bold">L&amp;R Connect</p>
            <p className="text-cyan-400 text-xs font-medium">Performance</p>
          </div>
        </div>

        {/* Hero text */}
        <div className="relative space-y-6">
          <div>
            <h1 className="text-5xl font-bold text-white leading-tight">
              Dashboard de<br />
              <span className="text-gradient">Alta Performance</span>
            </h1>
            <p className="text-slate-400 mt-4 text-lg leading-relaxed max-w-md">
              Acompanhe suas contas de tráfego pago em tempo real. Projetado x Realizado com clareza total.
            </p>
          </div>

          {/* Feature pills */}
          <div className="flex flex-wrap gap-3">
            {[
              { icon: BarChart3, label: 'Gráficos diários' },
              { icon: TrendingUp, label: 'Projetado vs Real' },
              { icon: Shield, label: 'Google Sheets API' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="glass flex items-center gap-2 px-4 py-2 rounded-full">
                <Icon size={13} className="text-cyan-400" />
                <span className="text-slate-300 text-sm">{label}</span>
              </div>
            ))}
          </div>

        </div>

        {/* Footer */}
        <p className="relative text-slate-600 text-sm">
          © 2026 L&amp;R Connect Performance. Todos os direitos reservados.
        </p>
      </div>

      {/* Right panel - form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0"
              style={{ background: 'rgba(255,255,255,0.06)' }}>
              <img src="/logo.svg" alt="L&R" className="w-7 h-7 object-contain" />
            </div>
            <div>
              <p className="text-white font-bold text-sm">L&amp;R Connect Performance</p>
            </div>
          </div>

          <div className="glass rounded-3xl p-8 shadow-2xl">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white">Bem-vindo de volta</h2>
              <p className="text-slate-400 text-sm mt-1">Acesse seu dashboard de performance</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">E-mail</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder:text-slate-500
                             border border-white/10 bg-white/5 focus:outline-none
                             focus:ring-2 focus:ring-cyan-400/40 focus:border-cyan-400/60 transition-all"
                />
              </div>

              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">Senha</label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 pr-12 rounded-xl text-sm text-white placeholder:text-slate-500
                               border border-white/10 bg-white/5 focus:outline-none
                               focus:ring-2 focus:ring-cyan-400/40 focus:border-cyan-400/60 transition-all"
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors">
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="rounded border-white/20 bg-white/10 text-cyan-400" />
                  <span className="text-slate-400 text-sm">Lembrar de mim</span>
                </label>
                <button type="button" className="text-cyan-400 text-sm hover:text-cyan-300 transition-colors">
                  Esqueceu a senha?
                </button>
              </div>

              {error && (
                <p className="text-red-400 text-sm text-center -mb-1">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary flex items-center justify-center gap-2 py-3 text-sm mt-2">
                {loading ? (
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                ) : (
                  <>Acessar Dashboard <ArrowRight size={16} /></>
                )}
              </button>
            </form>

          </div>
        </div>
      </div>
    </div>
  )
}
