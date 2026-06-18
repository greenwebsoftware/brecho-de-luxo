'use client'
import Link from 'next/link'
import { XCircle, ArrowLeft } from 'lucide-react'

export default function PedidoFalhaPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-20">
      <div className="max-w-md w-full mx-auto px-4 text-center">
        <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
          <XCircle className="w-10 h-10 text-red-500" />
        </div>
        <h1 className="font-serif text-3xl font-bold text-luxo-900 mb-3">Pagamento Recusado</h1>
        <p className="text-gray-500 mb-8">
          Não foi possível processar seu pagamento. Verifique os dados do cartão e tente novamente.
        </p>
        <div className="flex gap-3">
          <Link href="/checkout" className="flex-1 btn-gold justify-center">
            Tentar Novamente
          </Link>
          <Link href="/loja" className="flex-1 btn-outline justify-center">
            <ArrowLeft className="w-4 h-4" /> Voltar
          </Link>
        </div>
      </div>
    </div>
  )
}
