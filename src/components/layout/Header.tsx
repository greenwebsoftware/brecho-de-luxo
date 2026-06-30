'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Search, Menu, X, Heart, User, ChevronDown } from 'lucide-react'
import { useCarrinho } from '../../lib/carrinhoContext'
import { CATEGORIAS, buildCategorias, getCategoriaIcon, Categoria } from '../../lib/menuConfig'

// Icone de sacola estilizada
function SacolaIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 01-8 0" />
    </svg>
  )
}

interface TooltipProps {
  text: string
  children: React.ReactNode
}

function Tooltip({ text, children }: TooltipProps) {
  return (
    <div className="relative group">
      {children}
      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-luxo-900 text-white text-xs px-2 py-1 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
        {text}
        <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-luxo-900 rotate-45" />
      </div>
    </div>
  )
}

export default function Header() {
  const [menuAberto, setMenuAberto] = useState(false)
  const [freteGratis, setFreteGratis] = useState(299)
  const [scrolled, setScrolled] = useState(false)
  const [buscaAberta, setBuscaAberta] = useState(false)
  const [busca, setBusca] = useState('')
  const [categoriasMenu, setCategoriasMenu] = useState<Categoria[]>(CATEGORIAS)
  const [megaAberto, setMegaAberto] = useState<string | null>(null)
  const [mobileSubAberto, setMobileSubAberto] = useState<string | null>(null)
  const { totalItens } = useCarrinho()
  const closeTimer = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    fetch('/api/site-config', { cache: 'no-store' })
      .then(r => r.json())
      .then(d => { if (d.data?.frete_gratis_acima) setFreteGratis(Number(d.data.frete_gratis_acima)) })
      .catch(() => {})
    fetch('/api/categorias-loja')
      .then(r => r.json())
      .then(d => { if (d.data?.length) setCategoriasMenu(buildCategorias(d.data)) })
      .catch(() => {})
  }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const abrirMega = (slug: string) => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    setMegaAberto(slug)
  }
  const fecharMegaComDelay = () => {
    closeTimer.current = setTimeout(() => setMegaAberto(null), 150)
  }

  const filtroParam = (cat: typeof CATEGORIAS[0]) =>
    cat.tipo === 'marca' ? 'marca' : 'subcategoria'

  return (
    <>
      {/* TOP BAR */}
      <div className="bg-luxo-900 text-gold-300 text-xs text-center py-2 px-4">
        {`Frete grátis nas compras acima de R$${freteGratis}`} &bull; Parcele em até 6x sem juros
      </div>

      {/* HEADER PRINCIPAL */}
      <header className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white shadow-md' : 'bg-white'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16 md:h-20">

            {/* LOGO */}
            <Link href="/" className="flex items-center gap-2 flex-shrink-0">
              <img
                src="https://spdwesjpyfukmdhgiudx.supabase.co/storage/v1/object/public/imagens/logo-large.png"
                alt="Brechó de Luxo"
                className="h-14 w-auto object-contain"
                style={{ maxHeight: '56px' }}
              />
            </Link>

            {/* NAV DESKTOP COM MEGA MENU */}
            <nav className="hidden md:flex items-center gap-1 h-full">
              <Link href="/" className="text-sm font-medium text-gray-700 hover:text-gold-600 transition-colors px-3 py-2">
                Home
              </Link>
              <Link href="/loja" className="text-sm font-medium text-gray-700 hover:text-gold-600 transition-colors px-3 py-2">
                Loja
              </Link>

              {categoriasMenu.map(cat => (
                <div key={cat.slug}
                  className="relative h-full flex items-center"
                  onMouseEnter={() => abrirMega(cat.slug)}
                  onMouseLeave={fecharMegaComDelay}
                >
                  <Link href={`/loja?cat=${cat.slug}`}
                    className="text-sm font-medium text-gray-700 hover:text-gold-600 transition-colors px-3 py-2 flex items-center gap-1">
                    {cat.label}
                    <ChevronDown className="w-3.5 h-3.5" />
                  </Link>

                  {megaAberto === cat.slug && (
                    <div
                      onMouseEnter={() => abrirMega(cat.slug)}
                      onMouseLeave={fecharMegaComDelay}
                      className="absolute top-full left-1/2 -translate-x-1/2 bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 z-50"
                      style={{ minWidth: cat.tipo === 'genero' ? '560px' : '420px' }}
                    >
                      <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-l border-t border-gray-100 rotate-45" />

                      {cat.tipo === 'genero' && cat.grupos ? (
                        <div className="grid grid-cols-3 gap-6">
                          {cat.grupos.map(grupo => (
                            <div key={grupo.slug}>
                              <h4 className="text-xs font-bold text-gold-600 uppercase tracking-wide mb-3 pb-2 border-b border-gold-100">
                                {grupo.label}
                              </h4>
                              <ul className="space-y-2">
                                {grupo.itens.map(item => (
                                  <li key={item.slug}>
                                    <Link
                                      href={`/loja?cat=${cat.slug}&genero=${grupo.slug}&subcategoria=${item.slug}`}
                                      onClick={() => setMegaAberto(null)}
                                      className="text-sm text-gray-600 hover:text-gold-600 transition-colors block py-0.5"
                                    >
                                      {item.label}
                                    </Link>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div>
                          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gold-100">
                            <span className="text-xl">{getCategoriaIcon(cat.slug)}</span>
                            <h4 className="text-sm font-bold text-luxo-900">
                              {cat.tipo === 'marca' ? 'Buscar por marca' : `Todas em ${cat.label}`}
                            </h4>
                          </div>
                          <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                            {cat.itens?.map(item => (
                              <Link
                                key={item.slug}
                                href={`/loja?cat=${cat.slug}&${filtroParam(cat)}=${item.slug}`}
                                onClick={() => setMegaAberto(null)}
                                className="text-sm text-gray-600 hover:text-gold-600 transition-colors py-1"
                              >
                                {item.label}
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="mt-4 pt-3 border-t border-gray-100">
                        <Link href={`/loja?cat=${cat.slug}`} onClick={() => setMegaAberto(null)}
                          className="text-xs font-semibold text-gold-600 hover:text-gold-700">
                          Ver todos em {cat.label} →
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              <Link href="/sobre" className="text-sm font-medium text-gray-700 hover:text-gold-600 transition-colors px-3 py-2">
                Sobre
              </Link>
              <Link href="/contato" className="text-sm font-medium text-gray-700 hover:text-gold-600 transition-colors px-3 py-2">
                Contato
              </Link>
              <Link href="/blog" className="text-sm font-medium text-gray-700 hover:text-gold-600 transition-colors px-3 py-2">
                Blog
              </Link>
            </nav>

            {/* ACOES */}
            <div className="flex items-center gap-1">
              <Tooltip text="Buscar">
                <button onClick={() => setBuscaAberta(!buscaAberta)}
                  className="p-2 text-gray-600 hover:text-gold-600 transition-colors rounded-xl hover:bg-gray-50">
                  <Search className="w-5 h-5" />
                </button>
              </Tooltip>

              <Tooltip text="Favoritos">
                <Link href="/favoritos" className="p-2 text-gray-600 hover:text-gold-600 transition-colors rounded-xl hover:bg-gray-50 hidden md:block">
                  <Heart className="w-5 h-5" />
                </Link>
              </Tooltip>

              <Tooltip text="Minha Conta">
                <Link href="/conta" className="p-2 text-gray-600 hover:text-gold-600 transition-colors rounded-xl hover:bg-gray-50 hidden md:block">
                  <User className="w-5 h-5" />
                </Link>
              </Tooltip>

              <Tooltip text="Minha Sacola">
                <Link href="/checkout" className="relative p-2 text-gray-600 hover:text-gold-600 transition-colors rounded-xl hover:bg-gray-50">
                  <SacolaIcon className="w-5 h-5" />
                  {totalItens > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-gold-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                      {totalItens > 9 ? '9+' : totalItens}
                    </span>
                  )}
                </Link>
              </Tooltip>

              <button onClick={() => setMenuAberto(!menuAberto)}
                className="md:hidden p-2 text-gray-600 rounded-xl hover:bg-gray-50">
                {menuAberto ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* BARRA DE BUSCA */}
          {buscaAberta && (
            <div className="pb-3">
              <form onSubmit={e => { e.preventDefault(); window.location.href = `/loja?busca=${busca}` }}>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    autoFocus
                    value={busca}
                    onChange={e => setBusca(e.target.value)}
                    placeholder="Buscar produtos..."
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-gold-400"
                  />
                </div>
              </form>
            </div>
          )}
        </div>

        {/* MENU MOBILE */}
        {menuAberto && (
          <div className="md:hidden border-t border-gray-100 bg-white max-h-[80vh] overflow-y-auto">
            <Link href="/" onClick={() => setMenuAberto(false)}
              className="block px-6 py-3 text-sm text-gray-700 hover:bg-gold-50 border-b border-gray-50">
              Home
            </Link>
            <Link href="/loja" onClick={() => setMenuAberto(false)}
              className="block px-6 py-3 text-sm text-gray-700 hover:bg-gold-50 border-b border-gray-50">
              Loja — Tudo
            </Link>

            {categoriasMenu.map(cat => (
              <div key={cat.slug} className="border-b border-gray-50">
                <button
                  onClick={() => setMobileSubAberto(mobileSubAberto === cat.slug ? null : cat.slug)}
                  className="w-full flex items-center justify-between px-6 py-3 text-sm text-gray-700 hover:bg-gold-50"
                >
                  <span className="flex items-center gap-2">
                    <span>{getCategoriaIcon(cat.slug)}</span> {cat.label}
                  </span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${mobileSubAberto === cat.slug ? 'rotate-180' : ''}`} />
                </button>

                {mobileSubAberto === cat.slug && (
                  <div className="bg-gray-50 px-6 py-2">
                    {cat.tipo === 'genero' && cat.grupos ? (
                      cat.grupos.map(grupo => (
                        <div key={grupo.slug} className="mb-3">
                          <p className="text-xs font-bold text-gold-600 uppercase mb-1.5 mt-2">{grupo.label}</p>
                          {grupo.itens.map(item => (
                            <Link key={item.slug}
                              href={`/loja?cat=${cat.slug}&genero=${grupo.slug}&subcategoria=${item.slug}`}
                              onClick={() => setMenuAberto(false)}
                              className="block py-1.5 text-sm text-gray-600 pl-2">
                              {item.label}
                            </Link>
                          ))}
                        </div>
                      ))
                    ) : (
                      cat.itens?.map(item => (
                        <Link key={item.slug}
                          href={`/loja?cat=${cat.slug}&${filtroParam(cat)}=${item.slug}`}
                          onClick={() => setMenuAberto(false)}
                          className="block py-1.5 text-sm text-gray-600 pl-2">
                          {item.label}
                        </Link>
                      ))
                    )}
                  </div>
                )}
              </div>
            ))}

            <Link href="/sobre" onClick={() => setMenuAberto(false)}
              className="block px-6 py-3 text-sm text-gray-700 hover:bg-gold-50 border-b border-gray-50">
              Sobre
            </Link>
            <Link href="/contato" onClick={() => setMenuAberto(false)}
              className="block px-6 py-3 text-sm text-gray-700 hover:bg-gold-50 border-b border-gray-50">
              Contato
            </Link>
            <Link href="/blog" onClick={() => setMenuAberto(false)}
              className="block px-6 py-3 text-sm text-gray-700 hover:bg-gold-50 border-b border-gray-50">
              Blog
            </Link>
            <div className="flex gap-4 px-6 py-3">
              <Link href="/conta" onClick={() => setMenuAberto(false)} className="text-sm text-gray-600 flex items-center gap-1">
                <User className="w-4 h-4" /> Minha Conta
              </Link>
              <Link href="/favoritos" onClick={() => setMenuAberto(false)} className="text-sm text-gray-600 flex items-center gap-1">
                <Heart className="w-4 h-4" /> Favoritos
              </Link>
            </div>
          </div>
        )}
      </header>
    </>
  )
}
