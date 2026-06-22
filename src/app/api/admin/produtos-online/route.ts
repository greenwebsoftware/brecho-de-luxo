import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '../../../../lib/supabase-server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = createServerClient()
  const { data } = await supabase
    .from('produtos_online')
    .select('*')
    .order('criado_em', { ascending: false })
  return NextResponse.json({ data: data || [] })
}

export async function POST(req: NextRequest) {
  const supabase = createServerClient()
  const body = await req.json()

  const { error, data } = await supabase
    .from('produtos_online')
    .insert({
      nome: body.nome,
      descricao: body.descricao || null,
      preco: body.preco,
      preco_promocional: body.preco_promocional || null,
      estoque: body.estoque || 0,
      categoria: body.categoria || null,
      subcategoria: body.subcategoria || null,
      marca: body.marca || null,
      tamanhos: body.tamanhos || [],
      cores: body.cores || [],
      fotos: body.fotos || [],
      peso: body.peso || 0.3,
      altura: body.altura || 5,
      largura: body.largura || 20,
      comprimento: body.comprimento || 30,
      visivel: body.visivel !== false,
      destaque: body.destaque || false,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ data })
}
