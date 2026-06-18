'use client'
import { useState, useEffect } from 'react'
import { Eye, EyeOff, Star, StarOff, Package, ShoppingBag, TrendingUp, Clock, Lock, LogOut, Save, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

interface Produto {
  id: string; nome: string; preco_venda: number
  estoque_atual: number; visivel_site: boolean
  destaque: boolean; imagem_url?: string; imagens_site?: string[]
}

interface Pedido {
  id: string; numero: number; cliente_nome: string
  total: number; status: string; criado_em: string
  integrado_modasystem: boolean
}

interface SiteConfig {
  whatsapp?: string
  instagram?: string
  facebook?: string
  tiktok?: string
  email_contato?: string
  frete_gratis_acima?: number
  frete_fixo?: number
}

export default function AdminLojaPage() {
  const [autenticado, setAutenticado] = useState<boolean | null>(null)
  const [senha, setSenha] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)
  const [loginErro, setLoginErro] = useState('')

  const [aba, setAba] = useState<'pedidos' | 'produtos' | 'config'>('pedidos')
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [config, setConfig] = useState<SiteConfig>({})
  const [salvandoConfig, setSalvandoConfig] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    verificarLogin()
  }, [])

  const verificarLogin = async () => {
    const res = await fetch('/api/admin/produtos')
    if (res.status === 401) {
      setAutenticado(false)
    } else {
      setAutenticado(true)
      carregarDados()
    }
  }

  const fazerLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginLoading(true)
    setLoginErro('')
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ senha }),
      })
      if (res.ok) {
        setAutenticado(true)
        carregarDados()
      } else {
        setLoginErro('Senha incorreta')
      }
    } catch {
      setLoginErro('Erro ao conectar')
    }
    setLoginLoading(false)
  }

  const sair = async () => {
    await fetch('/api/admin/login', { method: 'DELETE' })
    setAutenticado(false)
    setSenha('')
  }

  const carregarDados = async () => {
    setLoading(true)
    const [pRes, pedRes, confRes] = await Promise.all([
      fetch('/api/admin/produtos'),
      fetch('/api/admin/pedidos'),
      fetch('/api/admin/config'),
    ])
    const [pData, pedData, confData] = await Promise.all([pRes.json(), pedRes.json(), confRes.json()])
    setProdutos(pData.data || [])
    setPedidos(pedData.data || [])
    setConfig(confData.data || {})
    setLoading(false)
  }

  const toggleVisivel = async (id: string, atual: boolean) => {
    await fetch(`/api/admin/produtos/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ visivel_site: !atual }),
    })
    setProdutos(prev => prev.map(p => p.id === id ? { ...p, visivel_site: !atual } : p))
    toast.success(!atual ? 'Produto visível no site' : 'Produto ocultado do site')
  }

  const toggleDestaque = async (id: string, atual: boolean) => {
    await fetch(`/api/admin/produtos/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ destaque: !atual }),
    })
    setProdutos(prev => prev.map(p => p.id === id ? { ...p, destaque: !atual } : p))
    toast.success(!atual ? 'Produto em destaque!' : 'Destaque removido')
  }

  const atualizarStatusPedido = async (id: string, status: string) => {
    await fetch(`/api/admin/pedidos/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    setPedidos(prev => prev.map(p => p.id === id ? { ...p, status } : p))
    toast.success('Status atualizado!')
  }

  const salvarConfig = async () => {
    setSalvandoConfig(true)
    try {
      const res = await fetch('/api/admin/config', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      })
      if (res.ok) toast.success('Configurações salvas!')
      else toast.error('Erro ao salvar')
    } catch {
      toast.error('Erro ao salvar')
    }
    setSalvandoConfig(false)
  }

  const fmt = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
  const fmtData = (d: string) => new Date(d).toLocaleDateString('pt-BR')

  const statusColors: Record<string, string> = {
    aguardando_pagamento: 'bg-amber-100 text-amber-700',
    pagamento_aprovado: 'bg-blue-100 text-blue-700',
    em_separacao: 'bg-purple-100 text-purple-700',
    enviado: 'bg-indigo-100 text-indigo-700',
    entregue: 'bg-green-100 text-green-700',
    cancelado: 'bg-red-100 text-red-700',
  }

  const metricas = {
    totalPedidos: pedidos.length,
    pedidosPendentes: pedidos.filter(p => p.status === 'aguardando_pagamento').length,
    totalVendido: pedidos.filter(p => p.status !== 'cancelado').reduce((s, p) => s + p.total, 0),
    produtosVisiveis: produtos.filter(p => p.visivel_site).length,
  }

  // TELA DE CARREGAMENTO INICIAL
  if (autenticado === null) {
    return (
      <div className="min-h-screen bg-luxo-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-gold-400 animate-spin" />
      </div>
    )
  }

  // TELA DE LOGIN
  if (!autenticado) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-luxo-900 to-luxo-800 flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-sm">
          <div className="w-14 h-14 rounded-full bg-gold-100 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-7 h-7 text-gold-600" />
          </div>
          <h1 className="font-serif text-2xl font-bold text-luxo-900 text-center mb-1">Área Restrita</h1>
          <p className="text-gray-400 text-sm text-center mb-6">Painel administrativo da loja</p>

          <form onSubmit={fazerLogin} className="space-y-4">
            <input
              type="password"
              value={senha}
              onChange={e => setSenha(e.target.value)}
              placeholder="Digite a senha de acesso"
              autoFocus
              className="input-luxo text-center"
            />
            {loginErro && (
              <p className="text-red-500 text-sm text-center">{loginErro}</p>
            )}
            <button type="submit" disabled={loginLoading}
              className="btn-gold w-full justify-center disabled:opacity-50">
              {loginLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
              {loginLoading ? 'Verificando...' : 'Entrar'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  // PAINEL ADMIN
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-luxo-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          <div>
            <h1 className="font-serif text-white text-2xl font-bold">Painel da Loja Virtual</h1>
            <p className="text-gold-300 text-sm mt-1">Gerencie produtos, pedidos e configurações do site</p>
          </div>
          <button onClick={sair}
            className="flex items-center gap-2 text-gold-300 hover:text-white text-sm transition-colors">
            <LogOut className="w-4 h-4" /> Sair
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* METRICAS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { Icon: ShoppingBag, label: 'Total Pedidos', value: metricas.totalPedidos, color: 'text-blue-600' },
            { Icon: Clock, label: 'Aguardando', value: metricas.pedidosPendentes, color: 'text-amber-600' },
            { Icon: TrendingUp, label: 'Total Vendido', value: fmt(metricas.totalVendido), color: 'text-green-600' },
            { Icon: Package, label: 'Prod. no Site', value: metricas.produtosVisiveis, color: 'text-purple-600' },
          ].map(({ Icon, label, value, color }) => (
            <div key={label} className="bg-white rounded-2xl p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-full bg-gray-50 flex items-center justify-center">
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <span className="text-xs text-gray-500">{label}</span>
              </div>
              <div className={`text-2xl font-bold ${color}`}>{value}</div>
            </div>
          ))}
        </div>

        {/* ABAS */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit mb-6">
          {(['pedidos', 'produtos', 'config'] as const).map(a => (
            <button key={a} onClick={() => setAba(a)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
                aba === a ? 'bg-white shadow-sm text-luxo-900' : 'text-gray-500 hover:text-gray-700'
              }`}>
              {a === 'config' ? 'Configurações' : a}
            </button>
          ))}
        </div>

        {/* PEDIDOS */}
        {aba === 'pedidos' && (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">Pedido</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">Cliente</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">Total</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">Data</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">ModaSystem</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {pedidos.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-12 text-gray-400">Nenhum pedido ainda</td></tr>
                ) : pedidos.map(p => (
                  <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono font-bold text-gold-600">#{p.numero}</td>
                    <td className="px-4 py-3 text-gray-800">{p.cliente_nome}</td>
                    <td className="px-4 py-3 font-semibold">{fmt(p.total)}</td>
                    <td className="px-4 py-3 text-gray-500">{fmtData(p.criado_em)}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                        p.integrado_modasystem ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {p.integrado_modasystem ? '✓ Integrado' : 'Pendente'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={p.status}
                        onChange={e => atualizarStatusPedido(p.id, e.target.value)}
                        className={`text-xs font-medium px-2 py-1 rounded-full border-0 outline-none cursor-pointer ${statusColors[p.status] || 'bg-gray-100 text-gray-600'}`}
                      >
                        {Object.keys(statusColors).map(s => (
                          <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* PRODUTOS */}
        {aba === 'produtos' && (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">Produto</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">Preço</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">Estoque</th>
                  <th className="text-center px-4 py-3 text-xs text-gray-500 font-medium">Visível</th>
                  <th className="text-center px-4 py-3 text-xs text-gray-500 font-medium">Destaque</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={5} className="text-center py-12 text-gray-400">Carregando...</td></tr>
                ) : produtos.map(p => {
                  const imgs = p.imagens_site as string[] | null
                  const img = imgs?.[0] || p.imagem_url
                  return (
                    <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                            {img ? <img src={img} alt={p.nome} className="w-full h-full object-cover" />
                              : <div className="w-full h-full flex items-center justify-center text-lg">👜</div>}
                          </div>
                          <span className="font-medium text-gray-800 truncate max-w-48">{p.nome}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-semibold text-gold-600">{fmt(p.preco_venda)}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                          p.estoque_atual > 5 ? 'bg-green-100 text-green-700'
                          : p.estoque_atual > 0 ? 'bg-amber-100 text-amber-700'
                          : 'bg-red-100 text-red-700'
                        }`}>{p.estoque_atual} un</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button onClick={() => toggleVisivel(p.id, p.visivel_site)}
                          className={`w-9 h-9 rounded-full flex items-center justify-center mx-auto transition-colors ${
                            p.visivel_site ? 'bg-green-100 text-green-600 hover:bg-green-200' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                          }`}>
                          {p.visivel_site ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button onClick={() => toggleDestaque(p.id, p.destaque)}
                          className={`w-9 h-9 rounded-full flex items-center justify-center mx-auto transition-colors ${
                            p.destaque ? 'bg-gold-100 text-gold-600 hover:bg-gold-200' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                          }`}>
                          {p.destaque ? <Star className="w-4 h-4" /> : <StarOff className="w-4 h-4" />}
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* CONFIGURACOES */}
        {aba === 'config' && (
          <div className="bg-white rounded-2xl shadow-sm p-6 max-w-2xl">
            <h3 className="font-semibold text-gray-800 mb-1">Contato e Redes Sociais</h3>
            <p className="text-xs text-gray-400 mb-6">
              Essas informações aparecem automaticamente no rodapé, no botão flutuante e no cabeçalho do site
            </p>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">WhatsApp (com DDD e país)</label>
                <input
                  value={config.whatsapp || ''}
                  onChange={e => setConfig({ ...config, whatsapp: e.target.value })}
                  placeholder="5511900000000"
                  className="input-luxo"
                />
                <p className="text-[11px] text-gray-400 mt-1">Formato: 55 + DDD + número, sem espaços ou símbolos</p>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Instagram (usuário)</label>
                <input
                  value={config.instagram || ''}
                  onChange={e => setConfig({ ...config, instagram: e.target.value })}
                  placeholder="brechodeluxo"
                  className="input-luxo"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Facebook (usuário ou página)</label>
                <input
                  value={config.facebook || ''}
                  onChange={e => setConfig({ ...config, facebook: e.target.value })}
                  placeholder="brechodeluxo"
                  className="input-luxo"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">TikTok (usuário)</label>
                <input
                  value={config.tiktok || ''}
                  onChange={e => setConfig({ ...config, tiktok: e.target.value })}
                  placeholder="brechodeluxo"
                  className="input-luxo"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">E-mail de Contato</label>
                <input
                  type="email"
                  value={config.email_contato || ''}
                  onChange={e => setConfig({ ...config, email_contato: e.target.value })}
                  placeholder="contato@brechodeluxo.com.br"
                  className="input-luxo"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-100">
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">Frete grátis a partir de (R$)</label>
                  <input
                    type="number"
                    value={config.frete_gratis_acima || ''}
                    onChange={e => setConfig({ ...config, frete_gratis_acima: Number(e.target.value) })}
                    placeholder="299"
                    className="input-luxo"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">Frete fixo (R$)</label>
                  <input
                    type="number"
                    value={config.frete_fixo || ''}
                    onChange={e => setConfig({ ...config, frete_fixo: Number(e.target.value) })}
                    placeholder="19.90"
                    className="input-luxo"
                  />
                </div>
              </div>
            </div>

            <button onClick={salvarConfig} disabled={salvandoConfig}
              className="btn-gold mt-6 disabled:opacity-50">
              {salvandoConfig ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {salvandoConfig ? 'Salvando...' : 'Salvar Configurações'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
