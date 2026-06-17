// API de pagamento - cria preferencia no Mercado Pago
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'
import { MercadoPagoConfig, Preference } from 'mercadopago'

export async function POST(req: NextRequest) {
  const supabase = createServerClient()

  try {
    const body = await req.json()
    const { itens, cliente, endereco, frete = 0, desconto = 0 } = body

    if (!itens || itens.length === 0)
      return NextResponse.json({ error: 'Carrinho vazio' }, { status: 400 })

    // Calcula totais
    const subtotal = itens.reduce((s: number, i: { preco: number; quantidade: number }) => s + i.preco * i.quantidade, 0)
    const total = subtotal + frete - desconto

    // Cria pedido no banco
    const { data: pedido, error: pedidoErr } = await supabase
      .from('pedidos_online')
      .insert({
        cliente_nome: cliente.nome,
        cliente_email: cliente.email,
        cliente_telefone: cliente.telefone || null,
        subtotal,
        desconto,
        frete,
        total,
        forma_pagamento: 'mercadopago',
        gateway: 'mercadopago',
        status: 'aguardando_pagamento',
        endereco_snapshot: endereco || null,
      })
      .select()
      .single()

    if (pedidoErr || !pedido)
      return NextResponse.json({ error: 'Erro ao criar pedido' }, { status: 400 })

    // Cria itens do pedido
    await supabase.from('itens_pedido_online').insert(
      itens.map((i: {
        produto_id: string; nome: string; codigo?: string;
        tamanho?: string; cor?: string; preco: number; quantidade: number
      }) => ({
        pedido_id: pedido.id,
        produto_id: i.produto_id,
        produto_nome: i.nome,
        produto_codigo: i.codigo || null,
        tamanho: i.tamanho || null,
        cor: i.cor || null,
        quantidade: i.quantidade,
        preco_unitario: i.preco,
        subtotal: i.preco * i.quantidade,
      }))
    )

    // Cria preferencia no Mercado Pago
    const mp = new MercadoPagoConfig({
      accessToken: process.env.MP_ACCESS_TOKEN!
    })

    const preference = new Preference(mp)
    const pref = await preference.create({
      body: {
        external_reference: pedido.id,
        items: itens.map((i: { nome: string; preco: number; quantidade: number }) => ({
          title: i.nome,
          unit_price: i.preco,
          quantity: i.quantidade,
          currency_id: 'BRL',
        })),
        payer: {
          name: cliente.nome,
          email: cliente.email,
        },
        payment_methods: {
          excluded_payment_types: [],
          installments: 6,
        },
        back_urls: {
          success: `${process.env.NEXT_PUBLIC_SITE_URL}/pedidos/sucesso?pedido=${pedido.id}`,
          failure: `${process.env.NEXT_PUBLIC_SITE_URL}/pedidos/falha?pedido=${pedido.id}`,
          pending: `${process.env.NEXT_PUBLIC_SITE_URL}/pedidos/pendente?pedido=${pedido.id}`,
        },
        auto_return: 'approved',
        notification_url: `${process.env.NEXT_PUBLIC_SITE_URL}/api/webhook/mercadopago`,
        statement_descriptor: 'BRECHO DE LUXO',
      }
    })

    // Atualiza pedido com ID da preferencia
    await supabase.from('pedidos_online').update({
      gateway_id: pref.id,
    }).eq('id', pedido.id)

    return NextResponse.json({
      pedido_id: pedido.id,
      pedido_numero: pedido.numero,
      mp_preference_id: pref.id,
      mp_init_point: pref.init_point,
      mp_sandbox_init_point: pref.sandbox_init_point,
    })

  } catch (err: unknown) {
    console.error('Erro pagamento:', err)
    return NextResponse.json({ error: 'Erro ao processar pagamento' }, { status: 500 })
  }
}
