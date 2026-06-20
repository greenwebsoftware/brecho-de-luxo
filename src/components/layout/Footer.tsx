'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Instagram, Facebook, Mail, Phone, MapPin } from 'lucide-react'

interface SiteConfig {
  whatsapp?: string
  instagram?: string
  facebook?: string
  tiktok?: string
  email_contato?: string
}

export default function Footer() {
  const [email, setEmail] = useState('')
  const [config, setConfig] = useState<SiteConfig>({})

  useEffect(() => {
    fetch('/api/site-config', { cache: 'no-store' })
      .then(res => res.json())
      .then(data => setConfig(data.data || {}))
      .catch(() => {})
  }, [])

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault()
    setEmail('')
    alert('Inscrito com sucesso!')
  }

  const waNumero = config.whatsapp || '5511900000000'
  const waLink = `https://wa.me/${waNumero}`
  const igLink = `https://instagram.com/${config.instagram || 'brechodeluxo'}`
  const fbLink = `https://facebook.com/${config.facebook || 'brechodeluxo'}`
  const emailFinal = config.email_contato || 'contato@brechodeluxo.com.br'
  const telExibido = waNumero.length >= 12
    ? `(${waNumero.slice(2,4)}) 9-${waNumero.slice(5,9)}-${waNumero.slice(9)}`
    : '(11) 9-0000-0000'

  return (
    <footer className="bg-luxo-900 text-gray-300">
      <div className="bg-gradient-to-r from-gold-600 to-gold-500">
        <div className="max-w-7xl mx-auto px-4 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="font-serif text-white text-xl font-bold">Fique por dentro das novidades</h3>
            <p className="text-gold-100 text-sm mt-1">Receba em primeira mão as novas chegadas e ofertas exclusivas</p>
          </div>
          <form onSubmit={handleNewsletter} className="flex gap-2 w-full md:w-auto">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Seu melhor e-mail"
              className="flex-1 md:w-72 px-4 py-3 rounded-full text-sm text-gray-800 outline-none"
            />
            <button type="submit"
              className="bg-luxo-900 text-white px-6 py-3 rounded-full text-sm font-semibold hover:bg-luxo-800 transition-colors whitespace-nowrap">
              Quero receber
            </button>
          </form>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-14 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div className="col-span-2 md:col-span-1">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-gold-500 flex items-center justify-center">
              <span className="text-white font-bold font-serif">B</span>
            </div>
            <span className="font-serif font-bold text-white text-lg">Brechó de Luxo</span>
          </div>
          <p className="text-sm text-gray-400 leading-relaxed mb-4">
            Peças de moda de luxo cuidadosamente selecionadas com qualidade garantida.
          </p>
          <div className="flex gap-3">
            <a href={igLink} target="_blank" rel="noreferrer"
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-gold-500 flex items-center justify-center transition-colors">
              <Instagram className="w-4 h-4" />
            </a>
            <a href={fbLink} target="_blank" rel="noreferrer"
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-gold-500 flex items-center justify-center transition-colors">
              <Facebook className="w-4 h-4" />
            </a>
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wide">Loja</h4>
          <ul className="space-y-2 text-sm">
            {[['Todas as Peças', '/loja'], ['Bolsas', '/loja?cat=bolsas'],
              ['Roupas', '/loja?cat=roupas'], ['Acessórios', '/loja?cat=acessorios'],
              ['Lançamentos', '/loja?novidades=1'], ['Ofertas', '/loja?oferta=1']].map(([l, h]) => (
              <li key={h}>
                <Link href={h} className="text-gray-400 hover:text-gold-400 transition-colors">{l}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wide">Ajuda</h4>
          <ul className="space-y-2 text-sm">
            {[['Sobre Nós', '/sobre'], ['Contato', '/contato'],
              ['Trocas', '/trocas'], ['Minha Conta', '/conta'],
              ['Meus Pedidos', '/pedidos']].map(([l, h]) => (
              <li key={h}>
                <Link href={h} className="text-gray-400 hover:text-gold-400 transition-colors">{l}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wide">Contato</h4>
          <ul className="space-y-3 text-sm">
            <li className="flex items-center gap-2 text-gray-400">
              <Phone className="w-4 h-4 text-gold-400 flex-shrink-0" />
              <a href={waLink} className="hover:text-gold-400 transition-colors">
                {telExibido}
              </a>
            </li>
            <li className="flex items-center gap-2 text-gray-400">
              <Mail className="w-4 h-4 text-gold-400 flex-shrink-0" />
              <span>{emailFinal}</span>
            </li>
            <li className="flex items-start gap-2 text-gray-400">
              <MapPin className="w-4 h-4 text-gold-400 flex-shrink-0 mt-0.5" />
              <span>São Paulo, SP</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-5 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-gray-500">
          <span>© 2026 Brechó de Luxo. Todos os direitos reservados.</span>
          <span>Desenvolvido por <a href="#" className="text-gold-400">GreenWeb Softwares</a></span>
        </div>
      </div>
    </footer>
  )
}
