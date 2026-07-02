import os

base = os.path.dirname(os.path.abspath(__file__))
fp = os.path.join(base, 'src', 'components', 'loja', 'ProdutoDetalhes.tsx')

conteudo = r"""'use client'
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
  const [lightboxAberto, setLightboxAberto] = useState(false)
  const [lightboxIdx, setLightboxIdx] = useState(0)
  const [zoomSrc, setZoomSrc] = useState<string | null>(null)
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
    if (temGrade && (!tamanhoSel || !corSel)) { alert('Selecione o tamanho e a cor'); return }
    adicionarItem({
      produto_id: produto.id,
      nome: produto.nome,
      preco: produto.preco_venda,
      imagem: imgs[0],
      tamanho: tamanhoSel || undefined,
      cor: corSel || undefined,
    })
  }

  const abrirLightbox = (idx: number) => { setLightboxIdx(idx); setLightboxAberto(true) }

  return (
    <>
      {/* ZOOM FLUTUANTE */}
      {zoomSrc && (
        <div className="fixed inset-0 z-40 pointer-events-none flex items-center justify-center">
          <div className="w-[75vw] h-[75vh] max-w-[900px] max-h-[900px] rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-white">
            <img src={zoomSrc} alt="" className="w-full h-full object-contain" />
          </div>
        </div>
      )}

      {/* LIGHTBOX */}
      {lightboxAberto && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onClick={() => setLightboxAberto(false)}>
          <button className="absolute top-4 right-4 text-white text-4xl hover:text-gold-400 z-10 leading-none">×</button>
          <button className="absolute left-4 top-1/2 -translate-y-1/2 text-white text-5xl hover:text-gold-400 z-10 px-4"
            onClick={e => { e.stopPropagation(); setLightboxIdx(i => Math.max(0, i - 1)) }}>‹</button>
          <img src={imgs[lightboxIdx]} alt=""
            className="max-w-[90vw] max-h-[90vh] object-contain rounded-2xl shadow-2xl"
            onClick={e => e.stopPropagation()} />
          <button className="absolute right-4 top-1/2 -translate-y-1/2 text-white text-5xl hover:text-gold-400 z-10 px-4"
            onClick={e => { e.stopPropagation(); setLightboxIdx(i => Math.min(imgs.length - 1, i + 1)) }}>›</button>
          <div className="absolute bottom-4 flex gap-2">
            {imgs.map((_, i) => (
              <button key={i} onClick={e => { e.stopPropagation(); setLightboxIdx(i) }}
                className={`h-2 rounded-full transition-all ${lightboxIdx === i ? 'bg-gold-400 w-4' : 'bg-white/50 w-2'}`} />
            ))}
          </div>
        </div>
      )}

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
              {/* Imagem principal com zoom ao hover e lightbox ao clicar */}
              <div
                className="aspect-square rounded-3xl overflow-hidden bg-gray-50 mb-3 relative group cursor-zoom-in"
                onMouseEnter={() => imgs[imgAtiva] && setZoomSrc(imgs[imgAtiva])}
                onMouseLeave={() => setZoomSrc(null)}
                onClick={() => imgs[imgAtiva] && abrirLightbox(imgAtiva)}>
                {imgs[imgAtiva] ? (
                  <img src={imgs[imgAtiva]} alt={produto.nome}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-8xl">👜</div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-end justify-center pb-3">
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 text-white text-xs px-3 py-1 rounded-full">
                    🔍 Clique para ampliar
                  </span>
                </div>
              </div>

              {/* Miniaturas com zoom ao hover e lightbox ao clicar */}
              {imgs.length > 1 && (
                <div className="flex gap-2 overflow-x-auto">
                  {imgs.map((img, i) => (
                    <button key={i}
                      onMouseEnter={() => setZoomSrc(img)}
                      onMouseLeave={() => setZoomSrc(null)}
                      onClick={() => { setImgAtiva(i); abrirLightbox(i) }}
                      className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all hover:scale-110 hover:border-gold-400 ${
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

              <div className="flex items-center gap-2 mb-4">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_,i) => <Star key={i} className="w-4 h-4 fill-gold-400 text-gold-400" />)}
                </div>
                <span className="text-sm text-gray-500">5.0</span>
              </div>

              <div className="text-3xl font-bold text-gold-600 mb-6">{fmt(produto.preco_venda)}</div>

              {(produto.descricao_site || produto.descricao) && (
                <p className="text-gray-600 text-sm leading-relaxed mb-6">
                  {produto.descricao_site || produto.descricao}
                </p>
              )}

              {tamanhos.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm font-semibold text-gray-700 mb-2">
                    Tamanho: {tamanhoSel && <span className="text-gold-600 ml-1">{tamanhoSel}</span>}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {tamanhos.map(t => (
                      <button key={t} onClick={() => { setTamanhoSel(t); setCorSel('') }}
                        className={`w-12 h-12 rounded-xl border-2 text-sm font-medium transition-all ${
                          tamanhoSel === t ? 'border-gold-500 bg-gold-50 text-gold-700' : 'border-gray-200 text-gray-600 hover:border-gold-300'
                        }`}>
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {cores.length > 0 && (
                <div className="mb-6">
                  <p className="text-sm font-semibold text-gray-700 mb-2">
                    Cor: {corSel && <span className="text-gold-600 ml-1">{corSel}</span>}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {cores.map(cor => (
                      <button key={cor} onClick={() => setCorSel(cor)}
                        className={`px-4 py-2 rounded-xl border-2 text-sm transition-all ${
                          corSel === cor ? 'border-gold-500 bg-gold-50 text-gold-700' : 'border-gray-200 text-gray-600 hover:border-gold-300'
                        }`}>
                        {cor}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <p className="text-xs text-gray-400 mb-4">
                {estoqueDisp > 0
                  ? <span className="text-green-600 font-medium">✔ {estoqueDisp} unidade(s) disponíveis</span>
                  : <span className="text-red-500">Esgotado</span>
                }
              </p>

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

              <Link href="/checkout" className="block w-full text-center btn-luxo justify-center mb-6">
                Comprar Agora
              </Link>

              <div className="border-t border-gray-100 pt-6 grid grid-cols-3 gap-4">
                {[
                  { Icon: Shield, label: 'Qualidade Garantida' },
                  { Icon: Truck, label: 'Entrega para todo Brasil' },
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
                        <p className="text-sm font-bold text-gold-600 mt-1">{fmt(p.preco_venda || 0)}</p>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </section>
          )}
        </div>
      </div>
    </>
  )
}
"""

with open(fp, 'w', encoding='utf-8', newline='\n') as f:
    f.write(conteudo)

print('OK: ProdutoDetalhes.tsx reescrito com zoom e lightbox corretos')
print()
print('Rode agora:')
print('  git add .')
print('  git commit -m "Feat: zoom flutuante e lightbox na pagina do produto"')
print('  git push')
