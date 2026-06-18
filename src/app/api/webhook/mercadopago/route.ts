import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '../../../../lib/supabase-server'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const supabase = createServerClient()
  try {
    const body = await req.json()
    const { type, data } = body
    if (type !== 'payment') return NextResponse.json({ ok: true })

    const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${data.id}`, {
      headers: { 'Authorization': `Bearer ${process.env.MP_ACCESS_TOKEN}` },
    })
    const pagamento = await mpRes.json()
    const status = pagamento.status
    const pedidoId = pagamento.external_reference
    if (!pedidoId) return NextResponse.json({ ok: true })

    const novoStatus = status === 'approved' ? 'pagamento_aprovado'
      : status === 'rejected' ? 'cancelado' : 'aguardando_pagamento'

    await supabase.from('pedidos_online').update({
      gateway_status: status,
      status: novoStatus,
      atualizado_em: new Date().toISOString(),
    }).eq('id', pedidoId)

    if (status === 'approved') {
      const { data: pedido } = await supabase
        .from('pedidos_online')
        .select('*, itens_pedido_online(*)')
        .eq('id', pedidoId)
        .single()

      if (pedido && !pedido.integrado_modasystem) {
        const { data: venda } = await supabase.from('vendas').insert({
          desconto: pedido.desconto || 0,
          subtotal: pedido.subtotal,
          total: pedido.total,
          forma_pagamento: 'pix',
          status: 'concluida',
          observacoes: `Venda Online #${pedido.numero} — ${pedido.cliente_nome}`,
        }).select().single()

        if (venda) {
          for (const item of (pedido.itens_pedido_online || [])) {
            await supabase.from('itens_venda').insert({
              venda_id: venda.id,
              produto_id: item.produto_id,
              quantidade: item.quantidade,
              preco_unitario: item.preco_unitario,
              subtotal: item.subtotal,
            })
            if (item.produto_id) {
              const { data: prod } = await supabase.from('produtos').select('estoque_atual').eq('id', item.produto_id).single()
              if (prod) {
                const novoEst = Math.max(0, prod.estoque_atual - item.quantidade)
                await supabase.from('produtos').update({ estoque_atual: novoEst }).eq('id', item.produto_id)
              }
            }
          }
          await supabase.from('pedidos_online').update({
            integrado_modasystem: true,
            venda_modasystem_id: venda.id,
            status: 'em_separacao',
          }).eq('id', pedidoId)
        }
      }
    }
    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
