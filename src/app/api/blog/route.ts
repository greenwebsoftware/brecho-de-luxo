import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '../../../lib/supabase-server'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const supabase = createServerClient()
  const { searchParams } = new URL(req.url)
  const slug = searchParams.get('slug')
  const destaque = searchParams.get('destaque')
  const limit = parseInt(searchParams.get('limit') || '10')
  const page = parseInt(searchParams.get('page') || '1')
  const offset = (page - 1) * limit

  if (slug) {
    // Busca post por slug e incrementa visualizações
    const { data } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('slug', slug)
      .eq('publicado', true)
      .single()

    if (data) {
      await supabase
        .from('blog_posts')
        .update({ visualizacoes: (data.visualizacoes || 0) + 1 })
        .eq('id', data.id)
    }

    return NextResponse.json({ data })
  }

  let query = supabase
    .from('blog_posts')
    .select('id, titulo, slug, resumo, imagem_capa, tags, publicado, destaque, visualizacoes, curtidas, criado_em', { count: 'exact' })
    .eq('publicado', true)
    .order('criado_em', { ascending: false })
    .range(offset, offset + limit - 1)

  if (destaque === '1') query = query.eq('destaque', true)

  const { data, count } = await query
  return NextResponse.json({ data: data || [], total: count || 0 })
}
