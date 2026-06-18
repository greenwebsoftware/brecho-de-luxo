import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '../../../lib/supabase-server'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const supabase = createServerClient()
  const { searchParams } = new URL(req.url)
  const busca = searchParams.get('busca') || ''
  const limit = parseInt(searchParams.get('limit') || '20')
  const page = parseInt(searchParams.get('page') || '1')
  const offset = (page - 1) * limit

  let query = supabase
    .from('produtos')
    .select('id, nome, preco_venda, imagem_url, imagens_site, estoque_atual, destaque, categorias(nome)', { count: 'exact' })
    .eq('ativo', true)
    .eq('visivel_site', true)
    .gt('estoque_atual', 0)
    .order('criado_em', { ascending: false })
    .range(offset, offset + limit - 1)

  if (busca) query = query.ilike('nome', `%${busca}%`)

  const { data, error, count } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  return NextResponse.json({
    data: data || [],
    total: count || 0,
    page,
    pages: Math.ceil((count || 0) / limit),
  })
}
