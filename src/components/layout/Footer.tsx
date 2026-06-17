import Link from 'next/link'
import { Instagram, Facebook, Mail, Phone, MapPin } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-luxo-900 text-gray-300">
      {/* NEWSLETTER */}
      <div className="bg-gradient-to-r from-gold-600 to-gold-500">
        <div className="max-w-7xl mx-auto px-4 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="font-serif text-white text-xl font-bold">Fique por dentro das novidades</h3>
            <p className="text-gold-100 text-sm mt-1">Receba em primeira mao as novas chegadas e ofertas exclusivas</p>
          </div>
          <form className="flex gap-2 w-full md:w-auto" onSubmit={e => e.preventDefault()}>
            <input
              type="email"
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

      {/* LINKS */}
      <div className="max-w-7xl mx-auto px-4 py-14 grid grid-cols-2 md:grid-cols-4 gap-8">
        {/* SOBRE */}
        <div className="col-span-2 md:col-span-1">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-gold-500 flex items-center justify-center">
              <span className="text-white font-bold font-serif">B</span>
            </div>
            <span className="font-serif font-bold text-white text-lg">Brecho de Luxo</span>
          </div>
          <p className="text-sm text-gray-400 leading-relaxed mb-4">
            Pecas de moda de luxo cuidadosamente selecionadas com qualidade garantida e preco acessivel.
          </p>
          <div className="flex gap-3">
            <a href="https://instagram.com" target="_blank" rel="noreferrer"
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-gold-500 flex items-center justify-center transition-colors">
              <Instagram className="w-4 h-4" />
            </a>
            <a href="https://facebook.com" target="_blank" rel="noreferrer"
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-gold-500 flex items-center justify-center transition-colors">
              <Facebook className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* LOJA */}
        <div>
          <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wide">Loja</h4>
          <ul className="space-y-2 text-sm">
            {[['Todas as Pecas', '/loja'], ['Bolsas', '/loja?cat=bolsas'],
              ['Roupas', '/loja?cat=roupas'], ['Acessorios', '/loja?cat=acessorios'],
              ['Lancamentos', '/loja?novidades=1'], ['Ofertas', '/loja?oferta=1']].map(([l, h]) => (
              <li key={h}>
                <Link href={h} className="text-gray-400 hover:text-gold-400 transition-colors">{l}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* AJUDA */}
        <div>
          <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wide">Ajuda</h4>
          <ul className="space-y-2 text-sm">
            {[['Como Comprar', '/como-comprar'], ['Entregas e Prazos', '/entregas'],
              ['Trocas e Devolucos', '/trocas'], ['Autenticidade', '/autenticidade'],
              ['Minha Conta', '/conta'], ['Meus Pedidos', '/pedidos']].map(([l, h]) => (
              <li key={h}>
                <Link href={h} className="text-gray-400 hover:text-gold-400 transition-colors">{l}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* CONTATO */}
        <div>
          <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wide">Contato</h4>
          <ul className="space-y-3 text-sm">
            <li className="flex items-center gap-2 text-gray-400">
              <Phone className="w-4 h-4 text-gold-400 flex-shrink-0" />
              <a href="https://wa.me/5511000000000" className="hover:text-gold-400 transition-colors">
                (11) 9-0000-0000
              </a>
            </li>
            <li className="flex items-center gap-2 text-gray-400">
              <Mail className="w-4 h-4 text-gold-400 flex-shrink-0" />
              <a href="mailto:contato@brechodeluxo.com.br" className="hover:text-gold-400 transition-colors">
                contato@brechodeluxo.com.br
              </a>
            </li>
            <li className="flex items-start gap-2 text-gray-400">
              <MapPin className="w-4 h-4 text-gold-400 flex-shrink-0 mt-0.5" />
              <span>Sao Paulo, SP<br />Atendimento online</span>
            </li>
          </ul>
        </div>
      </div>

      {/* RODAPE */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-5 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-gray-500">
          <span>© 2026 Brecho de Luxo. Todos os direitos reservados.</span>
          <div className="flex gap-4">
            <Link href="/privacidade" className="hover:text-gold-400 transition-colors">Privacidade</Link>
            <Link href="/termos" className="hover:text-gold-400 transition-colors">Termos de Uso</Link>
          </div>
          <span>Desenvolvido por <a href="#" className="text-gold-400">GreenWeb Softwares</a></span>
        </div>
      </div>
    </footer>
  )
}
