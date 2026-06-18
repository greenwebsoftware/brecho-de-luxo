'use client'
import Link from 'next/link'
import { CheckCircle, Package, ArrowRight } from 'lucide-react'

export default function PedidoSucessoPage({ searchParams }: { searchParams: { pedido?: string } }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-20">
      <div className="max-w-md w-full mx-auto px-4 text-center">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-green-500" />
        </div>
        <h1 className="font-serif text-3xl font-bold text-luxo-900 mb-3">Pedido Confirmado!</h1>
        <p className="text-gray-500 mb-2">
          Seu pagamento foi aprovado e seu pedido está sendo preparado.
        </p>
        {searchParams.pedido && (
          <p className="text-sm text-gray-400 mb-8">
            Número do pedido: <strong className="text-gold-600">#{searchParams.pedido.slice(-8).toUpperCase()}</strong>
          </p>
        )}
        <div className="bg-white rounded-2xl p-6 mb-8 shadow-sm text-left space-y-3">
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <Package className="w-5 h-5 text-gold-500 flex-shrink-0" />
            <span>Você receberá um e-mail com os detalhes do pedido</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <CheckCircle className="w-5 h-5 text-gold-500 flex-shrink-0" />
            <span>Prazo de entrega: 5 a 10 dias úteis</span>
          </div>
        </div>
        <div className="flex gap-3">
          <Link href="/pedidos" className="flex-1 btn-outline justify-center">Meus Pedidos</Link>
          <Link href="/loja" className="flex-1 btn-gold justify-center">
            Continuar Comprando <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}
