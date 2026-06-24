'use client'
import { useState, useEffect } from 'react'
import { Package, ChevronRight, Loader2, ShoppingBag } from 'lucide-react'
import Link from 'next/link'

interface Pedido {
  id: string
  numero: number
  total: number
  status: string
  criado_em: string
  itens_pedido_online: { quantidade: number; nome_produto: string }[]
}

const STATUS_LABEL: Record<string, { label: string; cor: string }> = {
  aguardando_pagamento: { label: 'Aguardando Pagamento', cor: 'bg-amber-100 text-amber-700' },
  pagamento_aprovado: { label: 'Pagamento Aprovado', cor: 'bg-blue-100 text-blue-700' },
  em_separacao: { label: 'Em Separação', cor: 'bg-purple-100 text-purple-700' },
  enviado: { label: 'Enviado', cor: 'bg-indigo-100 text-indigo-700' },
  entregue: { label: 'Entregue', cor: 'bg-green-100 text-green-700' },
  cancelado: { label: 'Cancelado', cor: 'bg-red-100 text-red-700' },
}

export default function PedidosPage() {
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [loading, setLoading] = useState(true)
  const [autenticado, setAutenticado] = useState(false)

  useEffect(() => {
    verificarECarregar()
  }, [])

  const verificarECarregar = async () => {
    const res = await fetch('/api/auth')
    const data = await res.json()
    if (!data.usuario) {
      window.location.href = '/conta'
      return
    }
    setAutenticado(true)

    const pedRes = await fetch('/api/meus-pedidos')
    const pedData = await pedRes.json()
    setPedidos(pedData.data || [])
    setLoading(false)
  }

  const fmt = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
  const fmtData = (d: string) => new Date(d).toLocaleDateString('pt-BR')

  if (!autenticado) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-br from-luxo-900 to-luxo-800 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center gap-3">
            <Link href="/conta" className="text-gold-300 hover:text-white text-sm transition-colors">
              ← Minha Conta
            </Link>
          </div>
          <h1 className="font-serif text-white text-4xl font-bold mt-3">Meus Pedidos</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-10">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 text-gold-400 animate-spin" />
          </div>
        ) : pedidos.length === 0 ? (
          <div className="text-center py-20">
            <ShoppingBag className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <h2 className="font-serif text-2xl text-gray-600 mb-2">Nenhum pedido ainda</h2>
            <p className="text-gray-400 mb-6">Que tal explorar nossa coleção?</p>
            <Link href="/loja" className="btn-gold">Ver a Coleção</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {pedidos.map(p => {
              const st = STATUS_LABEL[p.status] || { label: p.status, cor: 'bg-gray-100 text-gray-600' }
              return (
                <div key={p.id} className="bg-white rounded-2xl shadow-sm p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gold-50 flex items-center justify-center">
                        <Package className="w-5 h-5 text-gold-600" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-800">Pedido #{p.numero}</p>
                        <p className="text-xs text-gray-400">{fmtData(p.criado_em)}</p>
                      </div>
                    </div>
                    <span className={`text-xs font-medium px-3 py-1 rounded-full ${st.cor}`}>
                      {st.label}
                    </span>
                  </div>
                  {p.itens_pedido_online?.length > 0 && (
                    <div className="bg-gray-50 rounded-xl p-3 mb-3">
                      {p.itens_pedido_online.map((item, i) => (
                        <p key={i} className="text-sm text-gray-600">
                          {item.quantidade}x {item.nome_produto}
                        </p>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gold-600 text-lg">{fmt(p.total)}</span>
                    <button className="flex items-center gap-1 text-sm text-gray-500 hover:text-gold-600 transition-colors">
                      Detalhes <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
