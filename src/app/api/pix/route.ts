import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '../../../lib/supabase-server'

export const dynamic = 'force-dynamic'

// Gera payload PIX (formato EMV/BR Code)
function gerarPixPayload(
  chave: string,
  nome: string,
  cidade: string,
  valor: number,
  txid: string,
  descricao: string
): string {
  const formatField = (id: string, value: string) => {
    const len = value.length.toString().padStart(2, '0')
    return `${id}${len}${value}`
  }

  // Merchant Account Information
  const gui = formatField('00', 'br.gov.bcb.pix')
  const chaveField = formatField('01', chave)
  const descField = descricao ? formatField('02', descricao.slice(0, 72)) : ''
  const mai = formatField('26', gui + chaveField + descField)

  // Transaction Amount
  const valorStr = valor.toFixed(2)

  // Additional Data
  const txidField = formatField('05', txid.slice(0, 25).replace(/[^a-zA-Z0-9]/g, ''))
  const addi = formatField('62', txidField)

  // Monta payload sem CRC
  const payload =
    formatField('00', '01') +        // Payload Format Indicator
    formatField('01', '12') +        // Point of Initiation Method (12 = dynamic)
    mai +                             // Merchant Account Information
    formatField('52', '0000') +      // Merchant Category Code
    formatField('53', '986') +       // Transaction Currency (BRL)
    formatField('54', valorStr) +    // Transaction Amount
    formatField('58', 'BR') +        // Country Code
    formatField('59', nome.slice(0, 25)) +  // Merchant Name
    formatField('60', cidade.slice(0, 15)) + // Merchant City
    addi +                           // Additional Data
    '6304'                           // CRC placeholder

  // Calcula CRC16
  const crc = calcCRC16(payload)
  return payload + crc
}

function calcCRC16(str: string): string {
  let crc = 0xFFFF
  for (let i = 0; i < str.length; i++) {
    crc ^= str.charCodeAt(i) << 8
    for (let j = 0; j < 8; j++) {
      if (crc & 0x8000) crc = (crc << 1) ^ 0x1021
      else crc <<= 1
      crc &= 0xFFFF
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0')
}

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

    // Cria pedido com status aguardando PIX
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

    // Salva itens do pedido
    const itensPedido = itens.map((i: {
      produto_id: string; nome: string; preco: number; quantidade: number
      tamanho?: string; cor?: string
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

    // Gera PIX payload
    const txid = `BDL${pedido.id.replace(/-/g, '').slice(0, 20)}`
    const descricao = `Pedido #${numero} Brecho de Luxo`

    const pixPayload = gerarPixPayload(
      'd92e36d8-a6c3-46fb-b711-5519475b56ff',
      'Brecho de Luxo',
      'Jundiai',
      total,
      txid,
      descricao
    )

    return NextResponse.json({
      ok: true,
      pedido_id: pedido.id,
      numero: pedido.numero,
      total,
      pix_payload: pixPayload,
      pix_chave: 'd92e36d8-a6c3-46fb-b711-5519475b56ff',
      pix_nome: 'Brecho de Luxo',
      pix_valor: total,
    })
  } catch (err) {
    console.error('PIX erro:', err)
    return NextResponse.json({ error: 'Erro ao gerar PIX' }, { status: 500 })
  }
}
