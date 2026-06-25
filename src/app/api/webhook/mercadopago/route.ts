import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '../../../../lib/supabase-server'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    // Valida assinatura do Mercado Pago
    const secret = process.env.MP_WEBHOOK_SECRET
    if (secret) {
      const xSignature = req.headers.get('x-signature')
      const xRequestId = req.headers.get('x-request-id')
      const urlParams = new URL(req.url).searchParams
      const dataId = urlParams.get('data.id')

      if (xSignature) {
        const parts = xSignature.split(',')
        const ts = parts.find(p => p.startsWith('ts='))?.split('=')[1]
        const v1 = parts.find(p => p.startsWith('v1='))?.split('=')[1]

        if (ts && v1) {
          const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`
          const encoder = new TextEncoder()
          const keyData = encoder.encode(secret)
          const msgData = encoder.encode(manifest)
          const cryptoKey = await crypto.subtle.importKey('raw', keyData, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
          const signature = await crypto.subtle.sign('HMAC', cryptoKey, msgData)
          const hashHex = Array.from(new Uint8Array(signature)).map(b => b.toString(16).padStart(2, '0')).join('')
          if (hashHex !== v1) {
            console.warn('Webhook: assinatura inválida')
            return NextResponse.json({ error: 'Assinatura inválida' }, { status: 401 })
          }
        }
      }
    }

    const body = await req.json()
    const { type, data } = body

    // Verifica se é notificação de pagamento aprovado
    if (type !== 'payment' && type !== 'payment.updated') {
      return NextResponse.json({ ok: true })
    }

    const paymentId = data?.id
    if (!paymentId) return NextResponse.json({ ok: true })

    // Busca dados do pagamento no Mercado Pago
    const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: { 'Authorization': `Bearer ${process.env.MP_ACCESS_TOKEN}` }
    })
    const payment = await mpRes.json()

    if (payment.status !== 'approved') return NextResponse.json({ ok: true })

    const supabase = createServerClient()
    const externalRef = payment.external_reference

    // Busca pedido pelo external_reference
    const { data: pedido } = await supabase
      .from('pedidos_online')
      .select('*, itens_pedido_online(*)')
      .eq('id', externalRef)
      .single()

    if (!pedido || pedido.integrado_modasystem) {
      return NextResponse.json({ ok: true })
    }

    // Atualiza status do pedido
    await supabase
      .from('pedidos_online')
      .update({
        status: 'pagamento_aprovado',
        integrado_modasystem: true,
        mp_payment_id: String(paymentId),
      })
      .eq('id', externalRef)

    // Processa cada item do pedido
    for (const item of pedido.itens_pedido_online || []) {
      const produtoId = item.produto_id

      // 1. Busca produto no estoque físico
      const { data: produto } = await supabase
        .from('produtos')
        .select('id, nome, estoque_atual, preco_venda')
        .eq('id', produtoId)
        .single()

      if (!produto) continue

      // 2. Baixa estoque físico
      const novoEstoque = Math.max(0, produto.estoque_atual - item.quantidade)
      await supabase
        .from('produtos')
        .update({ estoque_atual: novoEstoque })
        .eq('id', produtoId)

      // 3. Registra movimentação de estoque
      await supabase
        .from('movimentacoes_estoque')
        .insert({
          produto_id: produtoId,
          tipo: 'saida',
          quantidade: item.quantidade,
          motivo: 'Venda Online',
          observacao: `Pedido #${pedido.numero} — ${payment.payer?.email || 'Cliente Online'}`,
          estoque_anterior: produto.estoque_atual,
          estoque_posterior: novoEstoque,
        })
    }

    // 4. Lança venda no financeiro da loja física
    const totalVenda = pedido.total - (pedido.frete || 0)

    await supabase
      .from('financeiro')
      .insert({
        tipo: 'receita',
        categoria: 'Vendas Online',
        descricao: `Venda Online #${pedido.numero} — ${pedido.cliente_nome}`,
        valor: totalVenda,
        data_lancamento: new Date().toISOString(),
        data_competencia: new Date().toISOString().split('T')[0],
        forma_pagamento: 'mercado_pago',
        status: 'confirmado',
        observacao: `MP Payment ID: ${paymentId} | Frete: R$ ${pedido.frete || 0}`,
      })

    // 5. Se houve frete, lança como receita separada
    if (pedido.frete && pedido.frete > 0) {
      await supabase
        .from('financeiro')
        .insert({
          tipo: 'receita',
          categoria: 'Frete',
          descricao: `Frete Pedido Online #${pedido.numero}`,
          valor: pedido.frete,
          data_lancamento: new Date().toISOString(),
          data_competencia: new Date().toISOString().split('T')[0],
          forma_pagamento: 'mercado_pago',
          status: 'confirmado',
        })
    }

    console.log(`✅ Pedido #${pedido.numero} integrado — Estoque baixado — Financeiro lançado`)
    return NextResponse.json({ ok: true })

  } catch (err) {
    console.error('Webhook erro:', err)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
