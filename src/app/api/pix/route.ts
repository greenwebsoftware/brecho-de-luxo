import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '../../../lib/supabase-server'

export const dynamic = 'force-dynamic'

const PAGBANK_API = process.env.PAGBANK_ENV === 'production'
  ? 'https://api.pagseguro.com'
  : 'https://sandbox.api.pagseguro.com'

const PAGBANK_TOKEN = process.env.PAGBANK_TOKEN || ''

export async function POST(req: NextRequest) {
  try {
    const supabase = createServerClient()
    const body = await req.json()
    const { itens, cliente, endereco, frete } = body

    if (!itens?.length || !cliente?.nome || !cliente?.email) {
      return NextResponse.json({ error: 'Dados incompletos' }, { status: 400 })
    }

    // Calcula total
    const subtotal = itens.reduce((s: number, i: { preco: number; quantidade: number }) =>
      s + i.preco * i.quantidade, 0)
    const total = subtotal + (frete || 0)

    // Gera número do pedido
    const { count } = await supabase
      .from('pedidos_online')
      .select('*', { count: 'exact', head: true })
    const numero = (count || 0) + 1

    // Cria pedido no banco
    const { data: pedido, error } = await supabase
      .from('pedidos_online')
      .insert({
        numero,
        cliente_nome: cliente.nome,
        cliente_email: cliente.email,
        cliente_telefone: cliente.telefone || null,
        cep: endereco?.cep || null,
        logradouro: endereco?.logradouro || null,
        numero_endereco: endereco?.numero || null,
        complemento: endereco?.complemento || null,
        bairro: endereco?.bairro || null,
        cidade: endereco?.cidade || null,
        uf: endereco?.uf || null,
        subtotal,
        frete: frete || 0,
        total,
        status: 'aguardando_pix',
        forma_pagamento: 'pix',
        integrado_modasystem: false,
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })

    // Salva itens
    const itensPedido = itens.map((i: {
      produto_id: string; nome: string; preco: number
      quantidade: number; tamanho?: string; cor?: string
    }) => ({
      pedido_id: pedido.id,
      produto_id: i.produto_id,
      nome_produto: i.nome,
      preco_unitario: i.preco,
      quantidade: i.quantidade,
      tamanho: i.tamanho || null,
      cor: i.cor || null,
      subtotal: i.preco * i.quantidade,
    }))
    await supabase.from('itens_pedido_online').insert(itensPedido)

    // Gera txid único
    const txid = `BDL${pedido.id.replace(/-/g, '').slice(0, 23)}`

    // Cria cobrança PIX no PagBank
    const pixRes = await fetch(`${PAGBANK_API}/instant-payments/cob/${txid}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${PAGBANK_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        calendario: { expiracao: 1800 },
        devedor: { nome: cliente.nome },
        valor: { original: total.toFixed(2) },
        chave: 'd92e36d8-a6c3-46fb-b711-5519475b56ff',
        solicitacaoPagador: `Pedido #${numero} Brecho de Luxo`,
        infoAdicionais: [
          { nome: 'Pedido', valor: String(pedido.id) },
          { nome: 'Numero', valor: String(numero) },
        ],
      }),
    })

    const pixData = await pixRes.json()

    if (!pixRes.ok) {
      console.error('PagBank PIX erro:', pixData)
      // Fallback para PIX manual se PagBank falhar
      const pixPayload = txid
      return NextResponse.json({
        ok: true,
        pedido_id: pedido.id,
        numero,
        total,
        pix_payload: pixPayload,
        pix_txid: txid,
        modo: 'manual',
      })
    }

    // Salva txid no pedido
    await supabase
      .from('pedidos_online')
      .update({ mp_payment_id: txid })
      .eq('id', pedido.id)

    // Busca QR Code
    const qrRes = await fetch(`${PAGBANK_API}/instant-payments/loc/${pixData.loc?.id}/qrcode`, {
      headers: { 'Authorization': `Bearer ${PAGBANK_TOKEN}` },
    })
    const qrData = qrRes.ok ? await qrRes.json() : null

    return NextResponse.json({
      ok: true,
      pedido_id: pedido.id,
      numero,
      total,
      pix_payload: qrData?.imagemQrcode || pixData.location || txid,
      pix_txid: txid,
      pix_location: pixData.location,
      modo: 'pagbank',
    })

  } catch (err) {
    console.error('PIX erro:', err)
    return NextResponse.json({ error: 'Erro ao gerar PIX' }, { status: 500 })
  }
}
