'use client'
import Link from 'next/link'
import { Clock, ArrowRight } from 'lucide-react'

export default function PedidoPendentePage({ searchParams }: { searchParams: { pedido?: string } }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-20">
      <div className="max-w-md w-full mx-auto px-4 text-center">
        <div className="w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-6">
          <Clock className="w-10 h-10 text-amber-500" />
        </div>
        <h1 className="font-serif text-3xl font-bold text-luxo-900 mb-3">Pagamento Pendente</h1>
        <p className="text-gray-500 mb-4">
          Seu pedido foi criado e o pagamento está sendo processado.
        </p>
        {searchParams.pedido && (
          <p className="text-sm text-gray-400 mb-4">
            Pedido: <strong className="text-gold-600">#{searchParams.pedido.slice(-8).toUpperCase()}</strong>
          </p>
        )}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-8 text-left text-sm text-amber-800">
          <p className="font-semibold mb-2">O que acontece agora?</p>
          <ul className="space-y-1 list-disc list-inside text-amber-700">
            <li>Se pagou com PIX, aguarde a confirmação em até 30 minutos</li>
            <li>Se pagou com boleto, pode levar até 3 dias úteis</li>
            <li>Você receberá um e-mail quando o pagamento for confirmado</li>
          </ul>
        </div>
        <Link href="/loja" className="btn-gold justify-center inline-flex">
          Continuar Comprando <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  )
}
