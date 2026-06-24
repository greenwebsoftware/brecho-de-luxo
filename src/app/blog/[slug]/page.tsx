'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Calendar, Eye, Heart, MessageCircle, Send, Loader2, Tag, User, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'

interface Post {
  id: string; titulo: string; slug: string; resumo?: string
  conteudo: string; imagem_capa?: string; tags: string[]
  visualizacoes: number; curtidas: number; criado_em: string
}

interface Comentario {
  id: string; conteudo: string; curtidas: number; criado_em: string
  nome_visitante?: string; clientes_site?: { nome: string }
}

interface Usuario {
  id: string; email: string; nome?: string
}

export default function BlogPostPage() {
  const { slug } = useParams()
  const [post, setPost] = useState<Post | null>(null)
  const [comentarios, setComentarios] = useState<Comentario[]>([])
  const [loading, setLoading] = useState(true)
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [curtiu, setCurtiu] = useState(false)
  const [totalCurtidas, setTotalCurtidas] = useState(0)

  // Form comentário
  const [comentario, setComentario] = useState('')
  const [nomeVisitante, setNomeVisitante] = useState('')
  const [emailVisitante, setEmailVisitante] = useState('')
  const [enviando, setEnviando] = useState(false)

  useEffect(() => {
    if (slug) {
      carregarPost()
      verificarUsuario()
    }
  }, [slug])

  const carregarPost = async () => {
    try {
      const [postRes, comRes] = await Promise.all([
        fetch(`/api/blog?slug=${slug}`),
        fetch(`/api/blog/comentarios?post_id=${slug}`),
      ])
      const postData = await postRes.json()
      const comData = await comRes.json()

      if (postData.data) {
        setPost(postData.data)
        setTotalCurtidas(postData.data.curtidas || 0)
        // Busca comentários pelo ID real
        const comRes2 = await fetch(`/api/blog/comentarios?post_id=${postData.data.id}`)
        const comData2 = await comRes2.json()
        setComentarios(comData2.data || [])
      }
    } catch {}
    setLoading(false)
  }

  const verificarUsuario = async () => {
    const res = await fetch('/api/auth')
    const data = await res.json()
    if (data.usuario) setUsuario(data.usuario)
  }

  const curtir = async () => {
    if (!post) return
    const res = await fetch('/api/blog/curtidas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ post_id: post.id }),
    })
    const data = await res.json()
    setCurtiu(data.curtiu)
    if (data.total !== undefined) setTotalCurtidas(data.total)
    else setTotalCurtidas(prev => data.curtiu ? prev + 1 : prev - 1)
  }

  const enviarComentario = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!comentario.trim()) { toast.error('Escreva um comentário'); return }
    if (!usuario && !nomeVisitante.trim()) { toast.error('Informe seu nome'); return }

    setEnviando(true)
    try {
      const res = await fetch('/api/blog/comentarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          post_id: post?.id,
          conteudo: comentario,
          nome_visitante: usuario ? null : nomeVisitante,
          email_visitante: usuario ? null : emailVisitante,
        }),
      })
      const data = await res.json()

      if (data.ok) {
        toast.success(data.mensagem)
        setComentario('')
        setNomeVisitante('')
        setEmailVisitante('')
        // Recarrega comentários
        const comRes = await fetch(`/api/blog/comentarios?post_id=${post?.id}`)
        const comData = await comRes.json()
        setComentarios(comData.data || [])
      } else {
        toast.error(data.mensagem || data.error)
      }
    } catch {
      toast.error('Erro ao enviar comentário')
    }
    setEnviando(false)
  }

  const fmtData = (d: string) => new Date(d).toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'long', year: 'numeric'
  })

  const nomeAutor = (c: Comentario) =>
    c.clientes_site?.nome || c.nome_visitante || 'Visitante'

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-gold-400 animate-spin" />
    </div>
  )

  if (!post) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h2 className="font-serif text-2xl text-gray-600 mb-4">Post não encontrado</h2>
        <Link href="/blog" className="btn-gold">← Voltar ao Blog</Link>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* IMAGEM CAPA */}
      {post.imagem_capa && (
        <div className="w-full h-64 md:h-96 overflow-hidden">
          <img src={post.imagem_capa} alt={post.titulo} className="w-full h-full object-cover" />
        </div>
      )}

      <div className="max-w-3xl mx-auto px-4 py-10">
        {/* VOLTAR */}
        <Link href="/blog" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gold-600 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Voltar ao Blog
        </Link>

        {/* TAGS */}
        {post.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags.map((tag, i) => (
              <span key={i} className="flex items-center gap-1 text-xs bg-gold-50 text-gold-600 px-3 py-1 rounded-full">
                <Tag className="w-3 h-3" /> {tag}
              </span>
            ))}
          </div>
        )}

        {/* TITULO */}
        <h1 className="font-serif text-4xl font-bold text-luxo-900 mb-4 leading-tight">{post.titulo}</h1>

        {/* META */}
        <div className="flex items-center gap-4 text-sm text-gray-400 mb-8 pb-6 border-b border-gray-100">
          <span className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4" /> {fmtData(post.criado_em)}
          </span>
          <span className="flex items-center gap-1.5">
            <Eye className="w-4 h-4" /> {post.visualizacoes} visualizações
          </span>
          <span className="flex items-center gap-1.5">
            <MessageCircle className="w-4 h-4" /> {comentarios.length} comentários
          </span>
        </div>

        {/* RESUMO */}
        {post.resumo && (
          <p className="text-lg text-gray-600 leading-relaxed mb-6 font-medium border-l-4 border-gold-400 pl-4">
            {post.resumo}
          </p>
        )}

        {/* CONTEUDO */}
        <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed mb-8"
          dangerouslySetInnerHTML={{ __html: post.conteudo.replace(/\n/g, '<br/>') }} />

        {/* CURTIR */}
        <div className="flex items-center gap-4 py-6 border-t border-b border-gray-100 mb-10">
          <button onClick={curtir}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-medium text-sm transition-all ${
              curtiu
                ? 'bg-red-500 text-white shadow-md'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-red-300 hover:text-red-500'
            }`}>
            <Heart className={`w-4 h-4 ${curtiu ? 'fill-white' : ''}`} />
            {curtiu ? 'Você curtiu!' : 'Curtir'}
          </button>
          <span className="text-sm text-gray-400">{totalCurtidas} curtidas</span>
        </div>

        {/* COMENTARIOS */}
        <div>
          <h3 className="font-serif text-2xl font-bold text-luxo-900 mb-6 flex items-center gap-2">
            <MessageCircle className="w-6 h-6 text-gold-500" />
            {comentarios.length > 0 ? `${comentarios.length} Comentários` : 'Comentários'}
          </h3>

          {/* LISTA */}
          {comentarios.length > 0 && (
            <div className="space-y-4 mb-8">
              {comentarios.map(c => (
                <div key={c.id} className="bg-white rounded-2xl p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center">
                        <span className="text-white text-xs font-bold">{nomeAutor(c)[0].toUpperCase()}</span>
                      </div>
                      <span className="font-medium text-gray-800 text-sm">{nomeAutor(c)}</span>
                    </div>
                    <span className="text-xs text-gray-400">{fmtData(c.criado_em)}</span>
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed">{c.conteudo}</p>
                </div>
              ))}
            </div>
          )}

          {/* FORM COMENTARIO */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <User className="w-4 h-4 text-gold-500" />
              {usuario ? `Comentar como ${usuario.nome || usuario.email}` : 'Deixe seu comentário'}
            </h4>

            <form onSubmit={enviarComentario} className="space-y-3">
              {!usuario && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">Seu nome *</label>
                    <input value={nomeVisitante} onChange={e => setNomeVisitante(e.target.value)}
                      className="input-luxo" placeholder="Como quer ser identificado" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">E-mail (opcional)</label>
                    <input type="email" value={emailVisitante} onChange={e => setEmailVisitante(e.target.value)}
                      className="input-luxo" placeholder="Não será exibido" />
                  </div>
                </div>
              )}

              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Comentário *</label>
                <textarea value={comentario} onChange={e => setComentario(e.target.value)}
                  rows={4} className="input-luxo resize-none"
                  placeholder="Compartilhe sua opinião, experiência ou dúvida..." />
              </div>

              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-400">
                  Comentários respeitosos são bem-vindos. Conteúdo ofensivo será removido.
                </p>
                <button type="submit" disabled={enviando} className="btn-gold disabled:opacity-50">
                  {enviando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  {enviando ? 'Enviando...' : 'Comentar'}
                </button>
              </div>
            </form>

            {!usuario && (
              <p className="text-xs text-gray-400 mt-3 text-center">
                <Link href="/conta" className="text-gold-600 hover:underline">Faça login</Link> para comentar com seu perfil
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
