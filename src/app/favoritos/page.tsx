'use client'
import { useState, useEffect } from 'react'
import { Heart, ShoppingBag, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useCarrinho } from '../../lib/carrinhoContext'
import toast from 'react-hot-toast'

interface Produto {
  id: string
  nome: string
  preco_venda: number
  imagem_url?: string
  imagens_site?: string[]
}

export default function FavoritosPage() {
  const [favoritos, setFavoritos] = useState<Produto[]>([])
  const { adicionarItem } = useCarrinho()

  useEffect(() => {
    // Favoritos salvos no localStorage
    const saved = localStorage.getItem('brecho_favoritos')
    if (saved) {
      try { setFavoritos(JSON.parse(saved)) } catch {}
    }
  }, [])

  const remover = (id: string) => {
    const novos = favoritos.filter(f => f.id !== id)
    setFavoritos(novos)
    localStorage.setItem('brecho_favoritos', JSON.stringify(novos))
    toast.success('Removido dos favoritos')
  }

  const fmt = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-br from-luxo-900 to-luxo-800 py-12">
        <div className="max-w-6xl mx-auto px-4">
          <Link href="/conta" className="text-gold-300 hover:text-white text-sm transition-colors">
            ← Minha Conta
          </Link>
          <h1 className="font-serif text-white text-4xl font-bold mt-3">Meus Favoritos</h1>
          <p className="text-gold-300 text-sm mt-1">{favoritos.length} peças salvas</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-10">
        {favoritos.length === 0 ? (
          <div className="text-center py-20">
            <Heart className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <h2 className="font-serif text-2xl text-gray-600 mb-2">Nenhum favorito ainda</h2>
            <p className="text-gray-400 mb-6">Salve as peças que você mais gostou!</p>
            <Link href="/loja" className="btn-gold">Explorar a Coleção</Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {favoritos.map(p => {
              const imgs = p.imagens_site as string[] | null
              const img = imgs?.[0] || p.imagem_url
              return (
                <div key={p.id} className="produto-card group">
                  <Link href={`/loja/${p.id}`}>
                    <div className="relative aspect-square overflow-hidden bg-gray-50">
                      {img
                        ? <img src={img} alt={p.nome} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        : <div className="w-full h-full flex items-center justify-center text-5xl">👜</div>
                      }
                      <button onClick={e => { e.preventDefault(); remover(p.id) }}
                        className="absolute top-2 right-2 w-8 h-8 bg-white rounded-full shadow flex items-center justify-center hover:bg-red-50 transition-colors">
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  </Link>
                  <div className="p-3">
                    <Link href={`/loja/${p.id}`}>
                      <h3 className="text-sm font-medium text-gray-800 truncate hover:text-gold-600">{p.nome}</h3>
                    </Link>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-base font-bold text-gold-600">{fmt(p.preco_venda)}</span>
                      <button
                        onClick={() => {
                          adicionarItem({ produto_id: p.id, nome: p.nome, preco: p.preco_venda, imagem: img })
                          toast.success('Adicionado ao carrinho!')
                        }}
                        className="w-8 h-8 bg-gold-500 hover:bg-gold-600 text-white rounded-full flex items-center justify-center transition-colors">
                        <ShoppingBag className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
