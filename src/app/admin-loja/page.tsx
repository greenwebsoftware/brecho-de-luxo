'use client'
import { useState, useEffect } from 'react'
import { Eye, EyeOff, Star, StarOff, Package, ShoppingBag, TrendingUp, Clock } from 'lucide-react'
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

export default function AdminLojaPage() {
  const [aba, setAba] = useState<'pedidos' | 'produtos'>('pedidos')
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    carregarDados()
  }, [])

  const carregarDados = async () => {
    setLoading(true)
    const [pRes, pedRes] = await Promise.all([
      fetch('/api/admin/produtos'),
      fetch('/api/admin/pedidos'),
    ])
    const [pData, pedData] = await Promise.all([pRes.json(), pedRes.json()])
    setProdutos(pData.data || [])
    setPedidos(pedData.data || [])
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-luxo-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h1 className="font-serif text-white text-2xl font-bold">Painel da Loja Virtual</h1>
          <p className="text-gold-300 text-sm mt-1">Gerencie produtos e pedidos do site</p>
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
          {(['pedidos', 'produtos'] as const).map(a => (
            <button key={a} onClick={() => setAba(a)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
                aba === a ? 'bg-white shadow-sm text-luxo-900' : 'text-gray-500 hover:text-gray-700'
              }`}>
              {a}
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
      </div>
    </div>
  )
}
