import { Shield, Heart, Star, Award } from 'lucide-react'
import Link from 'next/link'

export default function SobrePage() {
  return (
    <div className="min-h-screen">
      {/* HERO */}
      <section className="bg-gradient-to-br from-luxo-900 to-luxo-800 py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="font-serif text-white text-5xl font-bold mb-4">Nossa Historia</h1>
          <p className="text-gold-300 text-lg max-w-2xl mx-auto">
            Uma paixao por moda de luxo que se transformou em um negocio com proposito
          </p>
        </div>
      </section>

      {/* HISTORIA */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-gold-500 text-sm font-semibold uppercase tracking-wide">Quem somos</span>
            <h2 className="font-serif text-3xl font-bold text-luxo-900 mt-2 mb-4">
              Mais que um brecho — uma curadoria de luxo
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              O Brecho de Luxo nasceu da paixao por moda e da crenca de que pecas de qualidade
              merecem uma segunda chance. Fundado com o objetivo de democratizar o acesso a
              moda premium, curamos cada peca com carinho e criterio.
            </p>
            <p className="text-gray-600 leading-relaxed mb-6">
              Todas as nossas pecas passam por um rigoroso processo de verificacao de
              autenticidade antes de chegar ate voce. Acreditamos que moda sustentavel
              e moda com historia.
            </p>
            <Link href="/loja" className="btn-gold">Ver a Colecao</Link>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { num: '500+', label: 'Pecas Disponíveis' },
              { num: '2k+', label: 'Clientes Satisfeitos' },
              { num: '100%', label: 'Autenticidade' },
              { num: '4.9', label: 'Avaliacao Media' },
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
              { Icon: Shield, titulo: 'Autenticidade', desc: 'Cada peca e verificada e certificada por especialistas' },
              { Icon: Heart, titulo: 'Sustentabilidade', desc: 'Moda circular para um planeta mais saudavel' },
              { Icon: Star, titulo: 'Qualidade', desc: 'So trabalhamos com pecas em otimo estado de conservacao' },
              { Icon: Award, titulo: 'Exclusividade', desc: 'Colecao curada com pecas unicas e especiais' },
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
          <h2 className="font-serif text-white text-3xl font-bold mb-4">Pronta para encontrar sua peca unica?</h2>
          <p className="text-gold-100 mb-8">Explore nossa colecao e descubra pecas incriveis esperando por voce</p>
          <Link href="/loja" className="bg-white text-gold-700 font-semibold px-8 py-3 rounded-full hover:bg-gold-50 transition-colors inline-flex items-center gap-2">
            Ver a Colecao
          </Link>
        </div>
      </section>
    </div>
  )
}
