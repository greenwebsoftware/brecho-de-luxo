import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '../../../lib/supabase-server'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const { cep_destino, produtos } = await req.json()

    if (!cep_destino || !produtos?.length) {
      return NextResponse.json({ error: 'CEP e produtos são obrigatórios' }, { status: 400 })
    }

    // Busca token e CEP de origem do banco
    const supabase = createServerClient()
    const { data: config } = await supabase
      .from('site_config')
      .select('melhor_envio_token, cep_origem')
      .eq('id', 1)
      .single()

    const token = config?.melhor_envio_token || process.env.MELHOR_ENVIO_TOKEN
    const cepOrigem = config?.cep_origem || '13201-032'

    if (!token) {
      return NextResponse.json({ error: 'Token do Melhor Envio não configurado' }, { status: 400 })
    }

    // Calcula dimensoes e peso total
    const pesoTotal = produtos.reduce((s: number, p: { peso?: number; quantidade: number }) =>
      s + (p.peso || 0.3) * p.quantidade, 0)

    const body = {
      from: { postal_code: cepOrigem.replace(/\D/g, '') },
      to: { postal_code: cep_destino.replace(/\D/g, '') },
      package: {
        height: 20,
        width: 30,
        length: 40,
        weight: Math.max(pesoTotal, 0.1),
      },
      options: {
        insurance_value: produtos.reduce((s: number, p: { preco: number; quantidade: number }) =>
          s + p.preco * p.quantidade, 0),
        receipt: false,
        own_hand: false,
      },
      services: '1,2,17', // SEDEX, PAC, Mini Envios
    }

    const res = await fetch('https://melhorenvio.com.br/api/v2/me/shipment/calculate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'User-Agent': 'brechodeluxo.com.br contato@brechodeluxo.com.br',
        'Accept': 'application/json',
      },
      body: JSON.stringify(body),
    })

    const data = await res.json()

    if (!res.ok) {
      return NextResponse.json({ error: 'Erro ao calcular frete', detail: data }, { status: 400 })
    }

    // Filtra apenas opcoes com preco disponivel e ordena por preco
    const opcoes = (Array.isArray(data) ? data : [])
      .filter((o: { error?: string; price?: number }) => !o.error && o.price)
      .map((o: {
        id: number; name: string; company: { name: string; picture: string }
        price: number; delivery_time: number; currency: string
      }) => ({
        id: o.id,
        nome: o.name,
        transportadora: o.company?.name,
        logo: o.company?.picture,
        preco: parseFloat(String(o.price)),
        prazo: o.delivery_time,
        moeda: o.currency,
      }))
      .sort((a: { preco: number }, b: { preco: number }) => a.preco - b.preco)

    return NextResponse.json({ opcoes })
  } catch (err) {
    console.error('Erro frete:', err)
    return NextResponse.json({ error: 'Erro interno ao calcular frete' }, { status: 500 })
  }
}
