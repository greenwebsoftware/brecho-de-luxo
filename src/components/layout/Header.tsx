'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ShoppingBag, Search, Menu, X, Heart, User } from 'lucide-react'
import { useCarrinho } from '../../lib/carrinhoContext'

export default function Header() {
  const [menuAberto, setMenuAberto] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [buscaAberta, setBuscaAberta] = useState(false)
  const [busca, setBusca] = useState('')
  const { totalItens } = useCarrinho()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/loja', label: 'Loja' },
    { href: '/loja?cat=bolsas', label: 'Bolsas' },
    { href: '/loja?cat=roupas', label: 'Roupas' },
    { href: '/loja?cat=acessorios', label: 'Acessorios' },
    { href: '/sobre', label: 'Sobre' },
    { href: '/contato', label: 'Contato' },
  ]

  return (
    <>
      {/* TOP BAR */}
      <div className="bg-luxo-900 text-gold-300 text-xs text-center py-2 px-4">
        Frete gratis nas compras acima de R$299 &bull; Parcele em ate 6x sem juros
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
                <div className="font-serif font-bold text-luxo-900 text-lg leading-tight">Brecho de Luxo</div>
                <div className="text-gold-500 text-[10px] tracking-widest uppercase">Moda Premium</div>
              </div>
            </Link>

            {/* NAV DESKTOP */}
            <nav className="hidden md:flex items-center gap-6">
              {navLinks.map(l => (
                <Link key={l.href} href={l.href}
                  className="text-sm font-medium text-gray-700 hover:text-gold-600 transition-colors">
                  {l.label}
                </Link>
              ))}
            </nav>

            {/* ACOES */}
            <div className="flex items-center gap-3">
              {/* BUSCA */}
              <button onClick={() => setBuscaAberta(!buscaAberta)}
                className="p-2 text-gray-600 hover:text-gold-600 transition-colors">
                <Search className="w-5 h-5" />
              </button>

              {/* FAVORITOS */}
              <Link href="/favoritos" className="p-2 text-gray-600 hover:text-gold-600 transition-colors hidden md:block">
                <Heart className="w-5 h-5" />
              </Link>

              {/* CONTA */}
              <Link href="/conta" className="p-2 text-gray-600 hover:text-gold-600 transition-colors hidden md:block">
                <User className="w-5 h-5" />
              </Link>

              {/* CARRINHO */}
              <Link href="/checkout" className="relative p-2 text-gray-600 hover:text-gold-600 transition-colors">
                <ShoppingBag className="w-5 h-5" />
                {totalItens > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-gold-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {totalItens > 9 ? '9+' : totalItens}
                  </span>
                )}
              </Link>

              {/* MENU MOBILE */}
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

        {/* MENU MOBILE */}
        {menuAberto && (
          <div className="md:hidden border-t border-gray-100 bg-white">
            {navLinks.map(l => (
              <Link key={l.href} href={l.href}
                onClick={() => setMenuAberto(false)}
                className="block px-6 py-3 text-sm text-gray-700 hover:bg-gold-50 hover:text-gold-700 border-b border-gray-50">
                {l.label}
              </Link>
            ))}
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
