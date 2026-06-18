'use client'
import { useState } from 'react'
import Link from 'next/link'
import { ShoppingBag, Heart, ArrowLeft, Shield, Truck, RefreshCw, Star } from 'lucide-react'
import { useCarrinho } from '../../lib/carrinhoContext'

interface Grade { tamanho: string; cor: string; estoque: number }
interface Produto {
  id: string; nome: string; preco_venda: number; preco_custo?: number
  descricao?: string; descricao_site?: string; imagem_url?: string
  imagens_site?: string[]; estoque_atual: number; destaque: boolean
  categorias?: { nome: string }; grade_tamanhos?: Grade[]
}

export default function ProdutoDetalhes({ produto, relacionados }: {
  produto: Produto
  relacionados: Partial<Produto>[]
}) {
  const [imgAtiva, setImgAtiva] = useState(0)
  const [tamanhoSel, setTamanhoSel] = useState('')
  const [corSel, setCorSel] = useState('')
  const { adicionarItem } = useCarrinho()

  const imgs = (produto.imagens_site as string[] | null) || (produto.imagem_url ? [produto.imagem_url] : [])
  const fmt = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
  const temGrade = produto.grade_tamanhos && produto.grade_tamanhos.length > 0

  const tamanhos = [...new Set(produto.grade_tamanhos?.map(g => g.tamanho) || [])]
  const cores = [...new Set(produto.grade_tamanhos?.filter(g => !tamanhoSel || g.tamanho === tamanhoSel).map(g => g.cor) || [])]

  const estoqueDisp = temGrade
    ? produto.grade_tamanhos?.find(g => g.tamanho === tamanhoSel && g.cor === corSel)?.estoque || 0
    : produto.estoque_atual

  const handleComprar = () => {
    if (temGrade && (!tamanhoSel || !corSel)) {
      alert('Selecione o tamanho e a cor')
      return
    }
    adicionarItem({
      produto_id: produto.id,
      nome: produto.nome,
      preco: produto.preco_venda,
      imagem: imgs[0],
      tamanho: tamanhoSel || undefined,
      cor: corSel || undefined,
    })
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

        {/* BREADCRUMB */}
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
          <Link href="/loja" className="flex items-center gap-1 hover:text-gold-600 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Voltar
          </Link>
          <span>/</span>
          <span className="text-gray-500">{produto.categorias?.nome || 'Loja'}</span>
          <span>/</span>
          <span className="text-gray-800 truncate max-w-48">{produto.nome}</span>
        </div>

        <div className="grid md:grid-cols-2 gap-10 lg:gap-16">
          {/* GALERIA */}
          <div>
            <div className="aspect-square rounded-3xl overflow-hidden bg-gray-50 mb-3">
              {imgs[imgAtiva] ? (
                <img src={imgs[imgAtiva]} alt={produto.nome}
                  className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-8xl">👜</div>
              )}
            </div>
            {imgs.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {imgs.map((img, i) => (
                  <button key={i} onClick={() => setImgAtiva(i)}
                    className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-colors ${
                      imgAtiva === i ? 'border-gold-500' : 'border-gray-100'
                    }`}>
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* DETALHES */}
          <div>
            {produto.destaque && <span className="badge-destaque mb-3 inline-block">Destaque</span>}
            {produto.categorias && (
              <span className="text-xs text-gold-600 font-medium uppercase tracking-wide">
                {produto.categorias.nome}
              </span>
            )}
            <h1 className="font-serif text-3xl font-bold text-luxo-900 mt-2 mb-3">{produto.nome}</h1>

            {/* AVALIACAO */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex gap-0.5">
                {[...Array(5)].map((_,i) => <Star key={i} className="w-4 h-4 fill-gold-400 text-gold-400" />)}
              </div>
              <span className="text-sm text-gray-500">5.0 (12 avaliações)</span>
            </div>

            <div className="text-3xl font-bold text-gold-600 mb-6">{fmt(produto.preco_venda)}</div>

            {/* DESCRICAO */}
            {(produto.descricao_site || produto.descricao) && (
              <p className="text-gray-600 text-sm leading-relaxed mb-6">
                {produto.descricao_site || produto.descricao}
              </p>
            )}

            {/* GRADE - TAMANHO */}
            {tamanhos.length > 0 && (
              <div className="mb-4">
                <p className="text-sm font-semibold text-gray-700 mb-2">
                  Tamanho: {tamanhoSel && <span className="text-gold-600 ml-1">{tamanhoSel}</span>}
                </p>
                <div className="flex flex-wrap gap-2">
                  {tamanhos.map(t => (
                    <button key={t} onClick={() => { setTamanhoSel(t); setCorSel('') }}
                      className={`w-12 h-12 rounded-xl border-2 text-sm font-medium transition-all ${
                        tamanhoSel === t
                          ? 'border-gold-500 bg-gold-50 text-gold-700'
                          : 'border-gray-200 text-gray-600 hover:border-gold-300'
                      }`}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* GRADE - COR */}
            {cores.length > 0 && (
              <div className="mb-6">
                <p className="text-sm font-semibold text-gray-700 mb-2">
                  Cor: {corSel && <span className="text-gold-600 ml-1">{corSel}</span>}
                </p>
                <div className="flex flex-wrap gap-2">
                  {cores.map(c => (
                    <button key={c} onClick={() => setCorSel(c)}
                      className={`px-4 py-2 rounded-xl border-2 text-sm transition-all ${
                        corSel === c
                          ? 'border-gold-500 bg-gold-50 text-gold-700'
                          : 'border-gray-200 text-gray-600 hover:border-gold-300'
                      }`}>
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ESTOQUE */}
            <p className="text-xs text-gray-400 mb-4">
              {estoqueDisp > 0
                ? <span className="text-green-600 font-medium">✓ {estoqueDisp} unidade(s) disponíveis</span>
                : <span className="text-red-500">Esgotado</span>
              }
            </p>

            {/* BOTOES */}
            <div className="flex gap-3 mb-6">
              <button onClick={handleComprar} disabled={estoqueDisp === 0}
                className="flex-1 btn-gold justify-center disabled:opacity-50 disabled:cursor-not-allowed">
                <ShoppingBag className="w-5 h-5" />
                Adicionar ao Carrinho
              </button>
              <button className="w-12 h-12 border-2 border-gray-200 rounded-full flex items-center justify-center hover:border-red-300 hover:bg-red-50 transition-colors">
                <Heart className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <Link href="/checkout"
              className="block w-full text-center btn-luxo justify-center mb-6">
              Comprar Agora
            </Link>

            {/* GARANTIAS */}
            <div className="border-t border-gray-100 pt-6 grid grid-cols-3 gap-4">
              {[
                { Icon: Shield, label: 'Autenticidade Garantida' },
                { Icon: Truck, label: 'Frete Grátis acima R$299' },
                { Icon: RefreshCw, label: 'Troca em 7 dias' },
              ].map(({ Icon, label }) => (
                <div key={label} className="text-center">
                  <div className="w-10 h-10 rounded-full bg-gold-50 flex items-center justify-center mx-auto mb-2">
                    <Icon className="w-5 h-5 text-gold-600" />
                  </div>
                  <p className="text-xs text-gray-500 leading-tight">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* PRODUTOS RELACIONADOS */}
        {relacionados.length > 0 && (
          <section className="mt-16">
            <h2 className="font-serif text-2xl font-bold text-luxo-900 mb-6">Você também pode gostar</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {relacionados.map(p => {
                const imgs2 = p.imagens_site as string[] | null
                const img2 = imgs2?.[0] || p.imagem_url
                return (
                  <Link key={p.id} href={`/loja/${p.id}`} className="produto-card">
                    <div className="aspect-square overflow-hidden bg-gray-50">
                      {img2
                        ? <img src={img2} alt={p.nome} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        : <div className="w-full h-full flex items-center justify-center text-4xl">👜</div>
                      }
                    </div>
                    <div className="p-3">
                      <p className="text-sm font-medium text-gray-800 truncate">{p.nome}</p>
                      <p className="text-sm font-bold text-gold-600 mt-1">
                        {fmt(p.preco_venda || 0)}
                      </p>
                    </div>
                  </Link>
                )
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
