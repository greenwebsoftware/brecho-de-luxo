'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Search, Filter, X, ShoppingBag, Heart, ChevronDown } from 'lucide-react'
import { useCarrinho } from '../../lib/carrinhoContext'

interface Produto {
  id: string
  nome: string
  preco_venda: number
  imagem_url?: string
  imagens_site?: string[]
  estoque_atual: number
  destaque: boolean
  categorias?: { nome: string }
}

export default function LojaPage() {
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState('')
  const [ordenar, setOrdenar] = useState('recentes')
  const [filtroAberto, setFiltroAberto] = useState(false)
  const [precoMax, setPrecoMax] = useState(5000)
  const [total, setTotal] = useState(0)
  const [pagina, setPagina] = useState(1)
  const { adicionarItem } = useCarrinho()

  const buscarProdutos = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        limit: '16',
        page: String(pagina),
        ...(busca && { busca }),
      })
      const res = await fetch(`/api/produtos?${params}`)
      const data = await res.json()
      if (pagina === 1) setProdutos(data.data || [])
      else setProdutos(prev => [...prev, ...(data.data || [])])
      setTotal(data.total || 0)
    } catch {}
    setLoading(false)
  }, [busca, pagina])

  useEffect(() => {
    setPagina(1)
    buscarProdutos()
  }, [busca])

  useEffect(() => {
    buscarProdutos()
  }, [pagina])

  const ordenados = [...produtos].sort((a, b) => {
    if (ordenar === 'menor') return a.preco_venda - b.preco_venda
    if (ordenar === 'maior') return b.preco_venda - a.preco_venda
    return 0
  }).filter(p => p.preco_venda <= precoMax)

  const fmt = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER DA LOJA */}
      <div className="bg-gradient-to-r from-luxo-900 to-luxo-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="font-serif text-white text-4xl font-bold mb-3">Nossa Colecao</h1>
          <p className="text-gold-300 text-sm">
            {total > 0 ? `${total} pecas disponíveis` : 'Carregando...'}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* BARRA DE FILTROS */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          {/* BUSCA */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={busca}
              onChange={e => setBusca(e.target.value)}
              placeholder="Buscar pecas..."
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-white text-sm outline-none focus:border-gold-400 focus:ring-2 focus:ring-gold-100"
            />
            {busca && (
              <button onClick={() => setBusca('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                <X className="w-4 h-4 text-gray-400" />
              </button>
            )}
          </div>

          {/* ORDENAR */}
          <div className="relative">
            <select
              value={ordenar}
              onChange={e => setOrdenar(e.target.value)}
              className="appearance-none bg-white border border-gray-200 rounded-xl px-4 py-3 pr-10 text-sm outline-none focus:border-gold-400 cursor-pointer"
            >
              <option value="recentes">Mais Recentes</option>
              <option value="menor">Menor Preco</option>
              <option value="maior">Maior Preco</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          {/* FILTRO */}
          <button
            onClick={() => setFiltroAberto(!filtroAberto)}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-colors ${
              filtroAberto ? 'bg-gold-500 border-gold-500 text-white' : 'bg-white border-gray-200 text-gray-700'
            }`}
          >
            <Filter className="w-4 h-4" /> Filtros
          </button>
        </div>

        {/* PAINEL FILTROS */}
        {filtroAberto && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800">Filtrar por preco</h3>
              <button onClick={() => setPrecoMax(5000)} className="text-xs text-gold-600 hover:underline">
                Limpar filtros
              </button>
            </div>
            <div>
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Ate: <strong className="text-gold-600">{fmt(precoMax)}</strong></span>
              </div>
              <input
                type="range" min={50} max={5000} step={50}
                value={precoMax}
                onChange={e => setPrecoMax(Number(e.target.value))}
                className="w-full accent-gold-500"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>R$ 50</span>
                <span>R$ 5.000</span>
              </div>
            </div>
          </div>
        )}

        {/* GRID DE PRODUTOS */}
        {loading && produtos.length === 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array(8).fill(0).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse">
                <div className="aspect-square bg-gray-100" />
                <div className="p-3 space-y-2">
                  <div className="h-3 bg-gray-100 rounded w-3/4" />
                  <div className="h-4 bg-gray-100 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : ordenados.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="font-serif text-xl text-gray-700 mb-2">Nenhuma peca encontrada</h3>
            <p className="text-gray-400 text-sm mb-6">Tente buscar por outro termo</p>
            <button onClick={() => { setBusca(''); setPrecoMax(5000) }} className="btn-gold text-sm">
              Ver todas as pecas
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {ordenados.map(p => {
              const imgs = p.imagens_site as string[] | null
              const img = imgs?.[0] || p.imagem_url
              return (
                <div key={p.id} className="produto-card group">
                  <Link href={`/loja/${p.id}`}>
                    <div className="relative aspect-square overflow-hidden bg-gray-50">
                      {img ? (
                        <img src={img} alt={p.nome}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-5xl bg-gradient-to-br from-gold-50 to-gold-100">
                          👜
                        </div>
                      )}
                      {p.destaque && (
                        <span className="absolute top-2 left-2 badge-destaque">Destaque</span>
                      )}
                      <button
                        onClick={e => { e.preventDefault(); /* favoritar */ }}
                        className="absolute top-2 right-2 w-8 h-8 bg-white rounded-full shadow flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50"
                      >
                        <Heart className="w-4 h-4 text-gray-400 hover:text-red-400" />
                      </button>
                    </div>
                  </Link>
                  <div className="p-3">
                    <Link href={`/loja/${p.id}`}>
                      <h3 className="text-sm font-medium text-gray-800 truncate hover:text-gold-600 transition-colors">
                        {p.nome}
                      </h3>
                    </Link>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-base font-bold text-gold-600">{fmt(p.preco_venda)}</span>
                      <button
                        onClick={() => adicionarItem({
                          produto_id: p.id,
                          nome: p.nome,
                          preco: p.preco_venda,
                          imagem: img,
                        })}
                        className="w-8 h-8 bg-gold-500 hover:bg-gold-600 text-white rounded-full flex items-center justify-center transition-colors"
                        title="Adicionar ao carrinho"
                      >
                        <ShoppingBag className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* CARREGAR MAIS */}
        {produtos.length < total && (
          <div className="text-center mt-10">
            <button
              onClick={() => setPagina(p => p + 1)}
              disabled={loading}
              className="btn-outline"
            >
              {loading ? 'Carregando...' : 'Carregar mais pecas'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
