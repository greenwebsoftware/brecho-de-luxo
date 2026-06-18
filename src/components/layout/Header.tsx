'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { ShoppingBag, Search, Menu, X, Heart, User, ChevronDown } from 'lucide-react'
import { useCarrinho } from '../../lib/carrinhoContext'
import { CATEGORIAS, getCategoriaIcon } from '../../lib/menuConfig'

export default function Header() {
  const [menuAberto, setMenuAberto] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [buscaAberta, setBuscaAberta] = useState(false)
  const [busca, setBusca] = useState('')
  const [megaAberto, setMegaAberto] = useState<string | null>(null)
  const [mobileSubAberto, setMobileSubAberto] = useState<string | null>(null)
  const { totalItens } = useCarrinho()
  const closeTimer = useRef<NodeJS.Timeout | null>(null)

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
    cat.tipo === 'marca' ? 'marca' : cat.tipo === 'genero' ? 'subcategoria' : 'subcategoria'

  return (
    <>
      {/* TOP BAR */}
      <div className="bg-luxo-900 text-gold-300 text-xs text-center py-2 px-4">
        Frete grátis nas compras acima de R$299 &bull; Parcele em até 6x sem juros
      </div>

      {/* HEADER PRINCIPAL */}
      <header className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white shadow-md' : 'bg-white'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16 md:h-20">

            {/* LOGO */}
            <Link href="/" className="flex items-center gap-2 flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center">
                <span className="text-white font-bold text-lg font-serif">B</span>
              </div>
              <div>
                <div className="font-serif font-bold text-luxo-900 text-lg leading-tight">Brechó de Luxo</div>
                <div className="text-gold-500 text-[10px] tracking-widest uppercase">Moda Premium</div>
              </div>
            </Link>

            {/* NAV DESKTOP COM MEGA MENU */}
            <nav className="hidden md:flex items-center gap-1 h-full">
              <Link href="/" className="text-sm font-medium text-gray-700 hover:text-gold-600 transition-colors px-3 py-2">
                Home
              </Link>
              <Link href="/loja" className="text-sm font-medium text-gray-700 hover:text-gold-600 transition-colors px-3 py-2">
                Loja
              </Link>

              {CATEGORIAS.map(cat => (
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

                  {/* MEGA MENU DROPDOWN */}
                  {megaAberto === cat.slug && (
                    <div
                      onMouseEnter={() => abrirMega(cat.slug)}
                      onMouseLeave={fecharMegaComDelay}
                      className="absolute top-full left-1/2 -translate-x-1/2 bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 z-50"
                      style={{ minWidth: cat.tipo === 'genero' ? '560px' : '420px' }}
                    >
                      {/* SETA DO DROPDOWN */}
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
            </nav>

            {/* ACOES */}
            <div className="flex items-center gap-3">
              <button onClick={() => setBuscaAberta(!buscaAberta)}
                className="p-2 text-gray-600 hover:text-gold-600 transition-colors">
                <Search className="w-5 h-5" />
              </button>

              <Link href="/favoritos" className="p-2 text-gray-600 hover:text-gold-600 transition-colors hidden md:block">
                <Heart className="w-5 h-5" />
              </Link>

              <Link href="/conta" className="p-2 text-gray-600 hover:text-gold-600 transition-colors hidden md:block">
                <User className="w-5 h-5" />
              </Link>

              <Link href="/checkout" className="relative p-2 text-gray-600 hover:text-gold-600 transition-colors">
                <ShoppingBag className="w-5 h-5" />
                {totalItens > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-gold-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {totalItens > 9 ? '9+' : totalItens}
                  </span>
                )}
              </Link>

              <button onClick={() => setMenuAberto(!menuAberto)}
                className="md:hidden p-2 text-gray-600">
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

        {/* MENU MOBILE COM ACCORDION */}
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

            {CATEGORIAS.map(cat => (
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
            <div className="flex gap-4 px-6 py-3">
              <Link href="/conta" className="text-sm text-gray-600 flex items-center gap-1">
                <User className="w-4 h-4" />Minha Conta
              </Link>
              <Link href="/favoritos" className="text-sm text-gray-600 flex items-center gap-1">
                <Heart className="w-4 h-4" />Favoritos
              </Link>
            </div>
          </div>
        )}
      </header>
    </>
  )
}
