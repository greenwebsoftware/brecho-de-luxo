'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Calendar, Eye, Heart, MessageCircle, Search, Tag } from 'lucide-react'
import { Loader2 } from 'lucide-react'

interface Post {
  id: string
  titulo: string
  slug: string
  resumo?: string
  imagem_capa?: string
  tags: string[]
  visualizacoes: number
  curtidas: number
  criado_em: string
}

export default function BlogPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState('')
  const [total, setTotal] = useState(0)
  const [pagina, setPagina] = useState(1)

  useEffect(() => {
    buscarPosts()
  }, [pagina])

  const buscarPosts = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/blog?limit=6&page=${pagina}`)
      const data = await res.json()
      if (pagina === 1) setPosts(data.data || [])
      else setPosts(prev => [...prev, ...(data.data || [])])
      setTotal(data.total || 0)
    } catch {}
    setLoading(false)
  }

  const filtrados = posts.filter(p =>
    p.titulo.toLowerCase().includes(busca.toLowerCase()) ||
    p.resumo?.toLowerCase().includes(busca.toLowerCase()) ||
    p.tags?.some(t => t.toLowerCase().includes(busca.toLowerCase()))
  )

  const fmtData = (d: string) => new Date(d).toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'long', year: 'numeric'
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HERO */}
      <div className="bg-gradient-to-br from-luxo-900 to-luxo-800 py-16">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <span className="text-gold-400 text-sm font-medium uppercase tracking-widest">Brechó de Luxo</span>
          <h1 className="font-serif text-white text-5xl font-bold mt-2 mb-4">Blog & Inspirações</h1>
          <p className="text-gold-200 text-lg max-w-2xl mx-auto">
            Dicas de moda, tendências, cuidados com peças de luxo e muito mais. Participe e compartilhe sua visão!
          </p>
          {/* BUSCA */}
          <div className="relative max-w-md mx-auto mt-8">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={busca}
              onChange={e => setBusca(e.target.value)}
              placeholder="Buscar no blog..."
              className="w-full pl-11 pr-4 py-3 rounded-full text-sm outline-none bg-white text-gray-800 shadow-lg"
            />
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-12">
        {loading && posts.length === 0 ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 text-gold-400 animate-spin" />
          </div>
        ) : filtrados.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">✍️</div>
            <h2 className="font-serif text-2xl text-gray-600 mb-2">Nenhum post encontrado</h2>
            <p className="text-gray-400">Em breve teremos conteúdo incrível aqui!</p>
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtrados.map(post => (
                <Link key={post.id} href={`/blog/${post.slug}`}
                  className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-shadow group">
                  {/* IMAGEM */}
                  <div className="aspect-video overflow-hidden bg-gradient-to-br from-gold-100 to-gold-200">
                    {post.imagem_capa ? (
                      <img src={post.imagem_capa} alt={post.titulo}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-5xl">👗</div>
                    )}
                  </div>

                  {/* CONTEUDO */}
                  <div className="p-5">
                    {/* TAGS */}
                    {post.tags?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {post.tags.slice(0, 3).map((tag, i) => (
                          <span key={i} className="flex items-center gap-1 text-xs bg-gold-50 text-gold-600 px-2 py-0.5 rounded-full">
                            <Tag className="w-3 h-3" /> {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    <h2 className="font-serif text-lg font-bold text-luxo-900 mb-2 group-hover:text-gold-600 transition-colors line-clamp-2">
                      {post.titulo}
                    </h2>

                    {post.resumo && (
                      <p className="text-sm text-gray-500 leading-relaxed line-clamp-3 mb-4">
                        {post.resumo}
                      </p>
                    )}

                    {/* META */}
                    <div className="flex items-center justify-between text-xs text-gray-400 pt-3 border-t border-gray-50">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {fmtData(post.criado_em)}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Eye className="w-3.5 h-3.5" /> {post.visualizacoes}
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart className="w-3.5 h-3.5" /> {post.curtidas}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {posts.length < total && (
              <div className="text-center mt-10">
                <button onClick={() => setPagina(p => p + 1)} disabled={loading}
                  className="btn-outline">
                  {loading ? 'Carregando...' : 'Ver mais posts'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
