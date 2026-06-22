'use client'
import { useState, useEffect, useRef } from 'react'
import { Eye, EyeOff, Star, StarOff, Package, ShoppingBag, TrendingUp,
  Clock, Lock, LogOut, Save, Loader2, Plus, Trash2, Upload, X, Edit } from 'lucide-react'
import toast from 'react-hot-toast'

interface Produto {
  id: string; nome: string; preco_venda: number
  estoque_atual: number; visivel_site: boolean
  destaque: boolean; imagem_url?: string; imagens_site?: string[]
  publicado_loja?: boolean
}

interface ProdutoOnline {
  id: string; nome: string; preco: number; preco_promocional?: number
  estoque: number; categoria?: string; subcategoria?: string; marca?: string
  tamanhos: string[]; cores: string[]; fotos: string[]
  peso: number; visivel: boolean; destaque: boolean; descricao?: string
}

interface Pedido {
  id: string; numero: number; cliente_nome: string
  total: number; status: string; criado_em: string
  integrado_modasystem: boolean
}

interface SiteConfig {
  whatsapp?: string; instagram?: string; facebook?: string
  tiktok?: string; email_contato?: string
  frete_gratis_acima?: number; frete_fixo?: number
  cep_origem?: string; melhor_envio_token?: string
}

const CATEGORIAS_OPTS = ['Roupas', 'Bolsas', 'Calçados', 'Acessórios']

export default function AdminLojaPage() {
  const [autenticado, setAutenticado] = useState<boolean | null>(null)
  const [senha, setSenha] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)
  const [loginErro, setLoginErro] = useState('')

  const [aba, setAba] = useState<'pedidos' | 'produtos' | 'online' | 'config'>('pedidos')
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [produtosOnline, setProdutosOnline] = useState<ProdutoOnline[]>([])
  const [config, setConfig] = useState<SiteConfig>({})
  const [salvandoConfig, setSalvandoConfig] = useState(false)
  const [loading, setLoading] = useState(true)

  // Modal produto online
  const [modalOnline, setModalOnline] = useState(false)
  const [editandoOnline, setEditandoOnline] = useState<ProdutoOnline | null>(null)
  const [formOnline, setFormOnline] = useState<Partial<ProdutoOnline>>({
    fotos: [], tamanhos: [], cores: [], visivel: true, destaque: false, peso: 0.3
  })
  const [novaFoto, setNovaFoto] = useState('')
  const [novoTamanho, setNovoTamanho] = useState('')
  const [novaCor, setNovaCor] = useState('')
  const [uploadingFoto, setUploadingFoto] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  // Modal publicar produto do estoque
  const [modalPublicar, setModalPublicar] = useState(false)
  const [produtoPublicar, setProdutoPublicar] = useState<Produto | null>(null)
  const [formPublicar, setFormPublicar] = useState<{
    descricao_loja: string; marca: string; subcategoria: string
    fotos_loja: string[]; peso: number; destaque: boolean
    altura_cm: number; largura_cm: number; comprimento_cm: number
  }>({
    descricao_loja: '', marca: '', subcategoria: '', fotos_loja: [],
    peso: 0.3, destaque: false, altura_cm: 5, largura_cm: 20, comprimento_cm: 30
  })
  const [novaFotoPublicar, setNovaFotoPublicar] = useState('')
  const [salvandoPublicar, setSalvandoPublicar] = useState(false)

  useEffect(() => { verificarLogin() }, [])

  const verificarLogin = async () => {
    const res = await fetch('/api/admin/produtos')
    if (res.status === 401) setAutenticado(false)
    else { setAutenticado(true); carregarDados() }
  }

  const fazerLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginLoading(true); setLoginErro('')
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ senha }),
    })
    if (res.ok) { setAutenticado(true); carregarDados() }
    else setLoginErro('Senha incorreta')
    setLoginLoading(false)
  }

  const sair = async () => {
    await fetch('/api/admin/login', { method: 'DELETE' })
    setAutenticado(false); setSenha('')
  }

  const carregarDados = async () => {
    setLoading(true)
    const [pRes, pedRes, poRes, confRes] = await Promise.all([
      fetch('/api/admin/produtos'),
      fetch('/api/admin/pedidos'),
      fetch('/api/admin/produtos-online'),
      fetch('/api/admin/config'),
    ])
    const [pData, pedData, poData, confData] = await Promise.all([
      pRes.json(), pedRes.json(), poRes.json(), confRes.json()
    ])
    setProdutos(pData.data || [])
    setPedidos(pedData.data || [])
    setProdutosOnline(poData.data || [])
    setConfig(confData.data || {})
    setLoading(false)
  }

  const fmt = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
  const fmtData = (d: string) => new Date(d).toLocaleDateString('pt-BR')

  // ---- PRODUTOS ESTOQUE ----
  const toggleVisivel = async (id: string, atual: boolean) => {
    await fetch(`/api/admin/produtos/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ visivel_site: !atual }),
    })
    setProdutos(prev => prev.map(p => p.id === id ? { ...p, visivel_site: !atual } : p))
    toast.success(!atual ? 'Visível no site' : 'Ocultado do site')
  }

  const toggleDestaque = async (id: string, atual: boolean) => {
    await fetch(`/api/admin/produtos/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ destaque: !atual }),
    })
    setProdutos(prev => prev.map(p => p.id === id ? { ...p, destaque: !atual } : p))
    toast.success(!atual ? 'Em destaque!' : 'Destaque removido')
  }

  const abrirModalPublicar = (p: Produto) => {
    setProdutoPublicar(p)
    setFormPublicar({
      descricao_loja: '', marca: '', subcategoria: '', fotos_loja: [],
      peso: 0.3, destaque: false, altura_cm: 5, largura_cm: 20, comprimento_cm: 30
    })
    setModalPublicar(true)
  }

  const salvarPublicar = async () => {
    if (!produtoPublicar) return
    setSalvandoPublicar(true)
    const res = await fetch(`/api/admin/produtos/${produtoPublicar.id}/publicar`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...formPublicar, visivel_site: true }),
    })
    if (res.ok) {
      toast.success('Produto publicado na loja virtual!')
      setModalPublicar(false)
      carregarDados()
    } else toast.error('Erro ao publicar')
    setSalvandoPublicar(false)
  }

  // ---- PRODUTOS ONLINE ----
  const abrirModalNovo = () => {
    setEditandoOnline(null)
    setFormOnline({ fotos: [], tamanhos: [], cores: [], visivel: true, destaque: false, peso: 0.3 })
    setModalOnline(true)
  }

  const abrirModalEditar = (p: ProdutoOnline) => {
    setEditandoOnline(p)
    setFormOnline({ ...p })
    setModalOnline(true)
  }

  const uploadFoto = async (file: File) => {
    setUploadingFoto(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/admin/upload-foto', { method: 'POST', body: formData })
      const data = await res.json()
      if (data.url) {
        setFormOnline(prev => ({ ...prev, fotos: [...(prev.fotos || []), data.url] }))
        toast.success('Foto enviada!')
      }
    } catch { toast.error('Erro ao enviar foto') }
    setUploadingFoto(false)
  }

  const adicionarFotoURL = () => {
    if (!novaFoto.trim()) return
    setFormOnline(prev => ({ ...prev, fotos: [...(prev.fotos || []), novaFoto.trim()] }))
    setNovaFoto('')
  }

  const removerFoto = (idx: number) => {
    setFormOnline(prev => ({ ...prev, fotos: (prev.fotos || []).filter((_, i) => i !== idx) }))
  }

  const adicionarFotoPublicar = () => {
    if (!novaFotoPublicar.trim()) return
    setFormPublicar(prev => ({ ...prev, fotos_loja: [...prev.fotos_loja, novaFotoPublicar.trim()] }))
    setNovaFotoPublicar('')
  }

  const salvarProdutoOnline = async () => {
    if (!formOnline.nome || !formOnline.preco) {
      toast.error('Nome e preço são obrigatórios'); return
    }
    const url = editandoOnline
      ? `/api/admin/produtos-online/${editandoOnline.id}`
      : '/api/admin/produtos-online'
    const res = await fetch(url, {
      method: editandoOnline ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formOnline),
    })
    if (res.ok) {
      toast.success(editandoOnline ? 'Produto atualizado!' : 'Produto criado!')
      setModalOnline(false)
      carregarDados()
    } else toast.error('Erro ao salvar')
  }

  const excluirProdutoOnline = async (id: string) => {
    if (!confirm('Excluir este produto?')) return
    await fetch(`/api/admin/produtos-online/${id}`, { method: 'DELETE' })
    toast.success('Produto excluído')
    carregarDados()
  }

  const salvarConfig = async () => {
    setSalvandoConfig(true)
    const res = await fetch('/api/admin/config', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    })
    if (res.ok) toast.success('Configurações salvas!')
    else toast.error('Erro ao salvar')
    setSalvandoConfig(false)
  }

  const atualizarStatusPedido = async (id: string, status: string) => {
    await fetch(`/api/admin/pedidos/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    setPedidos(prev => prev.map(p => p.id === id ? { ...p, status } : p))
    toast.success('Status atualizado!')
  }

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
    produtosVisiveis: produtos.filter(p => p.visivel_site).length + produtosOnline.filter(p => p.visivel).length,
  }

  if (autenticado === null) return (
    <div className="min-h-screen bg-luxo-900 flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-gold-400 animate-spin" />
    </div>
  )

  if (!autenticado) return (
    <div className="min-h-screen bg-gradient-to-br from-luxo-900 to-luxo-800 flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-sm">
        <div className="w-14 h-14 rounded-full bg-gold-100 flex items-center justify-center mx-auto mb-4">
          <Lock className="w-7 h-7 text-gold-600" />
        </div>
        <h1 className="font-serif text-2xl font-bold text-luxo-900 text-center mb-1">Área Restrita</h1>
        <p className="text-gray-400 text-sm text-center mb-6">Painel administrativo da loja</p>
        <form onSubmit={fazerLogin} className="space-y-4">
          <input type="password" value={senha} onChange={e => setSenha(e.target.value)}
            placeholder="Digite a senha de acesso" autoFocus className="input-luxo text-center" />
          {loginErro && <p className="text-red-500 text-sm text-center">{loginErro}</p>}
          <button type="submit" disabled={loginLoading} className="btn-gold w-full justify-center disabled:opacity-50">
            {loginLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
            {loginLoading ? 'Verificando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-luxo-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          <div>
            <h1 className="font-serif text-white text-2xl font-bold">Painel da Loja Virtual</h1>
            <p className="text-gold-300 text-sm mt-1">Gerencie produtos, pedidos e configurações</p>
          </div>
          <button onClick={sair} className="flex items-center gap-2 text-gold-300 hover:text-white text-sm transition-colors">
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
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit mb-6 flex-wrap">
          {[
            { key: 'pedidos', label: 'Pedidos' },
            { key: 'produtos', label: 'Estoque → Site' },
            { key: 'online', label: 'Produtos Online' },
            { key: 'config', label: 'Configurações' },
          ].map(a => (
            <button key={a.key} onClick={() => setAba(a.key as typeof aba)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                aba === a.key ? 'bg-white shadow-sm text-luxo-900' : 'text-gray-500 hover:text-gray-700'
              }`}>
              {a.label}
            </button>
          ))}
        </div>

        {/* ---- PEDIDOS ---- */}
        {aba === 'pedidos' && (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-4 py-3 text-xs text-gray-500">Pedido</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-500">Cliente</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-500">Total</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-500">Data</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-500">ModaSystem</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-500">Status</th>
                </tr>
              </thead>
              <tbody>
                {pedidos.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-12 text-gray-400">Nenhum pedido ainda</td></tr>
                ) : pedidos.map(p => (
                  <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono font-bold text-gold-600">#{p.numero}</td>
                    <td className="px-4 py-3">{p.cliente_nome}</td>
                    <td className="px-4 py-3 font-semibold">{fmt(p.total)}</td>
                    <td className="px-4 py-3 text-gray-500">{fmtData(p.criado_em)}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full ${p.integrado_modasystem ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {p.integrado_modasystem ? '✓ Integrado' : 'Pendente'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <select value={p.status} onChange={e => atualizarStatusPedido(p.id, e.target.value)}
                        className={`text-xs px-2 py-1 rounded-full border-0 outline-none cursor-pointer ${statusColors[p.status] || 'bg-gray-100'}`}>
                        {Object.keys(statusColors).map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ---- ESTOQUE → SITE ---- */}
        {aba === 'produtos' && (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <p className="text-sm text-gray-500">
                Produtos do estoque físico. Clique em <strong>"Publicar"</strong> para adicionar fotos e descrição e torná-lo visível na loja virtual.
              </p>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-4 py-3 text-xs text-gray-500">Produto</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-500">Preço</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-500">Estoque</th>
                  <th className="text-center px-4 py-3 text-xs text-gray-500">Visível</th>
                  <th className="text-center px-4 py-3 text-xs text-gray-500">Destaque</th>
                  <th className="text-center px-4 py-3 text-xs text-gray-500">Ações</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} className="text-center py-12 text-gray-400">Carregando...</td></tr>
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
                          <div>
                            <span className="font-medium text-gray-800 truncate max-w-48 block">{p.nome}</span>
                            {p.publicado_loja && <span className="text-xs text-green-600">✓ Publicado</span>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-semibold text-gold-600">{fmt(p.preco_venda)}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-1 rounded-full ${
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
                      <td className="px-4 py-3 text-center">
                        <button onClick={() => abrirModalPublicar(p)}
                          className="btn-primary btn-sm bg-luxo-700 hover:bg-luxo-800 text-white text-xs px-3 py-1.5 rounded-lg">
                          {p.publicado_loja ? '✏️ Editar' : '🚀 Publicar'}
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* ---- PRODUTOS ONLINE ---- */}
        {aba === 'online' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <p className="text-sm text-gray-500">Produtos exclusivos da loja virtual — não vinculados ao estoque físico</p>
              <button onClick={abrirModalNovo} className="btn-gold">
                <Plus className="w-4 h-4" /> Novo Produto
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {produtosOnline.map(p => (
                <div key={p.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                  <div className="aspect-square bg-gray-50 overflow-hidden relative">
                    {p.fotos?.[0]
                      ? <img src={p.fotos[0]} alt={p.nome} className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center text-4xl">👜</div>
                    }
                    {!p.visivel && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="text-white text-xs font-medium">Oculto</span>
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="font-medium text-gray-800 text-sm truncate">{p.nome}</p>
                    <p className="text-gold-600 font-bold text-sm mt-1">{fmt(p.preco)}</p>
                    <p className="text-xs text-gray-400 mt-0.5">Estoque: {p.estoque} un</p>
                    <div className="flex gap-2 mt-3">
                      <button onClick={() => abrirModalEditar(p)}
                        className="flex-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 py-1.5 rounded-lg flex items-center justify-center gap-1">
                        <Edit className="w-3 h-3" /> Editar
                      </button>
                      <button onClick={() => excluirProdutoOnline(p.id)}
                        className="w-8 h-8 bg-red-50 hover:bg-red-100 text-red-500 rounded-lg flex items-center justify-center">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {produtosOnline.length === 0 && (
                <div className="col-span-4 text-center py-16 text-gray-400">
                  <Package className="w-12 h-12 mx-auto mb-3 text-gray-200" />
                  <p>Nenhum produto online cadastrado ainda</p>
                  <button onClick={abrirModalNovo} className="btn-gold mt-4 text-sm">
                    Cadastrar primeiro produto
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ---- CONFIGURAÇÕES ---- */}
        {aba === 'config' && (
          <div className="bg-white rounded-2xl shadow-sm p-6 max-w-2xl space-y-4">
            <h3 className="font-semibold text-gray-800 mb-1">Contato e Redes Sociais</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="text-xs font-medium text-gray-500 mb-1 block">WhatsApp (com DDD e país)</label>
                <input value={config.whatsapp || ''} onChange={e => setConfig({ ...config, whatsapp: e.target.value })}
                  placeholder="5511900000000" className="input-luxo" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Instagram</label>
                <input value={config.instagram || ''} onChange={e => setConfig({ ...config, instagram: e.target.value })}
                  placeholder="https://instagram.com/usuario" className="input-luxo" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Facebook</label>
                <input value={config.facebook || ''} onChange={e => setConfig({ ...config, facebook: e.target.value })}
                  placeholder="https://facebook.com/pagina" className="input-luxo" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">TikTok</label>
                <input value={config.tiktok || ''} onChange={e => setConfig({ ...config, tiktok: e.target.value })}
                  placeholder="https://tiktok.com/@usuario" className="input-luxo" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">E-mail de Contato</label>
                <input type="email" value={config.email_contato || ''} onChange={e => setConfig({ ...config, email_contato: e.target.value })}
                  placeholder="contato@brechodeluxo.com.br" className="input-luxo" />
              </div>
            </div>

            <div className="border-t border-gray-100 pt-4">
              <h3 className="font-semibold text-gray-800 mb-3">Frete</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">Frete grátis acima de (R$)</label>
                  <input type="number" value={config.frete_gratis_acima || ''} onChange={e => setConfig({ ...config, frete_gratis_acima: Number(e.target.value) })}
                    placeholder="299" className="input-luxo" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">CEP de Origem</label>
                  <input value={config.cep_origem || ''} onChange={e => setConfig({ ...config, cep_origem: e.target.value })}
                    placeholder="13201-032" className="input-luxo" />
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-medium text-gray-500 mb-1 block">Token Melhor Envio</label>
                  <input type="password" value={config.melhor_envio_token || ''} onChange={e => setConfig({ ...config, melhor_envio_token: e.target.value })}
                    placeholder="Cole o token aqui após criar conta no Melhor Envio" className="input-luxo" />
                  <p className="text-xs text-gray-400 mt-1">Obtenha em: melhorenvio.com.br → Painel → Tokens</p>
                </div>
              </div>
            </div>

            <button onClick={salvarConfig} disabled={salvandoConfig} className="btn-gold disabled:opacity-50">
              {salvandoConfig ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {salvandoConfig ? 'Salvando...' : 'Salvar Configurações'}
            </button>
          </div>
        )}
      </div>

      {/* MODAL PUBLICAR PRODUTO DO ESTOQUE */}
      {modalPublicar && produtoPublicar && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-serif text-xl font-bold text-luxo-900">🚀 Publicar na Loja Virtual</h2>
                <button onClick={() => setModalPublicar(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 mb-4">
                <p className="font-medium text-gray-800 text-sm">{produtoPublicar.nome}</p>
                <p className="text-gold-600 text-sm font-bold">{fmt(produtoPublicar.preco_venda)}</p>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">Descrição para o site (até 8 linhas)</label>
                  <textarea rows={4} value={formPublicar.descricao_loja}
                    onChange={e => setFormPublicar({ ...formPublicar, descricao_loja: e.target.value })}
                    className="input-luxo resize-none" placeholder="Descreva o produto para os clientes online..." />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">Marca</label>
                    <input value={formPublicar.marca} onChange={e => setFormPublicar({ ...formPublicar, marca: e.target.value })}
                      className="input-luxo" placeholder="Ex: Louis Vuitton" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">Subcategoria</label>
                    <input value={formPublicar.subcategoria} onChange={e => setFormPublicar({ ...formPublicar, subcategoria: e.target.value })}
                      className="input-luxo" placeholder="Ex: Vestidos" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">Peso (kg)</label>
                    <input type="number" step="0.1" value={formPublicar.peso}
                      onChange={e => setFormPublicar({ ...formPublicar, peso: Number(e.target.value) })}
                      className="input-luxo" />
                  </div>
                  <div className="flex items-center gap-2 mt-5">
                    <input type="checkbox" id="destaque-pub" checked={formPublicar.destaque}
                      onChange={e => setFormPublicar({ ...formPublicar, destaque: e.target.checked })}
                      className="w-4 h-4 accent-gold-500" />
                    <label htmlFor="destaque-pub" className="text-sm text-gray-700">Produto em destaque</label>
                  </div>
                </div>

                {/* FOTOS */}
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-2 block">Fotos do produto</label>
                  <div className="flex gap-2 mb-2">
                    <input value={novaFotoPublicar} onChange={e => setNovaFotoPublicar(e.target.value)}
                      className="input-luxo flex-1" placeholder="URL da foto" />
                    <button onClick={adicionarFotoPublicar} className="btn-ghost px-3 py-2 text-sm border border-gray-200 rounded-xl">
                      + Add
                    </button>
                  </div>
                  {formPublicar.fotos_loja.length > 0 && (
                    <div className="flex gap-2 flex-wrap mt-2">
                      {formPublicar.fotos_loja.map((f, i) => (
                        <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden border border-gray-200">
                          <img src={f} alt="" className="w-full h-full object-cover" />
                          <button onClick={() => setFormPublicar(prev => ({
                            ...prev, fotos_loja: prev.fotos_loja.filter((_, idx) => idx !== i)
                          }))} className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white flex items-center justify-center rounded-bl text-xs">
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setModalPublicar(false)} className="flex-1 btn-outline justify-center">Cancelar</button>
                <button onClick={salvarPublicar} disabled={salvandoPublicar} className="flex-1 btn-gold justify-center disabled:opacity-50">
                  {salvandoPublicar ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {salvandoPublicar ? 'Publicando...' : '🚀 Publicar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PRODUTO ONLINE */}
      {modalOnline && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-serif text-xl font-bold text-luxo-900">
                  {editandoOnline ? '✏️ Editar Produto' : '+ Novo Produto Online'}
                </h2>
                <button onClick={() => setModalOnline(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className="text-xs font-medium text-gray-500 mb-1 block">Nome do produto *</label>
                    <input value={formOnline.nome || ''} onChange={e => setFormOnline({ ...formOnline, nome: e.target.value })}
                      className="input-luxo" placeholder="Nome do produto" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">Preço *</label>
                    <input type="number" step="0.01" value={formOnline.preco || ''}
                      onChange={e => setFormOnline({ ...formOnline, preco: Number(e.target.value) })}
                      className="input-luxo" placeholder="0.00" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">Preço promocional</label>
                    <input type="number" step="0.01" value={formOnline.preco_promocional || ''}
                      onChange={e => setFormOnline({ ...formOnline, preco_promocional: Number(e.target.value) })}
                      className="input-luxo" placeholder="0.00" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">Quantidade em estoque</label>
                    <input type="number" value={formOnline.estoque || 0}
                      onChange={e => setFormOnline({ ...formOnline, estoque: Number(e.target.value) })}
                      className="input-luxo" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">Marca</label>
                    <input value={formOnline.marca || ''} onChange={e => setFormOnline({ ...formOnline, marca: e.target.value })}
                      className="input-luxo" placeholder="Ex: Louis Vuitton" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">Categoria</label>
                    <select value={formOnline.categoria || ''} onChange={e => setFormOnline({ ...formOnline, categoria: e.target.value })}
                      className="input-luxo">
                      <option value="">Selecione...</option>
                      {CATEGORIAS_OPTS.map(c => <option key={c} value={c.toLowerCase()}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">Subcategoria</label>
                    <input value={formOnline.subcategoria || ''} onChange={e => setFormOnline({ ...formOnline, subcategoria: e.target.value })}
                      className="input-luxo" placeholder="Ex: Vestidos" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">Peso (kg)</label>
                    <input type="number" step="0.1" value={formOnline.peso || 0.3}
                      onChange={e => setFormOnline({ ...formOnline, peso: Number(e.target.value) })}
                      className="input-luxo" />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">Descrição (até 8 linhas)</label>
                  <textarea rows={4} value={formOnline.descricao || ''}
                    onChange={e => setFormOnline({ ...formOnline, descricao: e.target.value })}
                    className="input-luxo resize-none" placeholder="Descreva o produto..." />
                </div>

                {/* TAMANHOS */}
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-2 block">Tamanhos disponíveis</label>
                  <div className="flex gap-2 mb-2">
                    <input value={novoTamanho} onChange={e => setNovoTamanho(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); if (novoTamanho) { setFormOnline(prev => ({ ...prev, tamanhos: [...(prev.tamanhos || []), novoTamanho] })); setNovoTamanho('') } }}}
                      className="input-luxo flex-1" placeholder="Ex: P, M, G ou 38, 40..." />
                    <button onClick={() => { if (novoTamanho) { setFormOnline(prev => ({ ...prev, tamanhos: [...(prev.tamanhos || []), novoTamanho] })); setNovoTamanho('') }}}
                      className="px-3 py-2 bg-gray-100 rounded-xl text-sm hover:bg-gray-200">+ Add</button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(formOnline.tamanhos || []).map((t, i) => (
                      <span key={i} className="bg-luxo-50 text-luxo-700 text-xs px-3 py-1 rounded-full flex items-center gap-1">
                        {t} <button onClick={() => setFormOnline(prev => ({ ...prev, tamanhos: (prev.tamanhos || []).filter((_, idx) => idx !== i) }))} className="hover:text-red-500">×</button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* CORES */}
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-2 block">Cores disponíveis</label>
                  <div className="flex gap-2 mb-2">
                    <input value={novaCor} onChange={e => setNovaCor(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); if (novaCor) { setFormOnline(prev => ({ ...prev, cores: [...(prev.cores || []), novaCor] })); setNovaCor('') } }}}
                      className="input-luxo flex-1" placeholder="Ex: Preto, Bege, Vermelho..." />
                    <button onClick={() => { if (novaCor) { setFormOnline(prev => ({ ...prev, cores: [...(prev.cores || []), novaCor] })); setNovaCor('') }}}
                      className="px-3 py-2 bg-gray-100 rounded-xl text-sm hover:bg-gray-200">+ Add</button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(formOnline.cores || []).map((c, i) => (
                      <span key={i} className="bg-gold-50 text-gold-700 text-xs px-3 py-1 rounded-full flex items-center gap-1">
                        {c} <button onClick={() => setFormOnline(prev => ({ ...prev, cores: (prev.cores || []).filter((_, idx) => idx !== i) }))} className="hover:text-red-500">×</button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* FOTOS */}
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-2 block">Fotos do produto (até 8)</label>
                  <div className="flex gap-2 mb-2">
                    <input value={novaFoto} onChange={e => setNovaFoto(e.target.value)}
                      className="input-luxo flex-1" placeholder="URL da foto" />
                    <button onClick={adicionarFotoURL} className="px-3 py-2 bg-gray-100 rounded-xl text-sm hover:bg-gray-200">+ URL</button>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <input ref={fileRef} type="file" accept="image/*" className="hidden"
                      onChange={e => { if (e.target.files?.[0]) uploadFoto(e.target.files[0]) }} />
                    <button onClick={() => fileRef.current?.click()} disabled={uploadingFoto}
                      className="flex items-center gap-2 px-4 py-2 border border-dashed border-gray-300 rounded-xl text-sm text-gray-500 hover:border-gold-400 hover:text-gold-600 transition-colors disabled:opacity-50">
                      {uploadingFoto ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                      {uploadingFoto ? 'Enviando...' : 'Upload de arquivo'}
                    </button>
                    <span className="text-xs text-gray-400">ou cole a URL acima</span>
                  </div>
                  {(formOnline.fotos || []).length > 0 && (
                    <div className="grid grid-cols-4 gap-2 mt-2">
                      {(formOnline.fotos || []).map((f, i) => (
                        <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-gray-200">
                          <img src={f} alt="" className="w-full h-full object-cover" />
                          <button onClick={() => removerFoto(i)}
                            className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600">
                            ×
                          </button>
                          {i === 0 && <span className="absolute bottom-1 left-1 bg-gold-500 text-white text-[10px] px-1 rounded">Principal</span>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* VISIVEL E DESTAQUE */}
                <div className="flex gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={formOnline.visivel !== false}
                      onChange={e => setFormOnline({ ...formOnline, visivel: e.target.checked })}
                      className="w-4 h-4 accent-gold-500" />
                    <span className="text-sm text-gray-700">Visível na loja</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={formOnline.destaque || false}
                      onChange={e => setFormOnline({ ...formOnline, destaque: e.target.checked })}
                      className="w-4 h-4 accent-gold-500" />
                    <span className="text-sm text-gray-700">Produto em destaque</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button onClick={() => setModalOnline(false)} className="flex-1 btn-outline justify-center">Cancelar</button>
                <button onClick={salvarProdutoOnline} className="flex-1 btn-gold justify-center">
                  <Save className="w-4 h-4" />
                  {editandoOnline ? 'Salvar Alterações' : 'Criar Produto'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
