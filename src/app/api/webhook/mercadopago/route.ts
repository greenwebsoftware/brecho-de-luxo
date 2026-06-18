import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'

export async function POST(req: NextRequest) {
  const supabase = createServerClient()

  try {
    const body = await req.json()
    const { type, data } = body

    if (type !== 'payment') return NextResponse.json({ ok: true })

    // Busca pagamento no MP via fetch
    const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${data.id}`, {
      headers: { 'Authorization': `Bearer ${process.env.MP_ACCESS_TOKEN}` },
    })
    const pagamento = await mpRes.json()

    const status = pagamento.status
    const pedidoId = pagamento.external_reference

    if (!pedidoId) return NextResponse.json({ ok: true })

    const novoStatus = status === 'approved' ? 'pagamento_aprovado'
      : status === 'rejected' ? 'cancelado'
      : 'aguardando_pagamento'

    await supabase.from('pedidos_online').update({
      gateway_status: status,
      status: novoStatus,
      atualizado_em: new Date().toISOString(),
    }).eq('id', pedidoId)

    if (status === 'approved') {
      await integrarComModaSystem(pedidoId, supabase)
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Webhook erro:', err)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

async function integrarComModaSystem(pedidoId: string, supabase: ReturnType<typeof createServerClient>) {
  const { data: pedido } = await supabase
    .from('pedidos_online')
    .select('*, itens_pedido_online(*)')
    .eq('id', pedidoId)
    .single()

  if (!pedido || pedido.integrado_modasystem) return

  const { data: venda, error } = await supabase.from('vendas').insert({
    desconto: pedido.desconto || 0,
    subtotal: pedido.subtotal,
    total: pedido.total,
    forma_pagamento: pedido.forma_pagamento || 'pix',
    status: 'concluida',
    observacoes: `Venda Online #${pedido.numero} — ${pedido.cliente_nome}`,
  }).select().single()

  if (error || !venda) return

  for (const item of (pedido.itens_pedido_online || [])) {
    await supabase.from('itens_venda').insert({
      venda_id: venda.id,
      produto_id: item.produto_id,
      tamanho: item.tamanho || null,
      cor: item.cor || null,
      quantidade: item.quantidade,
      preco_unitario: item.preco_unitario,
      subtotal: item.subtotal,
    })

    if (item.produto_id) {
      const { data: prod } = await supabase.from('produtos').select('estoque_atual').eq('id', item.produto_id).single()
      if (prod) {
        const novoEst = Math.max(0, prod.estoque_atual - item.quantidade)
        await supabase.from('produtos').update({ estoque_atual: novoEst }).eq('id', item.produto_id)
        await supabase.from('movimentacoes_estoque').insert({
          produto_id: item.produto_id,
          tipo: 'saida',
          quantidade: item.quantidade,
          saldo_anterior: prod.estoque_atual,
          saldo_posterior: novoEst,
          observacao: `Venda Online #${pedido.numero}`,
        })
      }
    }
  }

  await supabase.from('financeiro').insert({
    tipo: 'receita',
    descricao: `Venda Online #${pedido.numero} — ${pedido.cliente_nome}`,
    valor: pedido.total,
    data_vencimento: new Date().toISOString().split('T')[0],
    data_pagamento: new Date().toISOString().split('T')[0],
    status: 'pago',
    categoria: 'Vendas Online',
  })

  await supabase.from('venda_pagamentos').insert({
    venda_id: venda.id,
    forma_pagamento: pedido.forma_pagamento || 'pix',
    valor: pedido.total,
  })

  await supabase.from('pedidos_online').update({
    integrado_modasystem: true,
    venda_modasystem_id: venda.id,
    status: 'em_separacao',
  }).eq('id', pedidoId)
}
