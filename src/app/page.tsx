import Link from 'next/link'
import { ArrowRight, Shield, Truck, RefreshCw, Star } from 'lucide-react'
import { createServerClient } from '../lib/supabase-server'

async function getProdutosDestaque() {
  try {
    const supabase = createServerClient()
    const { data } = await supabase
      .from('produtos')
      .select('id, nome, preco_venda, imagem_url, imagens_site, estoque_atual, destaque, criado_em')
      .eq('ativo', true)
      .eq('visivel_site', true)
      .gt('estoque_atual', 0)
      .order('criado_em', { ascending: false })
      .limit(8)
    return data || []
  } catch { return [] }
}

async function getCategorias() {
  try {
    const supabase = createServerClient()
    const { data } = await supabase
      .from('categorias')
      .select('id, nome')
      .eq('ativo', true)
      .limit(6)
    return data || []
  } catch { return [] }
}

export default async function HomePage() {
  const [produtos, categorias] = await Promise.all([
    getProdutosDestaque(),
    getCategorias(),
  ])

  const diferenciais = [
    { icon: Shield, titulo: 'Autenticidade Garantida', desc: 'Todas as peças são verificadas e certificadas' },
    { icon: Truck, titulo: 'Entrega para Todo Brasil', desc: 'Frete grátis acima de R$299' },
    { icon: RefreshCw, titulo: 'Troca Facilitada', desc: '7 dias para troca sem burocracia' },
    { icon: Star, titulo: 'Peças Únicas', desc: 'Coleção exclusiva e curada com cuidado' },
  ]

  return (
    <>
      {/* HERO */}
      <section className="relative bg-gradient-to-br from-luxo-900 via-luxo-800 to-luxo-900 min-h-[85vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 rounded-full bg-gold-400 blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-gold-500 blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-gold-500/20 border border-gold-500/30 rounded-full px-4 py-1.5 mb-6">
              <span className="w-2 h-2 rounded-full bg-gold-400 animate-pulse" />
              <span className="text-gold-300 text-sm font-medium">Nova coleção disponível</span>
            </div>
            <h1 className="font-serif text-white text-5xl md:text-6xl font-bold leading-tight mb-6">
              Moda de Luxo<br />
              <span className="text-gold-400">com História</span>
            </h1>
            <p className="text-gray-300 text-lg leading-relaxed mb-8 max-w-md">
              Peças autênticas de marcas premium cuidadosamente selecionadas. Qualidade garantida, preço acessível.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/loja" className="btn-gold text-base">
                Ver Coleção <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="/sobre" className="btn-outline border-gold-400 text-gold-300 hover:bg-gold-500 hover:text-white text-base">
                Nossa História
              </Link>
            </div>
            <div className="flex items-center gap-6 mt-10">
              <div className="text-center">
                <div className="text-2xl font-bold text-gold-400">500+</div>
                <div className="text-xs text-gray-400">Peças disponíveis</div>
              </div>
              <div className="w-px h-10 bg-white/20" />
              <div className="text-center">
                <div className="text-2xl font-bold text-gold-400">4.9</div>
                <div className="text-xs text-gray-400">Avaliação média</div>
              </div>
              <div className="w-px h-10 bg-white/20" />
              <div className="text-center">
                <div className="text-2xl font-bold text-gold-400">2k+</div>
                <div className="text-xs text-gray-400">Clientes felizes</div>
              </div>
            </div>
          </div>
          <div className="hidden md:flex items-center justify-center">
            <div className="relative">
              <div className="w-80 h-96 bg-gradient-to-br from-gold-200 to-gold-400 rounded-3xl flex items-center justify-center text-8xl shadow-2xl">
                👜
              </div>
              <div className="absolute -top-4 -left-8 bg-white rounded-2xl shadow-xl p-3 flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-sm">✓</div>
                <div>
                  <div className="text-xs font-bold text-gray-800">Autenticidade</div>
                  <div className="text-[10px] text-gray-500">Certificada</div>
                </div>
              </div>
              <div className="absolute -bottom-4 -right-8 bg-white rounded-2xl shadow-xl p-3">
                <div className="text-xs font-bold text-gray-800">Frete Grátis</div>
                <div className="text-[10px] text-gray-500">acima de R$299</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORIAS */}
      {categorias.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
          <div className="text-center mb-10">
            <h2 className="font-serif text-3xl font-bold text-luxo-900 mb-2">Explore por Categoria</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {categorias.map(cat => (
              <Link key={cat.id} href={`/loja?cat=${cat.nome.toLowerCase()}`}
                className="group text-center p-4 rounded-2xl border border-gray-100 hover:border-gold-300 hover:shadow-md transition-all">
                <div className="text-4xl mb-2 group-hover:scale-110 transition-transform">
                  {cat.nome.toLowerCase().includes('bolsa') ? '👜' :
                   cat.nome.toLowerCase().includes('roupa') ? '👗' :
                   cat.nome.toLowerCase().includes('sapato') ? '👠' :
                   cat.nome.toLowerCase().includes('acessorio') ? '💍' : '✨'}
                </div>
                <div className="text-sm font-medium text-gray-700 group-hover:text-gold-600">{cat.nome}</div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* PRODUTOS EM DESTAQUE */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="font-serif text-3xl font-bold text-luxo-900">Chegadas Recentes</h2>
              <p className="text-gray-500 mt-1">Peças exclusivas para você</p>
            </div>
            <Link href="/loja" className="btn-outline text-sm hidden md:flex">
              Ver tudo <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {produtos.length === 0 ? (
              Array(8).fill(0).map((_, i) => (
                <div key={i} className="produto-card">
                  <div className="aspect-square bg-gradient-to-br from-gold-50 to-gold-100 flex items-center justify-center text-5xl">
                    {['👜','👗','💍','🕶️','👠','🧣','⌚','👒'][i]}
                  </div>
                  <div className="p-3">
                    <div className="h-3 bg-gray-100 rounded w-3/4 mb-2" />
                    <div className="h-4 bg-gold-100 rounded w-1/2" />
                  </div>
                </div>
              ))
            ) : produtos.map((p: {id: string; nome: string; preco_venda: number; imagem_url?: string; imagens_site?: string[]; estoque_atual: number; destaque: boolean}) => {
              const imgs = p.imagens_site as string[] | null
              const img = imgs?.[0] || p.imagem_url
              return (
                <Link key={p.id} href={`/loja/${p.id}`} className="produto-card">
                  <div className="relative aspect-square overflow-hidden bg-gray-50">
                    {img ? (
                      <img src={img} alt={p.nome} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-5xl bg-gradient-to-br from-gold-50 to-gold-100">👜</div>
                    )}
                    {p.destaque && <span className="absolute top-2 left-2 badge-destaque">Destaque</span>}
                  </div>
                  <div className="p-3">
                    <h3 className="text-sm font-medium text-gray-800 truncate">{p.nome}</h3>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-base font-bold text-gold-600">
                        {new Intl.NumberFormat('pt-BR', { style:'currency', currency:'BRL' }).format(p.preco_venda)}
                      </span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
          <div className="text-center mt-8 md:hidden">
            <Link href="/loja" className="btn-gold">Ver todos os produtos</Link>
          </div>
        </div>
      </section>

      {/* BANNER */}
      <section className="bg-gradient-to-r from-gold-500 to-gold-600 py-14">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="font-serif text-white text-3xl md:text-4xl font-bold mb-4">Peças únicas que contam histórias</h2>
          <p className="text-gold-100 text-lg mb-8">Cada peça é selecionada com carinho para garantir qualidade e autenticidade.</p>
          <Link href="/sobre" className="bg-white text-gold-700 font-semibold px-8 py-3 rounded-full hover:bg-gold-50 transition-colors inline-flex items-center gap-2">
            Conheça nossa história <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* DIFERENCIAIS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {diferenciais.map((d, i) => (
            <div key={i} className="text-center p-6 rounded-2xl hover:shadow-md transition-all group">
              <div className="w-14 h-14 rounded-full bg-gold-50 group-hover:bg-gold-100 flex items-center justify-center mx-auto mb-4 transition-colors">
                <d.icon className="w-7 h-7 text-gold-600" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2 text-sm">{d.titulo}</h3>
              <p className="text-gray-500 text-xs leading-relaxed">{d.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* DEPOIMENTOS */}
      <section className="bg-luxo-900 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <h2 className="font-serif text-3xl font-bold text-white mb-2">O que dizem nossos clientes</h2>
            <div className="flex justify-center gap-1 mt-2">
              {[...Array(5)].map((_,i) => <Star key={i} className="w-5 h-5 fill-gold-400 text-gold-400" />)}
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { nome: 'Ana C.', texto: 'Comprei uma bolsa incrível! Autenticidade verificada e entrega rápida.', nota: 5 },
              { nome: 'Patrícia M.', texto: 'Atendimento excelente! Qualidade acima da esperada para o preço.', nota: 5 },
              { nome: 'Fernanda S.', texto: 'Site fácil de navegar e produto chegou exatamente como mostrado.', nota: 5 },
            ].map((dep, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <div className="flex gap-1 mb-3">
                  {[...Array(dep.nota)].map((_,j) => <Star key={j} className="w-4 h-4 fill-gold-400 text-gold-400" />)}
                </div>
                <p className="text-gray-300 text-sm leading-relaxed mb-4">"{dep.texto}"</p>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gold-500 flex items-center justify-center text-sm font-bold text-white">
                    {dep.nome[0]}
                  </div>
                  <span className="text-white font-medium text-sm">{dep.nome}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
