import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '../../../../lib/supabase-server'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const supabase = createServerClient()
    const body = await req.json()

    const pixList = body.pix
    if (!pixList?.length) return NextResponse.json({ ok: true })

    for (const pix of pixList) {
      const txid = pix.txid
      if (!txid) continue

      // Busca pedido pelo txid
      const { data: pedido } = await supabase
        .from('pedidos_online')
        .select('*, itens_pedido_online(*)')
        .eq('mp_payment_id', txid)
        .single()

      if (!pedido || pedido.integrado_modasystem) continue

      // Confirma pagamento
      await supabase
        .from('pedidos_online')
        .update({
          status: 'pagamento_aprovado',
          integrado_modasystem: true,
        })
        .eq('id', pedido.id)

      // Baixa estoque
      for (const item of pedido.itens_pedido_online || []) {
        const { data: produto } = await supabase
          .from('produtos')
          .select('id, estoque_atual')
          .eq('id', item.produto_id)
          .single()

        if (!produto) continue

        const novoEstoque = Math.max(0, produto.estoque_atual - item.quantidade)
        await supabase
          .from('produtos')
          .update({ estoque_atual: novoEstoque })
          .eq('id', item.produto_id)

        await supabase.from('movimentacoes_estoque').insert({
          produto_id: item.produto_id,
          tipo: 'saida',
          quantidade: item.quantidade,
          motivo: 'Venda Online PIX',
          observacao: `Pedido #${pedido.numero} — PIX PagBank ${pix.endToEndId}`,
          estoque_anterior: produto.estoque_atual,
          estoque_posterior: novoEstoque,
        })
      }

      // Lança no financeiro
      await supabase.from('financeiro').insert({
        tipo: 'receita',
        categoria: 'Vendas Online PIX',
        descricao: `Venda PIX #${pedido.numero} — ${pedido.cliente_nome}`,
        valor: pedido.total - (pedido.frete || 0),
        data_lancamento: new Date().toISOString(),
        data_competencia: new Date().toISOString().split('T')[0],
        forma_pagamento: 'pix',
        status: 'confirmado',
        observacao: `EndToEnd: ${pix.endToEndId}`,
      })

      if (pedido.frete > 0) {
        await supabase.from('financeiro').insert({
          tipo: 'receita',
          categoria: 'Frete',
          descricao: `Frete PIX #${pedido.numero}`,
          valor: pedido.frete,
          data_lancamento: new Date().toISOString(),
          data_competencia: new Date().toISOString().split('T')[0],
          forma_pagamento: 'pix',
          status: 'confirmado',
        })
      }

      console.log(`✅ PIX confirmado automaticamente — Pedido #${pedido.numero}`)
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Webhook PIX erro:', err)
    return NextResponse.json({ error: 'Erro' }, { status: 500 })
  }
}
