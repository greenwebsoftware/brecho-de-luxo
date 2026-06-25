export const metadata = {
  title: 'Sobre Nós | Nossa História e Missão',
  description: 'Conheça o Brechó de Luxo de Jundiaí-SP. Nossa missão é democratizar o acesso à moda premium através da moda circular sustentável em São Paulo e região.',
  keywords: 'sobre brechó de luxo Jundiaí, moda circular SP, sustentabilidade moda luxo',
}

import { Shield, Heart, Star, Award } from 'lucide-react'
import Link from 'next/link'

export default function SobrePage() {
  return (
    <div className="min-h-screen">
      {/* HERO */}
      <section className="bg-gradient-to-br from-luxo-900 to-luxo-800 py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="font-serif text-white text-5xl font-bold mb-4">Nossa História</h1>
          <p className="text-gold-300 text-lg max-w-2xl mx-auto">
            Uma paixão por moda de luxo que se transformou em um negócio com propósito
          </p>
        </div>
      </section>

      {/* HISTORIA */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-gold-500 text-sm font-semibold uppercase tracking-wide">Quem somos</span>
            <h2 className="font-serif text-3xl font-bold text-luxo-900 mt-2 mb-4">
              Mais que um brechó — uma curadoria de luxo
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              O Brechó de Luxo nasceu da paixão por moda e da crença de que peças de qualidade
              merecem uma segunda chance. Fundado com o objetivo de democratizar o acesso à
              moda premium, curamos cada peça com carinho e critério.
            </p>
            <p className="text-gray-600 leading-relaxed mb-6">
              Todas as nossas peças passam por um rigoroso processo de verificação de
              autenticidade antes de chegar até você. Acreditamos que moda sustentável
              é moda com história.
            </p>
            <Link href="/loja" className="btn-gold">Ver a Coleção</Link>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { num: '500+', label: 'Peças Disponíveis' },
              { num: '2k+', label: 'Clientes Satisfeitos' },
              { num: '100%', label: 'Autenticidade' },
              { num: '4.9', label: 'Avaliação Média' },
            ].map(({ num, label }) => (
              <div key={label} className="bg-gradient-to-br from-gold-50 to-gold-100 rounded-2xl p-6 text-center">
                <div className="font-serif text-3xl font-bold text-gold-600 mb-1">{num}</div>
                <div className="text-sm text-gray-600">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* VALORES */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl font-bold text-luxo-900">Nossos Valores</h2>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { Icon: Shield, titulo: 'Autenticidade', desc: 'Cada peça é verificada e certificada por especialistas' },
              { Icon: Heart, titulo: 'Sustentabilidade', desc: 'Moda circular para um planeta mais saudável' },
              { Icon: Star, titulo: 'Qualidade', desc: 'Só trabalhamos com peças em ótimo estado de conservação' },
              { Icon: Award, titulo: 'Exclusividade', desc: 'Coleção curada com peças únicas e especiais' },
            ].map(({ Icon, titulo, desc }) => (
              <div key={titulo} className="bg-white rounded-2xl p-6 text-center shadow-sm">
                <div className="w-12 h-12 rounded-full bg-gold-100 flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-6 h-6 text-gold-600" />
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">{titulo}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-gold-500 to-gold-600 py-14">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="font-serif text-white text-3xl font-bold mb-4">Pronta para encontrar sua peça única?</h2>
          <p className="text-gold-100 mb-8">Explore nossa coleção e descubra peças incríveis esperando por você</p>
          <Link href="/loja" className="bg-white text-gold-700 font-semibold px-8 py-3 rounded-full hover:bg-gold-50 transition-colors inline-flex items-center gap-2">
            Ver a Coleção
          </Link>
        </div>
      </section>
    </div>
  )
}
