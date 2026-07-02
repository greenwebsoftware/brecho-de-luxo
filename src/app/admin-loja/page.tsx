'use client'
import { useState, useEffect, useRef } from 'react'
import {
  Eye, EyeOff, Star, StarOff, Package, ShoppingBag, TrendingUp,
  Clock, Lock, LogOut, Save, Loader2, Plus, Trash2, Upload, X,
  Edit, FileText, MessageSquare, CheckCircle, XCircle, AlertTriangle,
  Video, Image as ImageIcon, Tag, Globe, EyeOff as Hide, Share2
} from 'lucide-react'
import toast from 'react-hot-toast'
import GeradorConteudo from '../../components/GeradorConteudo'
import { CATEGORIAS } from '../../lib/menuConfig'

// ---- TIPOS ----
interface Produto { id: string; nome: string; preco_venda: number; estoque_atual: number; visivel_site: boolean; destaque: boolean; imagem_url?: string; imagens_site?: string[]; publicado_loja?: boolean }
interface ProdutoOnline { id: string; nome: string; preco: number; preco_promocional?: number; estoque: number; categoria?: string; subcategoria?: string; genero?: string; marca?: string; tamanhos: string[]; cores: string[]; fotos: string[]; peso: number; visivel: boolean; destaque: boolean; descricao?: string }
interface Pedido { id: string; numero: number; cliente_nome: string; total: number; status: string; criado_em: string; integrado_modasystem: boolean }
interface SiteConfig { whatsapp?: string; instagram?: string; facebook?: string; tiktok?: string; email_contato?: string; frete_gratis_acima?: number; frete_fixo?: number; cep_origem?: string; melhor_envio_token?: string }
interface BlogPost { id: string; titulo: string; slug: string; resumo?: string; conteudo: string; imagem_capa?: string; video_url?: string; tags: string[]; publicado: boolean; destaque: boolean; visualizacoes: number; curtidas: number; criado_em: string }
interface CategoriaLoja { id: string; label: string; slug: string; tipo: string; pai_slug?: string; ordem: number; ativo: boolean }

interface Comentario { id: string; conteudo: string; status: string; motivo_rejeicao?: string; criado_em: string; nome_visitante?: string; blog_posts?: { titulo: string }; clientes_site?: { nome: string } }

const CATEGORIAS_OPTS = ['Roupas', 'Bolsas', 'Calçados', 'Acessórios']
const STATUS_CORES: Record<string, string> = {
  aguardando_pagamento: 'bg-amber-100 text-amber-700',
  pagamento_aprovado: 'bg-blue-100 text-blue-700',
  em_separacao: 'bg-purple-100 text-purple-700',
  enviado: 'bg-indigo-100 text-indigo-700',
  entregue: 'bg-green-100 text-green-700',
  cancelado: 'bg-red-100 text-red-700',
}

function extrairVideoEmbed(url: string): string | null {
  if (!url) return null
  // YouTube
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/)
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`
  // Vimeo
  const vm = url.match(/vimeo\.com\/(\d+)/)
  if (vm) return `https://player.vimeo.com/video/${vm[1]}`
  return url
}

export default function AdminLojaPage() {
  const [autenticado, setAutenticado] = useState<boolean | null>(null)
  const [senha, setSenha] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)
  const [loginErro, setLoginErro] = useState('')
  const [aba, setAba] = useState<'pedidos' | 'produtos' | 'online' | 'blog' | 'moderacao' | 'categorias' | 'relatorios' | 'config'>('pedidos')
  const [loading, setLoading] = useState(true)

  // Dados
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [produtosOnline, setProdutosOnline] = useState<ProdutoOnline[]>([])
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([])
  const [comentarios, setComentarios] = useState<Comentario[]>([])
  const [statusComentario, setStatusComentario] = useState('pendente')
  const [categoriasLoja, setCategoriasLoja] = useState<CategoriaLoja[]>([])
  const [formCat, setFormCat] = useState({ label: '', slug: '', tipo: 'item', pai_slug: '' })
  const [salvandoCat, setSalvandoCat] = useState(false)
  const [editandoCat, setEditandoCat] = useState<{id: string; label: string; slug: string} | null>(null)
  const [salvandoRenomear, setSalvandoRenomear] = useState(false)
  const [dadosRelatorio, setDadosRelatorio] = useState<any>(null)
  const [periodoRelatorio, setPeriodoRelatorio] = useState('30')
  const [loadingRelatorio, setLoadingRelatorio] = useState(false)
  const [config, setConfig] = useState<SiteConfig>({})
  const [salvandoConfig, setSalvandoConfig] = useState(false)

  // Modal produto online
  const [modalOnline, setModalOnline] = useState(false)
  const [editandoOnline, setEditandoOnline] = useState<ProdutoOnline | null>(null)
  const [formOnline, setFormOnline] = useState<Partial<ProdutoOnline>>({ fotos: [], tamanhos: [], cores: [], visivel: true, destaque: false, peso: 0.3 })
  const [novaFoto, setNovaFoto] = useState('')
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  const [catSelecionada, setCatSelecionada] = useState('')
  const [novoTamanho, setNovoTamanho] = useState('')
  const [novaCor, setNovaCor] = useState('')
  const [uploadingFoto, setUploadingFoto] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  // Modal publicar produto estoque
  const [modalPublicar, setModalPublicar] = useState(false)
  const [produtoPublicar, setProdutoPublicar] = useState<Produto | null>(null)
  const [formPublicar, setFormPublicar] = useState({ descricao_loja: '', marca: '', subcategoria: '', fotos_loja: [] as string[], peso: 0.3, destaque: false, altura_cm: 5, largura_cm: 20, comprimento_cm: 30 })
  const [novaFotoPublicar, setNovaFotoPublicar] = useState('')
  const [salvandoPublicar, setSalvandoPublicar] = useState(false)

  // Modal blog post
  const [modalBlog, setModalBlog] = useState(false)
  const [editandoBlog, setEditandoBlog] = useState<BlogPost | null>(null)
  const [formBlog, setFormBlog] = useState({ titulo: '', resumo: '', conteudo: '', imagem_capa: '', video_url: '', tags: [] as string[], publicado: false, destaque: false })
  const [novaTag, setNovaTag] = useState('')
  const [salvandoBlog, setSalvandoBlog] = useState(false)
  const [uploadingBlogImg, setUploadingBlogImg] = useState(false)
  const blogImgRef = useRef<HTMLInputElement>(null)
  const [geradorProduto, setGeradorProduto] = useState<Produto | ProdutoOnline | null>(null)
  const [geradorPost, setGeradorPost] = useState<BlogPost | null>(null)

  useEffect(() => { verificarLogin() }, [])
  useEffect(() => { if (autenticado && aba === 'moderacao') carregarComentarios() }, [aba, statusComentario])

  const verificarLogin = async () => {
    const res = await fetch('/api/admin/produtos')
    if (res.status === 401) setAutenticado(false)
    else { setAutenticado(true); carregarDados() }
  }

  const fazerLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginLoading(true); setLoginErro('')
    const res = await fetch('/api/admin/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ senha }) })
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
    const [pRes, pedRes, poRes, blogRes, confRes, catRes] = await Promise.all([
      fetch('/api/admin/produtos'), fetch('/api/admin/pedidos'),
      fetch('/api/admin/produtos-online'), fetch('/api/admin/blog'),
      fetch('/api/admin/config'), fetch('/api/categorias-loja'),
    ])
    const [pData, pedData, poData, blogData, confData, catData] = await Promise.all([
      pRes.json(), pedRes.json(), poRes.json(), blogRes.json(), confRes.json(), catRes.json()
    ])
    setProdutos(pData.data || [])
    setPedidos(pedData.data || [])
    setProdutosOnline(poData.data || [])
    setBlogPosts(blogData.data || [])
    setConfig(confData.data || {})
    setCategoriasLoja(catData.data || [])
    setLoading(false)
  }

  const carregarComentarios = async () => {
    const res = await fetch(`/api/admin/blog/comentarios?status=${statusComentario}`)
    const data = await res.json()
    setComentarios(data.data || [])
  }

  const fmt = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
  const fmtData = (d: string) => new Date(d).toLocaleDateString('pt-BR')

  // ---- PRODUTOS ----
  const toggleVisivel = async (id: string, atual: boolean) => {
    await fetch(`/api/admin/produtos/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ visivel_site: !atual }) })
    setProdutos(prev => prev.map(p => p.id === id ? { ...p, visivel_site: !atual } : p))
    toast.success(!atual ? 'Visível no site' : 'Ocultado')
  }

  const toggleDestaque = async (id: string, atual: boolean) => {
    await fetch(`/api/admin/produtos/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ destaque: !atual }) })
    setProdutos(prev => prev.map(p => p.id === id ? { ...p, destaque: !atual } : p))
    toast.success(!atual ? 'Em destaque!' : 'Destaque removido')
  }

  // ---- PUBLICAR PRODUTO ----
  const abrirModalPublicar = (p: Produto) => { setProdutoPublicar(p); setFormPublicar({ descricao_loja: '', marca: '', subcategoria: '', fotos_loja: [], peso: 0.3, destaque: false, altura_cm: 5, largura_cm: 20, comprimento_cm: 30 }); setModalPublicar(true) }

  const salvarPublicar = async () => {
    if (!produtoPublicar) return
    setSalvandoPublicar(true)
    const res = await fetch(`/api/admin/produtos/${produtoPublicar.id}/publicar`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...formPublicar, visivel_site: true }) })
    if (res.ok) { toast.success('Produto publicado!'); setModalPublicar(false); carregarDados() }
    else toast.error('Erro ao publicar')
    setSalvandoPublicar(false)
  }

  // ---- PRODUTOS ONLINE ----
  const abrirModalNovo = () => { setEditandoOnline(null); setFormOnline({ fotos: [], tamanhos: [], cores: [], visivel: true, destaque: false, peso: 0.3 }); setCatSelecionada(''); setModalOnline(true) }
  const abrirModalEditar = (p: ProdutoOnline) => { setEditandoOnline(p); setFormOnline({ ...p }); setCatSelecionada(p.categoria || ''); setModalOnline(true) }

  const uploadFoto = async (file: File) => {
    setUploadingFoto(true)
    try {
      const fd = new FormData(); fd.append('file', file)
      const res = await fetch('/api/admin/upload-foto', { method: 'POST', body: fd })
      const data = await res.json()
      if (data.url) { setFormOnline(prev => ({ ...prev, fotos: [...(prev.fotos || []), data.url] })); toast.success('Foto enviada!') }
    } catch { toast.error('Erro ao enviar foto') }
    setUploadingFoto(false)
  }

  const salvarProdutoOnline = async () => {
    if (!formOnline.nome || !formOnline.preco) { toast.error('Nome e preço são obrigatórios'); return }
    const url = editandoOnline ? `/api/admin/produtos-online/${editandoOnline.id}` : '/api/admin/produtos-online'
    const res = await fetch(url, { method: editandoOnline ? 'PATCH' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formOnline) })
    if (res.ok) { toast.success(editandoOnline ? 'Atualizado!' : 'Criado!'); setModalOnline(false); carregarDados() }
    else toast.error('Erro ao salvar')
  }

  const excluirProdutoOnline = async (id: string) => {
    if (!confirm('Excluir este produto?')) return
    await fetch(`/api/admin/produtos-online/${id}`, { method: 'DELETE' })
    toast.success('Produto excluído'); carregarDados()
  }

  // ---- PEDIDOS ----
  const atualizarStatusPedido = async (id: string, status: string) => {
    await fetch(`/api/admin/pedidos/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) })
    setPedidos(prev => prev.map(p => p.id === id ? { ...p, status } : p))
    toast.success('Status atualizado!')
  }

  // ---- BLOG ----
  const abrirNovoBlog = () => {
    setEditandoBlog(null)
    setFormBlog({ titulo: '', resumo: '', conteudo: '', imagem_capa: '', video_url: '', tags: [], publicado: false, destaque: false })
    setModalBlog(true)
  }

  const abrirEditarBlog = (p: BlogPost) => {
    setEditandoBlog(p)
    setFormBlog({ titulo: p.titulo, resumo: p.resumo || '', conteudo: p.conteudo, imagem_capa: p.imagem_capa || '', video_url: p.video_url || '', tags: p.tags || [], publicado: p.publicado, destaque: p.destaque })
    setModalBlog(true)
  }

  const comprimirImagem = (file: File, maxWidth = 1200, qualidade = 0.8): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      const url = URL.createObjectURL(file)
      img.onload = () => {
        URL.revokeObjectURL(url)
        const canvas = document.createElement('canvas')
        let { width, height } = img
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width)
          width = maxWidth
        }
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        if (!ctx) { reject(new Error('Canvas nao suportado')); return }
        ctx.drawImage(img, 0, 0, width, height)
        canvas.toBlob(blob => {
          if (blob) resolve(blob)
          else reject(new Error('Erro ao comprimir'))
        }, 'image/jpeg', qualidade)
      }
      img.onerror = reject
      img.src = url
    })
  }

  const reordenarFotos = (fromIdx: number, toIdx: number) => {
    const fotos = [...(formOnline.fotos || [])]
    const [moved] = fotos.splice(fromIdx, 1)
    fotos.splice(toIdx, 0, moved)
    setFormOnline(prev => ({ ...prev, fotos }))
  }

  const uploadBlogImg = async (file: File) => {
    setUploadingBlogImg(true)
    try {
      toast.loading('Comprimindo imagem...')
      const blob = await comprimirImagem(file, 1200, 0.8)
      const tamanhoMB = (blob.size / 1024 / 1024).toFixed(1)
      toast.dismiss()
      toast.loading(`Enviando (${tamanhoMB}MB)...`)

      const fd = new FormData()
      fd.append('file', blob, 'imagem.jpg')
      const res = await fetch('/api/admin/upload-blog', { method: 'POST', body: fd })
      const data = await res.json()
      toast.dismiss()

      if (data.url) {
        setFormBlog(prev => ({ ...prev, imagem_capa: data.url }))
        toast.success('Imagem enviada!')
      } else {
        toast.error(data.error || 'Erro ao enviar imagem')
      }
    } catch (err: any) {
      toast.dismiss()
      toast.error('Erro ao comprimir ou enviar imagem')
    }
    setUploadingBlogImg(false)
  }

  const salvarBlog = async () => {
    if (!formBlog.titulo || !formBlog.conteudo) { toast.error('Título e conteúdo são obrigatórios'); return }
    setSalvandoBlog(true)
    const url = editandoBlog ? `/api/admin/blog/${editandoBlog.id}` : '/api/admin/blog'
    const res = await fetch(url, { method: editandoBlog ? 'PATCH' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formBlog) })
    if (res.ok) { toast.success(editandoBlog ? 'Post atualizado!' : 'Post criado!'); setModalBlog(false); carregarDados() }
    else toast.error('Erro ao salvar post')
    setSalvandoBlog(false)
  }

  const excluirBlog = async (id: string) => {
    if (!confirm('Excluir este post? Esta ação não pode ser desfeita.')) return
    await fetch(`/api/admin/blog/${id}`, { method: 'DELETE' })
    toast.success('Post excluído'); carregarDados()
  }

  const togglePublicadoBlog = async (id: string, atual: boolean) => {
    await fetch(`/api/admin/blog/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ publicado: !atual }) })
    setBlogPosts(prev => prev.map(p => p.id === id ? { ...p, publicado: !atual } : p))
    toast.success(!atual ? 'Post publicado!' : 'Post despublicado')
  }

  // ---- MODERAÇÃO ----
  const moderarComentario = async (id: string, status: string, motivo?: string) => {
    await fetch('/api/admin/blog/comentarios', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status, motivo_rejeicao: motivo }) })
    setComentarios(prev => prev.filter(c => c.id !== id))
    toast.success(status === 'aprovado' ? 'Comentário aprovado!' : 'Comentário rejeitado')
  }

  const excluirComentario = async (id: string) => {
    if (!confirm('Excluir este comentário?')) return
    await fetch('/api/admin/blog/comentarios', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    setComentarios(prev => prev.filter(c => c.id !== id))
    toast.success('Comentário excluído')
  }

  const carregarRelatorio = async (periodo: string) => {
    setLoadingRelatorio(true)
    const res = await fetch('/api/admin/relatorios?periodo=' + periodo)
    const data = await res.json()
    setDadosRelatorio(data)
    setLoadingRelatorio(false)
  }

  const salvarCategoria = async () => {
    if (!formCat.label || !formCat.slug || !formCat.tipo) {
      toast.error('Label, slug e tipo são obrigatórios')
      return
    }
    setSalvandoCat(true)
    const res = await fetch('/api/categorias-loja', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formCat)
    })
    if (res.ok) {
      toast.success('Categoria adicionada!')
      setFormCat({ label: '', slug: '', tipo: 'item', pai_slug: '' })
      carregarDados()
    } else {
      const err = await res.json()
      toast.error(err.error || 'Erro ao salvar')
    }
    setSalvandoCat(false)
  }

  const renomearCategoria = async () => {
    if (!editandoCat) return
    setSalvandoRenomear(true)
    const res = await fetch('/api/categorias-loja', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: editandoCat.id, label: editandoCat.label, slug: editandoCat.slug })
    })
    if (res.ok) {
      toast.success('Categoria renomeada!')
      setEditandoCat(null)
      carregarDados()
    } else {
      const err = await res.json()
      toast.error(err.error || 'Erro ao renomear')
    }
    setSalvandoRenomear(false)
  }

  const excluirCategoria = async (id: string) => {
    if (!confirm('Remover esta categoria?')) return
    await fetch('/api/categorias-loja', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    })
    toast.success('Categoria removida!')
    carregarDados()
  }

  const salvarConfig = async () => {
    setSalvandoConfig(true)
    const res = await fetch('/api/admin/config', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(config) })
    if (res.ok) toast.success('Configurações salvas!')
    else toast.error('Erro ao salvar')
    setSalvandoConfig(false)
  }

  const metricas = {
    totalPedidos: pedidos.length,
    pedidosPendentes: pedidos.filter(p => p.status === 'aguardando_pagamento').length,
    totalVendido: pedidos.filter(p => p.status !== 'cancelado').reduce((s, p) => s + p.total, 0),
    produtosVisiveis: produtosOnline.filter(p => p.visivel).length,
  }

  // ---- TELAS DE AUTH ----
  if (autenticado === null) return <div className="min-h-screen bg-luxo-900 flex items-center justify-center"><Loader2 className="w-8 h-8 text-gold-400 animate-spin" /></div>

  if (!autenticado) return (
    <div className="min-h-screen bg-gradient-to-br from-luxo-900 to-luxo-800 flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-sm">
        <div className="w-14 h-14 rounded-full bg-gold-100 flex items-center justify-center mx-auto mb-4"><Lock className="w-7 h-7 text-gold-600" /></div>
        <h1 className="font-serif text-2xl font-bold text-luxo-900 text-center mb-1">Área Restrita</h1>
        <p className="text-gray-400 text-sm text-center mb-6">Painel administrativo da loja</p>
        <form onSubmit={fazerLogin} className="space-y-4">
          <input type="password" value={senha} onChange={e => setSenha(e.target.value)} placeholder="Senha de acesso" autoFocus className="input-luxo text-center" />
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
            <p className="text-gold-300 text-sm mt-1">Gerencie produtos, pedidos, blog e configurações</p>
          </div>
          <button onClick={sair} className="flex items-center gap-2 text-gold-300 hover:text-white text-sm"><LogOut className="w-4 h-4" /> Sair</button>
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
                <div className="w-9 h-9 rounded-full bg-gray-50 flex items-center justify-center"><Icon className={`w-5 h-5 ${color}`} /></div>
                <span className="text-xs text-gray-500">{label}</span>
              </div>
              <div className={`text-2xl font-bold ${color}`}>{value}</div>
            </div>
          ))}
        </div>

        {/* ABAS */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6 flex-wrap">
          {[
            { key: 'pedidos', label: 'Pedidos' },
            { key: 'produtos', label: 'Estoque → Site' },
            { key: 'online', label: 'Produtos Online' },
            { key: 'blog', label: '✍️ Blog' },
            { key: 'moderacao', label: '🛡️ Moderação' },
            { key: 'relatorios', label: 'Relatorios' },
            { key: 'categorias', label: 'Categorias' },
            { key: 'config', label: 'Configurações' },
          ].map(a => (
            <button key={a.key} onClick={() => setAba(a.key as typeof aba)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${aba === a.key ? 'bg-white shadow-sm text-luxo-900' : 'text-gray-500 hover:text-gray-700'}`}>
              {a.label}
            </button>
          ))}
        </div>

        {/* ---- PEDIDOS ---- */}
        {aba === 'pedidos' && (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-gray-100">
                <th className="text-left px-4 py-3 text-xs text-gray-500">Pedido</th>
                <th className="text-left px-4 py-3 text-xs text-gray-500">Cliente</th>
                <th className="text-left px-4 py-3 text-xs text-gray-500">Total</th>
                <th className="text-left px-4 py-3 text-xs text-gray-500">Data</th>
                <th className="text-left px-4 py-3 text-xs text-gray-500">ModaSystem</th>
                <th className="text-left px-4 py-3 text-xs text-gray-500">Status</th>
              </tr></thead>
              <tbody>
                {pedidos.length === 0 ? <tr><td colSpan={6} className="text-center py-12 text-gray-400">Nenhum pedido ainda</td></tr>
                : pedidos.map(p => (
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
                        className={`text-xs px-2 py-1 rounded-full border-0 outline-none cursor-pointer ${STATUS_CORES[p.status] || 'bg-gray-100'}`}>
                        {Object.keys(STATUS_CORES).map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
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
            <div className="p-4 border-b border-gray-100"><p className="text-sm text-gray-500">Clique em <strong>"Publicar"</strong> para adicionar fotos e descrição e tornar o produto visível na loja.</p></div>
            <table className="w-full text-sm">
              <thead><tr className="border-b border-gray-100">
                <th className="text-left px-4 py-3 text-xs text-gray-500">Produto</th>
                <th className="text-left px-4 py-3 text-xs text-gray-500">Preço</th>
                <th className="text-left px-4 py-3 text-xs text-gray-500">Estoque</th>
                <th className="text-center px-4 py-3 text-xs text-gray-500">Visível</th>
                <th className="text-center px-4 py-3 text-xs text-gray-500">Destaque</th>
                <th className="text-center px-4 py-3 text-xs text-gray-500">Ações</th>
              </tr></thead>
              <tbody>
                {loading ? <tr><td colSpan={6} className="text-center py-12 text-gray-400">Carregando...</td></tr>
                : produtos.map(p => {
                  const imgs = p.imagens_site as string[] | null
                  const img = imgs?.[0] || p.imagem_url
                  return (
                    <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                            {img ? <img src={img} alt={p.nome} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-lg">👜</div>}
                          </div>
                          <div>
                            <span className="font-medium text-gray-800 truncate max-w-48 block">{p.nome}</span>
                            {p.publicado_loja && <span className="text-xs text-green-600">✓ Publicado</span>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-semibold text-gold-600">{fmt(p.preco_venda)}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-1 rounded-full ${p.estoque_atual > 5 ? 'bg-green-100 text-green-700' : p.estoque_atual > 0 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>{p.estoque_atual} un</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button onClick={() => toggleVisivel(p.id, p.visivel_site)} className={`w-9 h-9 rounded-full flex items-center justify-center mx-auto ${p.visivel_site ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                          {p.visivel_site ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button onClick={() => toggleDestaque(p.id, p.destaque)} className={`w-9 h-9 rounded-full flex items-center justify-center mx-auto ${p.destaque ? 'bg-gold-100 text-gold-600' : 'bg-gray-100 text-gray-400'}`}>
                          {p.destaque ? <Star className="w-4 h-4" /> : <StarOff className="w-4 h-4" />}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button onClick={() => abrirModalPublicar(p)} className="bg-luxo-700 hover:bg-luxo-800 text-white text-xs px-3 py-1.5 rounded-lg">
                          {p.publicado_loja ? '✏️ Editar' : '🚀 Publicar'}
                        </button>
                        <button onClick={() => setGeradorProduto(p)}
                          className="mt-1 text-xs bg-purple-50 hover:bg-purple-100 text-purple-700 px-3 py-1.5 rounded-lg w-full">
                          📱 Gerar Post
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
              <p className="text-sm text-gray-500">Produtos exclusivos da loja virtual</p>
              <button onClick={abrirModalNovo} className="btn-gold"><Plus className="w-4 h-4" /> Novo Produto</button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {produtosOnline.map(p => (
                <div key={p.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                  <div className="aspect-square bg-gray-50 overflow-hidden relative">
                    {p.fotos?.[0] ? <img src={p.fotos[0]} alt={p.nome} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-4xl">👜</div>}
                    {!p.visivel && <div className="absolute inset-0 bg-black/50 flex items-center justify-center"><span className="text-white text-xs">Oculto</span></div>}
                  </div>
                  <div className="p-3">
                    <p className="font-medium text-gray-800 text-sm truncate">{p.nome}</p>
                    <p className="text-gold-600 font-bold text-sm mt-1">{fmt(p.preco)}</p>
                    <p className="text-xs text-gray-400 mt-0.5">Estoque: {p.estoque} un</p>
                    <div className="flex gap-2 mt-3">
                      <button onClick={() => abrirModalEditar(p)} className="flex-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 py-1.5 rounded-lg flex items-center justify-center gap-1"><Edit className="w-3 h-3" /> Editar</button>
                      <button onClick={() => excluirProdutoOnline(p.id)} className="w-8 h-8 bg-red-50 hover:bg-red-100 text-red-500 rounded-lg flex items-center justify-center"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                </div>
              ))}
              {produtosOnline.length === 0 && (
                <div className="col-span-4 text-center py-16 text-gray-400">
                  <Package className="w-12 h-12 mx-auto mb-3 text-gray-200" />
                  <p>Nenhum produto online cadastrado</p>
                  <button onClick={abrirModalNovo} className="btn-gold mt-4 text-sm">Cadastrar primeiro produto</button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ---- BLOG ---- */}
        {aba === 'blog' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="font-semibold text-gray-800">Gerenciar Posts</h2>
                <p className="text-sm text-gray-500">{blogPosts.length} posts • {blogPosts.filter(p => p.publicado).length} publicados</p>
              </div>
              <button onClick={abrirNovoBlog} className="btn-gold"><Plus className="w-4 h-4" /> Novo Post</button>
            </div>
            <div className="space-y-3">
              {blogPosts.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl">
                  <FileText className="w-12 h-12 mx-auto mb-3 text-gray-200" />
                  <p className="text-gray-400">Nenhum post criado ainda</p>
                  <button onClick={abrirNovoBlog} className="btn-gold mt-4 text-sm">Criar primeiro post</button>
                </div>
              ) : blogPosts.map(p => (
                <div key={p.id} className="bg-white rounded-2xl shadow-sm p-5 flex items-center gap-4">
                  {p.imagem_capa ? (
                    <img src={p.imagem_capa} alt={p.titulo} className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-gold-100 to-gold-200 flex items-center justify-center flex-shrink-0 text-2xl">✍️</div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-800 truncate">{p.titulo}</h3>
                      {p.video_url && <Video className="w-4 h-4 text-blue-500 flex-shrink-0" />}
                      {p.destaque && <Star className="w-4 h-4 text-gold-500 flex-shrink-0" />}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      <span>{fmtData(p.criado_em)}</span>
                      <span>👁 {p.visualizacoes}</span>
                      <span>❤️ {p.curtidas}</span>
                      {p.tags?.slice(0,2).map((t,i) => <span key={i} className="bg-gold-50 text-gold-600 px-2 py-0.5 rounded-full">{t}</span>)}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button onClick={() => togglePublicadoBlog(p.id, p.publicado)}
                      className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded-full font-medium ${p.publicado ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {p.publicado ? <><Globe className="w-3 h-3" /> Publicado</> : <><Hide className="w-3 h-3" /> Rascunho</>}
                    </button>
                    <button onClick={() => abrirEditarBlog(p)} className="w-8 h-8 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg flex items-center justify-center"><Edit className="w-4 h-4" /></button>
                    <button onClick={() => setGeradorPost(p)} className="w-8 h-8 bg-purple-50 hover:bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center" title="Gerar post redes sociais"><Share2 className="w-4 h-4" /></button>
                    <button onClick={() => excluirBlog(p.id)} className="w-8 h-8 bg-red-50 hover:bg-red-100 text-red-500 rounded-lg flex items-center justify-center"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ---- MODERAÇÃO ---- */}
        {aba === 'moderacao' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-semibold text-gray-800">Moderação de Comentários</h2>
              <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
                {['pendente', 'suspeito', 'aprovado', 'rejeitado'].map(s => (
                  <button key={s} onClick={() => { setStatusComentario(s); }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${statusComentario === s ? 'bg-white shadow text-luxo-900' : 'text-gray-500'}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
            {comentarios.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl">
                <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-200" />
                <p className="text-gray-400">Nenhum comentário com status "{statusComentario}"</p>
              </div>
            ) : (
              <div className="space-y-3">
                {comentarios.map(c => (
                  <div key={c.id} className={`bg-white rounded-2xl shadow-sm p-5 border-l-4 ${
                    c.status === 'suspeito' ? 'border-amber-400' : c.status === 'pendente' ? 'border-blue-400' : c.status === 'aprovado' ? 'border-green-400' : 'border-red-400'
                  }`}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-gray-800 text-sm">
                            {c.clientes_site?.nome || c.nome_visitante || 'Visitante'}
                          </span>
                          <span className="text-xs text-gray-400">{fmtData(c.criado_em)}</span>
                          {c.status === 'suspeito' && <span className="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full"><AlertTriangle className="w-3 h-3" /> Suspeito</span>}
                        </div>
                        {c.blog_posts?.titulo && (
                          <p className="text-xs text-gray-400 mb-2">Post: <span className="text-gold-600">{c.blog_posts.titulo}</span></p>
                        )}
                        <p className="text-sm text-gray-700 bg-gray-50 rounded-xl p-3">{c.conteudo}</p>
                        {c.motivo_rejeicao && (
                          <p className="text-xs text-red-500 mt-1">Motivo: {c.motivo_rejeicao}</p>
                        )}
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        {c.status !== 'aprovado' && (
                          <button onClick={() => moderarComentario(c.id, 'aprovado')}
                            className="flex items-center gap-1 text-xs bg-green-100 hover:bg-green-200 text-green-700 px-3 py-1.5 rounded-lg">
                            <CheckCircle className="w-3.5 h-3.5" /> Aprovar
                          </button>
                        )}
                        {c.status !== 'rejeitado' && (
                          <button onClick={() => moderarComentario(c.id, 'rejeitado', 'Conteúdo inadequado')}
                            className="flex items-center gap-1 text-xs bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1.5 rounded-lg">
                            <XCircle className="w-3.5 h-3.5" /> Rejeitar
                          </button>
                        )}
                        <button onClick={() => excluirComentario(c.id)}
                          className="w-8 h-8 bg-gray-100 hover:bg-gray-200 text-gray-500 rounded-lg flex items-center justify-center">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}



        {/* ---- RELATORIOS ---- */}
        {aba === 'relatorios' && (
          <div className="space-y-6">
            {/* Selector de periodo */}
            <div className="bg-white rounded-2xl shadow-sm p-5 flex items-center gap-4 flex-wrap">
              <span className="text-sm font-medium text-gray-700">Periodo:</span>
              {[
                { label: '7 dias', value: '7' },
                { label: '30 dias', value: '30' },
                { label: '3 meses', value: '90' },
                { label: '6 meses', value: '180' },
                { label: '1 ano', value: '365' },
              ].map(p => (
                <button key={p.value}
                  onClick={() => { setPeriodoRelatorio(p.value); carregarRelatorio(p.value) }}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${periodoRelatorio === p.value ? 'bg-luxo-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                  {p.label}
                </button>
              ))}
              {!dadosRelatorio && (
                <button onClick={() => carregarRelatorio(periodoRelatorio)} className="btn-gold ml-auto">
                  Carregar Relatorio
                </button>
              )}
              {loadingRelatorio && <Loader2 className="w-5 h-5 animate-spin text-gold-500 ml-auto" />}
            </div>

            {dadosRelatorio && !loadingRelatorio && (
              <>
                {/* Cards resumo */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: 'Total Vendido', value: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(dadosRelatorio.resumo.totalVendido), color: 'text-green-600', bg: 'bg-green-50' },
                    { label: 'Pedidos', value: dadosRelatorio.resumo.totalPedidos, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Ticket Medio', value: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(dadosRelatorio.resumo.ticketMedio), color: 'text-purple-600', bg: 'bg-purple-50' },
                    { label: 'Taxa Conversao', value: dadosRelatorio.resumo.taxaConversao + '%', color: 'text-amber-600', bg: 'bg-amber-50' },
                    { label: 'Visitas', value: dadosRelatorio.resumo.totalVisitas, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                    { label: 'Valor Estoque', value: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(dadosRelatorio.resumo.valorEstoque), color: 'text-rose-600', bg: 'bg-rose-50' },
                    { label: 'Itens em Estoque', value: dadosRelatorio.resumo.totalProdutosEstoque + ' un', color: 'text-teal-600', bg: 'bg-teal-50' },
                    { label: 'Produtos Online', value: dadosRelatorio.resumo.totalProdutosEstoque, color: 'text-gold-600', bg: 'bg-gold-50' },
                  ].map(card => (
                    <div key={card.label} className={`${card.bg} rounded-2xl p-5`}>
                      <p className="text-xs text-gray-500 mb-1">{card.label}</p>
                      <p className={`text-xl font-bold ${card.color}`}>{card.value}</p>
                    </div>
                  ))}
                </div>

                {/* Grafico de vendas por dia */}
                <div className="bg-white rounded-2xl shadow-sm p-5">
                  <h3 className="font-semibold text-gray-800 mb-4">Vendas por Dia (R$)</h3>
                  {dadosRelatorio.graficoVendas.every((d: any) => d.valor === 0) ? (
                    <p className="text-gray-400 text-sm text-center py-8">Nenhuma venda no periodo</p>
                  ) : (
                    <div className="flex items-end gap-1 h-32 overflow-x-auto">
                      {dadosRelatorio.graficoVendas.map((d: any) => {
                        const max = Math.max(...dadosRelatorio.graficoVendas.map((x: any) => x.valor), 1)
                        const altura = Math.max((d.valor / max) * 100, d.valor > 0 ? 4 : 0)
                        return (
                          <div key={d.data} className="flex flex-col items-center gap-1 flex-1 min-w-[20px]" title={`${d.data}: R$ ${d.valor.toFixed(2)}`}>
                            <div className="w-full bg-gold-400 rounded-t transition-all" style={{ height: `${altura}%` }} />
                            {dadosRelatorio.graficoVendas.length <= 30 && (
                              <span className="text-[8px] text-gray-400 rotate-45 origin-left">{d.data.slice(5)}</span>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Produtos mais vendidos */}
                  <div className="bg-white rounded-2xl shadow-sm p-5">
                    <h3 className="font-semibold text-gray-800 mb-4">Top 10 Produtos Mais Vendidos</h3>
                    {dadosRelatorio.maisVendidos.length === 0 ? (
                      <p className="text-gray-400 text-sm text-center py-4">Nenhuma venda no periodo</p>
                    ) : (
                      <div className="space-y-3">
                        {dadosRelatorio.maisVendidos.map((p: any, i: number) => (
                          <div key={i} className="flex items-center gap-3">
                            <span className="w-6 h-6 rounded-full bg-gold-100 text-gold-700 text-xs font-bold flex items-center justify-center flex-shrink-0">{i + 1}</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-800 truncate">{p.nome}</p>
                              <p className="text-xs text-gray-400">{p.quantidade} vendidos</p>
                            </div>
                            <span className="text-sm font-semibold text-green-600 flex-shrink-0">
                              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(p.total)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Categorias mais vendidas */}
                  <div className="bg-white rounded-2xl shadow-sm p-5">
                    <h3 className="font-semibold text-gray-800 mb-4">Categorias Mais Vendidas</h3>
                    {dadosRelatorio.categoriasMaisVendidas.length === 0 ? (
                      <p className="text-gray-400 text-sm text-center py-4">Nenhuma venda no periodo</p>
                    ) : (
                      <div className="space-y-3">
                        {dadosRelatorio.categoriasMaisVendidas.map((c: any, i: number) => {
                          const total = dadosRelatorio.categoriasMaisVendidas.reduce((s: number, x: any) => s + x.quantidade, 0)
                          const pct = total > 0 ? Math.round((c.quantidade / total) * 100) : 0
                          return (
                            <div key={i} className="space-y-1">
                              <div className="flex justify-between text-sm">
                                <span className="font-medium text-gray-700 capitalize">{c.categoria}</span>
                                <span className="text-gray-500">{c.quantidade} un ({pct}%)</span>
                              </div>
                              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full bg-gold-400 rounded-full" style={{ width: `${pct}%` }} />
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>

                  {/* Melhores clientes */}
                  <div className="bg-white rounded-2xl shadow-sm p-5">
                    <h3 className="font-semibold text-gray-800 mb-4">Clientes que Mais Compram</h3>
                    {dadosRelatorio.melhoresClientes.length === 0 ? (
                      <p className="text-gray-400 text-sm text-center py-4">Nenhuma venda no periodo</p>
                    ) : (
                      <div className="space-y-3">
                        {dadosRelatorio.melhoresClientes.map((cl: any, i: number) => (
                          <div key={i} className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-luxo-100 flex items-center justify-center text-sm font-bold text-luxo-700 flex-shrink-0">
                              {cl.nome.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-800 truncate">{cl.nome}</p>
                              <p className="text-xs text-gray-400">{cl.pedidos} pedido(s)</p>
                            </div>
                            <span className="text-sm font-semibold text-green-600 flex-shrink-0">
                              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cl.total)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Ultimos pedidos */}
                  <div className="bg-white rounded-2xl shadow-sm p-5">
                    <h3 className="font-semibold text-gray-800 mb-4">Ultimos Pedidos</h3>
                    {dadosRelatorio.ultimosPedidos.length === 0 ? (
                      <p className="text-gray-400 text-sm text-center py-4">Nenhum pedido no periodo</p>
                    ) : (
                      <div className="space-y-3">
                        {dadosRelatorio.ultimosPedidos.map((p: any) => (
                          <div key={p.id} className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-800">{p.cliente_nome || 'Cliente'}</p>
                              <p className="text-xs text-gray-400">{new Date(p.criado_em).toLocaleDateString('pt-BR')}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-semibold text-green-600">
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(p.total)}
                              </p>
                              <span className={`text-xs px-2 py-0.5 rounded-full ${p.status === 'entregue' ? 'bg-green-100 text-green-700' : p.status === 'cancelado' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                                {p.status?.replace(/_/g, ' ')}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* ---- CATEGORIAS ---- */}
        {aba === 'categorias' && (
          <div className="space-y-6">
            {/* Formulário adicionar */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="font-semibold text-gray-800 mb-4">Adicionar Nova Categoria/Subcategoria</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">Nome (Label)</label>
                  <input value={formCat.label} onChange={e => {
                    const label = e.target.value
                    const slug = label.toLowerCase()
                      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
                      .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
                    setFormCat({ ...formCat, label, slug })
                  }} className="input-luxo" placeholder="Ex: Michael Kors" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">Slug (URL)</label>
                  <input value={formCat.slug} onChange={e => setFormCat({ ...formCat, slug: e.target.value })} className="input-luxo" placeholder="Ex: michael-kors" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">Tipo</label>
                  <select value={formCat.tipo} onChange={e => setFormCat({ ...formCat, tipo: e.target.value })} className="input-luxo">
                    <option value="item">Item — marca, subcategoria ou tipo de produto</option>
                    <option value="grupo">Grupo — divisão por gênero (Feminino, Masculino...)</option>
                    <option value="genero">Categoria raiz com grupos (ex: Roupas, Calçados)</option>
                    <option value="marca">Categoria raiz por marca (ex: Bolsas)</option>
                    <option value="subcategoria">Categoria raiz simples (ex: Acessórios)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">Pertence a (pai)</label>
                  <select value={formCat.pai_slug} onChange={e => setFormCat({ ...formCat, pai_slug: e.target.value })} className="input-luxo">
                    <option value="">Nenhum (categoria raiz)</option>
                    {categoriasLoja.filter(c => c.tipo !== 'item').map(c => (
                      <option key={c.slug} value={c.slug}>{c.label} ({c.slug})</option>
                    ))}
                  </select>
                </div>
              </div>
              <button onClick={salvarCategoria} disabled={salvandoCat} className="btn-gold mt-4 disabled:opacity-50">
                {salvandoCat ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Adicionar Categoria
              </button>
            </div>

            {/* Lista por categoria raiz */}
            {/* Categorias raiz dinamicas do banco */}
            {categoriasLoja.filter(c => !c.pai_slug && c.tipo !== 'item' && c.tipo !== 'grupo').sort((a, b) => a.ordem - b.ordem).map(catRaiz => {
              const catSlug = catRaiz.slug;
              const grupos = categoriasLoja.filter(c => c.pai_slug === catSlug && c.tipo === 'grupo')
              const itensDirectos = categoriasLoja.filter(c => c.pai_slug === catSlug && c.tipo === 'item')

              return (
                <div key={catSlug} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                  <div className="bg-luxo-900 px-6 py-3 flex items-center justify-between">
                    <h3 className="text-white font-semibold">{catRaiz.label}</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-gold-300 text-xs">{catRaiz.tipo}</span>
                      <button onClick={() => setEditandoCat({ id: catRaiz.id, label: catRaiz.label, slug: catRaiz.slug })} className="text-gold-300 hover:text-white" title="Renomear">
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => excluirCategoria(catRaiz.id)} className="text-red-400 hover:text-red-300" title="Excluir categoria raiz">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {grupos.length > 0 ? (
                    <div className="p-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                      {grupos.map(grupo => {
                        const itens = categoriasLoja.filter(c => c.pai_slug === grupo.slug)
                        return (
                          <div key={grupo.slug} className="border border-gray-100 rounded-xl p-3">
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-xs font-bold text-gold-600 uppercase">{grupo.label}</p>
                              <button onClick={() => excluirCategoria(grupo.id)} className="text-red-400 hover:text-red-600">
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                            <ul className="space-y-1">
                              {itens.map(item => (
                                <li key={item.slug} className="flex items-center justify-between text-sm text-gray-600">
                                  <span>{item.label}</span>
                                  <button onClick={() => excluirCategoria(item.id)} className="text-red-300 hover:text-red-500 ml-2">
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="p-4">
                      <div className="flex flex-wrap gap-2">
                        {itensDirectos.map(item => (
                          <div key={item.slug} className="flex items-center gap-1 bg-gray-50 border border-gray-100 rounded-full px-3 py-1">
                            <span className="text-sm text-gray-700">{item.label}</span>
                            <button onClick={() => excluirCategoria(item.id)} className="text-red-300 hover:text-red-500 ml-1">
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* ---- CONFIGURAÇÕES ---- */}
        {aba === 'config' && (
          <div className="bg-white rounded-2xl shadow-sm p-6 max-w-2xl space-y-4">
            <h3 className="font-semibold text-gray-800 mb-1">Contato e Redes Sociais</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="text-xs font-medium text-gray-500 mb-1 block">WhatsApp (com DDD e país)</label>
                <input value={config.whatsapp || ''} onChange={e => setConfig({ ...config, whatsapp: e.target.value })} placeholder="5511900000000" className="input-luxo" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Instagram</label>
                <input value={config.instagram || ''} onChange={e => setConfig({ ...config, instagram: e.target.value })} placeholder="https://instagram.com/usuario" className="input-luxo" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Facebook</label>
                <input value={config.facebook || ''} onChange={e => setConfig({ ...config, facebook: e.target.value })} placeholder="https://facebook.com/pagina" className="input-luxo" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">TikTok</label>
                <input value={config.tiktok || ''} onChange={e => setConfig({ ...config, tiktok: e.target.value })} placeholder="https://tiktok.com/@usuario" className="input-luxo" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">E-mail de Contato</label>
                <input type="email" value={config.email_contato || ''} onChange={e => setConfig({ ...config, email_contato: e.target.value })} placeholder="contato@brechodluxo.com.br" className="input-luxo" />
              </div>
            </div>
            <div className="border-t border-gray-100 pt-4">
              <h3 className="font-semibold text-gray-800 mb-3">Frete</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">Frete grátis acima de (R$)</label>
                  <input type="number" value={config.frete_gratis_acima || ''} onChange={e => setConfig({ ...config, frete_gratis_acima: Number(e.target.value) })} placeholder="299" className="input-luxo" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">CEP de Origem</label>
                  <input value={config.cep_origem || ''} onChange={e => setConfig({ ...config, cep_origem: e.target.value })} placeholder="13201-032" className="input-luxo" />
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-medium text-gray-500 mb-1 block">Token Melhor Envio</label>
                  <input type="password" value={config.melhor_envio_token || ''} onChange={e => setConfig({ ...config, melhor_envio_token: e.target.value })} placeholder="Token do Melhor Envio" className="input-luxo" />
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

      {/* ---- MODAL PUBLICAR PRODUTO ---- */}
      {modalPublicar && produtoPublicar && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-serif text-xl font-bold text-luxo-900">🚀 Publicar na Loja Virtual</h2>
              <button onClick={() => setModalPublicar(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 mb-4">
              <p className="font-medium text-gray-800 text-sm">{produtoPublicar.nome}</p>
              <p className="text-gold-600 text-sm font-bold">{fmt(produtoPublicar.preco_venda)}</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Descrição para o site (até 8 linhas)</label>
                <textarea rows={4} value={formPublicar.descricao_loja} onChange={e => setFormPublicar({ ...formPublicar, descricao_loja: e.target.value })} className="input-luxo resize-none" placeholder="Descreva o produto..." />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">Marca</label>
                  <input value={formPublicar.marca} onChange={e => setFormPublicar({ ...formPublicar, marca: e.target.value })} className="input-luxo" placeholder="Ex: Louis Vuitton" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">Subcategoria</label>
                  <input value={formPublicar.subcategoria} onChange={e => setFormPublicar({ ...formPublicar, subcategoria: e.target.value })} className="input-luxo" placeholder="Ex: Vestidos" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">Peso (kg)</label>
                  <input type="number" step="0.1" value={formPublicar.peso} onChange={e => setFormPublicar({ ...formPublicar, peso: Number(e.target.value) })} className="input-luxo" />
                </div>
                <div className="flex items-center gap-2 mt-5">
                  <input type="checkbox" id="dest-pub" checked={formPublicar.destaque} onChange={e => setFormPublicar({ ...formPublicar, destaque: e.target.checked })} className="w-4 h-4 accent-gold-500" />
                  <label htmlFor="dest-pub" className="text-sm text-gray-700">Produto em destaque</label>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-2 block">Fotos</label>
                <div className="flex gap-2 mb-2">
                  <input value={novaFotoPublicar} onChange={e => setNovaFotoPublicar(e.target.value)} className="input-luxo flex-1" placeholder="URL da foto" />
                  <button onClick={() => { if (novaFotoPublicar) { setFormPublicar(prev => ({ ...prev, fotos_loja: [...prev.fotos_loja, novaFotoPublicar] })); setNovaFotoPublicar('') }}} className="px-3 py-2 bg-gray-100 rounded-xl text-sm">+ Add</button>
                </div>
                {formPublicar.fotos_loja.length > 0 && (
                  <div className="flex gap-2 flex-wrap">
                    {formPublicar.fotos_loja.map((f, i) => (
                      <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden border border-gray-200">
                        <img src={f} alt="" className="w-full h-full object-cover" />
                        <button onClick={() => setFormPublicar(prev => ({ ...prev, fotos_loja: prev.fotos_loja.filter((_, idx) => idx !== i) }))} className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white rounded-bl text-xs flex items-center justify-center">×</button>
                      </div>
                    ))}
                  </div>
                  </>
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
      )}

      {/* ---- MODAL PRODUTO ONLINE ---- */}
      {modalOnline && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-serif text-xl font-bold text-luxo-900">{editandoOnline ? '✏️ Editar Produto' : '+ Novo Produto Online'}</h2>
              <button onClick={() => setModalOnline(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="text-xs font-medium text-gray-500 mb-1 block">Nome *</label>
                  <input value={formOnline.nome || ''} onChange={e => setFormOnline({ ...formOnline, nome: e.target.value })} className="input-luxo" placeholder="Nome do produto" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">Preço *</label>
                  <input type="number" step="0.01" value={formOnline.preco || ''} onChange={e => setFormOnline({ ...formOnline, preco: Number(e.target.value) })} className="input-luxo" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">Estoque</label>
                  <input type="number" value={formOnline.estoque || 0} onChange={e => setFormOnline({ ...formOnline, estoque: Number(e.target.value) })} className="input-luxo" />
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-medium text-gray-500 mb-1 block">Categoria *</label>
                  <select value={catSelecionada} onChange={e => {
                    setCatSelecionada(e.target.value)
                    setFormOnline({ ...formOnline, categoria: e.target.value, subcategoria: '', marca: '' })
                  }} className="input-luxo">
                    <option value="">Selecione a categoria...</option>
                    {categoriasLoja.filter(c => !c.pai_slug).sort((a,b) => a.ordem - b.ordem).map(cat => (
                      <option key={cat.slug} value={cat.slug}>{cat.label}</option>
                    ))}
                  </select>
                </div>

                {/* Bolsas: dropdown de marca */}
                {catSelecionada && categoriasLoja.filter(c => c.pai_slug === catSelecionada && c.tipo === 'item').length > 0 && categoriasLoja.filter(c => c.pai_slug === catSelecionada && c.tipo === 'grupo').length === 0 && (
                  <div className="col-span-2">
                    <label className="text-xs font-medium text-gray-500 mb-1 block">Marca</label>
                    <select value={formOnline.marca || ''} onChange={e => setFormOnline({ ...formOnline, marca: e.target.value })} className="input-luxo">
                      <option value="">Selecione a marca...</option>
                      {categoriasLoja.filter(c => c.pai_slug === catSelecionada && c.tipo === 'item').map(item => (
                        <option key={item.slug} value={item.slug}>{item.label}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Roupas e Calcados: dropdown de genero + subcategoria separados */}
                {catSelecionada && categoriasLoja.filter(c => c.pai_slug === catSelecionada && c.tipo === 'grupo').length > 0 && (
                  <>
                    <div>
                      <label className="text-xs font-medium text-gray-500 mb-1 block">Gênero</label>
                      <select value={formOnline.genero || ''} onChange={e => {
                        setFormOnline({ ...formOnline, genero: e.target.value, subcategoria: '' })
                      }} className="input-luxo">
                        <option value="">Selecione o gênero...</option>
                        {categoriasLoja.filter(c => c.pai_slug === catSelecionada && c.tipo === 'grupo').map(grupo => (
                          <option key={grupo.slug} value={grupo.slug}>{grupo.label}</option>
                        ))}
                      </select>
                    </div>
                    {formOnline.genero && (
                      <div>
                        <label className="text-xs font-medium text-gray-500 mb-1 block">Tipo</label>
                        <select value={formOnline.subcategoria || ''} onChange={e => {
                          setFormOnline({ ...formOnline, subcategoria: e.target.value })
                        }} className="input-luxo">
                          <option value="">Selecione o tipo...</option>
                          {categoriasLoja.filter(c => c.pai_slug === formOnline.genero && c.tipo === 'item').map(item => (
                            <option key={item.slug} value={item.slug}>{item.label}</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </>
                )}

                {/* Acessorios: dropdown de subcategoria direta */}
                {catSelecionada && categoriasLoja.filter(c => c.pai_slug === catSelecionada && c.tipo === 'item').length > 0 && categoriasLoja.filter(c => c.pai_slug === catSelecionada && c.tipo === 'grupo').length === 0 && false && (
                  <div className="col-span-2">
                    <label className="text-xs font-medium text-gray-500 mb-1 block">Subcategoria</label>
                    <select value={formOnline.subcategoria || ''} onChange={e => setFormOnline({ ...formOnline, subcategoria: e.target.value })} className="input-luxo">
                      <option value="">Selecione...</option>
                      {categoriasLoja.filter(c => c.pai_slug === catSelecionada && c.tipo === 'item').map(item => (
                        <option key={item.slug} value={item.slug}>{item.label}</option>
                      ))}
                    </select>
                  </div>
                )}
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">Peso (kg)</label>
                  <input type="number" step="0.1" value={formOnline.peso || 0.3} onChange={e => setFormOnline({ ...formOnline, peso: Number(e.target.value) })} className="input-luxo" />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Descrição</label>
                <textarea rows={3} value={formOnline.descricao || ''} onChange={e => setFormOnline({ ...formOnline, descricao: e.target.value })} className="input-luxo resize-none" />
              </div>
              {/* TAMANHOS */}
              <div>
                <label className="text-xs font-medium text-gray-500 mb-2 block">Tamanhos</label>
                <div className="flex gap-2 mb-2">
                  <input value={novoTamanho} onChange={e => setNovoTamanho(e.target.value)} className="input-luxo flex-1" placeholder="P, M, G ou 38, 40..." />
                  <button onClick={() => { if (novoTamanho) { setFormOnline(prev => ({ ...prev, tamanhos: [...(prev.tamanhos || []), novoTamanho] })); setNovoTamanho('') }}} className="px-3 py-2 bg-gray-100 rounded-xl text-sm">+ Add</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(formOnline.tamanhos || []).map((t, i) => (
                    <span key={i} className="bg-luxo-50 text-luxo-700 text-xs px-3 py-1 rounded-full flex items-center gap-1">{t}
                      <button onClick={() => setFormOnline(prev => ({ ...prev, tamanhos: (prev.tamanhos || []).filter((_, idx) => idx !== i) }))}>×</button>
                    </span>
                  ))}
                </div>
              </div>
              {/* CORES */}
              <div>
                <label className="text-xs font-medium text-gray-500 mb-2 block">Cores</label>
                <div className="flex gap-2 mb-2">
                  <input value={novaCor} onChange={e => setNovaCor(e.target.value)} className="input-luxo flex-1" placeholder="Preto, Bege..." />
                  <button onClick={() => { if (novaCor) { setFormOnline(prev => ({ ...prev, cores: [...(prev.cores || []), novaCor] })); setNovaCor('') }}} className="px-3 py-2 bg-gray-100 rounded-xl text-sm">+ Add</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(formOnline.cores || []).map((c, i) => (
                    <span key={i} className="bg-gold-50 text-gold-700 text-xs px-3 py-1 rounded-full flex items-center gap-1">{c}
                      <button onClick={() => setFormOnline(prev => ({ ...prev, cores: (prev.cores || []).filter((_, idx) => idx !== i) }))}>×</button>
                    </span>
                  ))}
                </div>
              </div>
              {/* FOTOS */}
              <div>
                <label className="text-xs font-medium text-gray-500 mb-2 block">Fotos</label>
                <div className="flex gap-2 mb-2">
                  <input value={novaFoto} onChange={e => setNovaFoto(e.target.value)} className="input-luxo flex-1" placeholder="URL da foto" />
                  <button onClick={() => { if (novaFoto) { setFormOnline(prev => ({ ...prev, fotos: [...(prev.fotos || []), novaFoto] })); setNovaFoto('') }}} className="px-3 py-2 bg-gray-100 rounded-xl text-sm">+ URL</button>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => { if (e.target.files?.[0]) uploadFoto(e.target.files[0]) }} />
                  <button onClick={() => fileRef.current?.click()} disabled={uploadingFoto} className="flex items-center gap-2 px-4 py-2 border border-dashed border-gray-300 rounded-xl text-sm text-gray-500 hover:border-gold-400 disabled:opacity-50">
                    {uploadingFoto ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    {uploadingFoto ? 'Enviando...' : 'Upload de arquivo'}
                  </button>
                </div>
                {(formOnline.fotos || []).length > 0 && (
                  <>
                  <p className="text-xs text-gray-400 mb-1">Arraste para reordenar. A primeira é a principal.</p>
                  <div className="grid grid-cols-4 gap-2">
                    {(formOnline.fotos || []).map((f, i) => (
                      <div key={i}
                        draggable
                        onDragStart={e => { e.dataTransfer.effectAllowed = 'move'; setDragIndex(i) }}
                        onDragOver={e => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; setDragOverIndex(i) }}
                        onDrop={e => { e.preventDefault(); if (dragIndex !== null && dragIndex !== i) reordenarFotos(dragIndex, i); setDragIndex(null); setDragOverIndex(null) }}
                        onDragEnd={() => { setDragIndex(null); setDragOverIndex(null) }}
                        className={`relative aspect-square rounded-xl overflow-hidden cursor-grab active:cursor-grabbing select-none transition-all ${dragOverIndex === i ? 'border-2 border-gold-500 scale-105 shadow-lg' : 'border border-gray-200'} ${dragIndex === i ? 'opacity-40' : ''}`}>
                        <img src={f} alt="" className="w-full h-full object-cover pointer-events-none" />
                        <button onClick={() => setFormOnline(prev => ({ ...prev, fotos: (prev.fotos || []).filter((_, idx) => idx !== i) }))} className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs">×</button>
                        {i === 0 && <span className="absolute bottom-1 left-1 bg-gold-500 text-white text-[10px] px-1 rounded">Principal</span>}
                      </div>
                    ))}
                  </div>
                  </>
                )}
              </div>
              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={formOnline.visivel !== false} onChange={e => setFormOnline({ ...formOnline, visivel: e.target.checked })} className="w-4 h-4 accent-gold-500" />
                  <span className="text-sm text-gray-700">Visível na loja</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={formOnline.destaque || false} onChange={e => setFormOnline({ ...formOnline, destaque: e.target.checked })} className="w-4 h-4 accent-gold-500" />
                  <span className="text-sm text-gray-700">Destaque</span>
                </label>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setModalOnline(false)} className="flex-1 btn-outline justify-center">Cancelar</button>
              <button onClick={salvarProdutoOnline} className="flex-1 btn-gold justify-center"><Save className="w-4 h-4" />{editandoOnline ? 'Salvar' : 'Criar'}</button>
            </div>
          </div>
        </div>
      )}

      {/* ---- MODAL BLOG POST ---- */}
      {modalBlog && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-serif text-xl font-bold text-luxo-900">{editandoBlog ? '✏️ Editar Post' : '✍️ Novo Post'}</h2>
              <button onClick={() => setModalBlog(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Título *</label>
                <input value={formBlog.titulo} onChange={e => setFormBlog({ ...formBlog, titulo: e.target.value })} className="input-luxo" placeholder="Título do post" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Resumo</label>
                <textarea rows={2} value={formBlog.resumo} onChange={e => setFormBlog({ ...formBlog, resumo: e.target.value })} className="input-luxo resize-none" placeholder="Breve descrição que aparece na listagem..." />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Conteúdo *</label>
                <textarea rows={10} value={formBlog.conteudo} onChange={e => setFormBlog({ ...formBlog, conteudo: e.target.value })} className="input-luxo resize-none" placeholder="Escreva o conteúdo do post aqui..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block flex items-center gap-1"><ImageIcon className="w-3.5 h-3.5" /> Imagem Capa</label>
                  <input value={formBlog.imagem_capa} onChange={e => setFormBlog({ ...formBlog, imagem_capa: e.target.value })} className="input-luxo mb-2" placeholder="Cole uma URL ou faça upload abaixo..." />
                  <input ref={blogImgRef} type="file" accept="image/*" className="hidden" onChange={e => { if (e.target.files?.[0]) uploadBlogImg(e.target.files[0]) }} />
                  <button type="button" onClick={() => blogImgRef.current?.click()} disabled={uploadingBlogImg}
                    className="flex items-center gap-2 px-4 py-2 border border-dashed border-gray-300 rounded-xl text-sm text-gray-500 hover:border-gold-400 disabled:opacity-50">
                    {uploadingBlogImg ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    {uploadingBlogImg ? 'Enviando...' : 'Upload do computador'}
                  </button>
                  {formBlog.imagem_capa && (
                    <img src={formBlog.imagem_capa} alt="Preview" className="mt-2 w-full h-32 object-cover rounded-xl" />
                  )}
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block flex items-center gap-1"><Video className="w-3.5 h-3.5" /> Vídeo (YouTube/Vimeo URL)</label>
                  <input value={formBlog.video_url} onChange={e => setFormBlog({ ...formBlog, video_url: e.target.value })} className="input-luxo" placeholder="https://youtube.com/watch?v=..." />
                  {formBlog.video_url && <p className="text-xs text-green-600 mt-1">✓ Vídeo detectado</p>}
                </div>
              </div>

              {/* PREVIEW IMAGEM E VIDEO */}
              {(formBlog.imagem_capa || formBlog.video_url) && (
                <div className="grid grid-cols-2 gap-4">
                  {formBlog.imagem_capa && (
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Preview capa:</p>
                      <img src={formBlog.imagem_capa} alt="Capa" className="w-full h-32 object-cover rounded-xl" />
                    </div>
                  )}
                  {formBlog.video_url && extrairVideoEmbed(formBlog.video_url) && (
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Preview vídeo:</p>
                      <iframe src={extrairVideoEmbed(formBlog.video_url)!} className="w-full h-32 rounded-xl" allowFullScreen />
                    </div>
                  )}
                </div>
              )}

              {/* TAGS */}
              <div>
                <label className="text-xs font-medium text-gray-500 mb-2 block flex items-center gap-1"><Tag className="w-3.5 h-3.5" /> Tags</label>
                <div className="flex gap-2 mb-2">
                  <input value={novaTag} onChange={e => setNovaTag(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); if (novaTag) { setFormBlog(prev => ({ ...prev, tags: [...prev.tags, novaTag] })); setNovaTag('') } }}}
                    className="input-luxo flex-1" placeholder="Moda, Luxo, Dicas..." />
                  <button onClick={() => { if (novaTag) { setFormBlog(prev => ({ ...prev, tags: [...prev.tags, novaTag] })); setNovaTag('') }}} className="px-3 py-2 bg-gray-100 rounded-xl text-sm">+ Add</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formBlog.tags.map((t, i) => (
                    <span key={i} className="bg-gold-50 text-gold-700 text-xs px-3 py-1 rounded-full flex items-center gap-1">{t}
                      <button onClick={() => setFormBlog(prev => ({ ...prev, tags: prev.tags.filter((_, idx) => idx !== i) }))}>×</button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex gap-6 pt-2 border-t border-gray-100">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={formBlog.publicado} onChange={e => setFormBlog({ ...formBlog, publicado: e.target.checked })} className="w-4 h-4 accent-gold-500" />
                  <span className="text-sm text-gray-700">Publicar agora</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={formBlog.destaque} onChange={e => setFormBlog({ ...formBlog, destaque: e.target.checked })} className="w-4 h-4 accent-gold-500" />
                  <span className="text-sm text-gray-700">Post em destaque</span>
                </label>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setModalBlog(false)} className="flex-1 btn-outline justify-center">Cancelar</button>
              <button onClick={salvarBlog} disabled={salvandoBlog} className="flex-1 btn-gold justify-center disabled:opacity-50">
                {salvandoBlog ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {salvandoBlog ? 'Salvando...' : editandoBlog ? 'Salvar Alterações' : 'Criar Post'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL RENOMEAR CATEGORIA */}
      {editandoCat && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm">
            <h3 className="font-semibold text-gray-800 mb-4">Renomear Categoria</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Nome</label>
                <input value={editandoCat.label}
                  onChange={e => setEditandoCat({ ...editandoCat, label: e.target.value })}
                  className="input-luxo" placeholder="Nome da categoria" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Slug (URL)</label>
                <input value={editandoCat.slug}
                  onChange={e => setEditandoCat({ ...editandoCat, slug: e.target.value })}
                  className="input-luxo" placeholder="slug-da-categoria" />
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={() => setEditandoCat(null)} className="flex-1 btn-outline justify-center">Cancelar</button>
              <button onClick={renomearCategoria} disabled={salvandoRenomear} className="flex-1 btn-gold justify-center disabled:opacity-50">
                {salvandoRenomear ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL GERADOR DE CONTEUDO */}
      {(geradorProduto || geradorPost) && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <GeradorConteudo
            produto={geradorProduto ? {
              nome: (geradorProduto as Produto).nome || (geradorProduto as ProdutoOnline).nome,
              preco: (geradorProduto as Produto).preco_venda || (geradorProduto as ProdutoOnline).preco,
              marca: (geradorProduto as ProdutoOnline).marca,
              categoria: (geradorProduto as ProdutoOnline).categoria,
              descricao: (geradorProduto as ProdutoOnline).descricao,
              imagem: ((geradorProduto as ProdutoOnline).fotos?.[0]) || (geradorProduto as Produto).imagem_url,
            } : undefined}
            post={geradorPost ? {
              titulo: geradorPost.titulo,
              resumo: geradorPost.resumo,
              tags: geradorPost.tags,
            } : undefined}
            onFechar={() => { setGeradorProduto(null); setGeradorPost(null) }}
          />
        </div>
      )}
    </div>
  )
}
