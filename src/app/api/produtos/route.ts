import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '../../../lib/supabase-server'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const supabase = createServerClient()
  const { searchParams } = new URL(req.url)

  const busca        = searchParams.get('busca') || ''
  const cat          = searchParams.get('cat') || ''
  const subcategoria = searchParams.get('subcategoria') || ''
  const genero       = searchParams.get('genero') || ''
  const marca        = searchParams.get('marca') || ''
  const destaque     = searchParams.get('destaque') || ''
  const limit        = parseInt(searchParams.get('limit') || '20')
  const page         = parseInt(searchParams.get('page') || '1')
  const offset       = (page - 1) * limit

  let query = supabase
    .from('produtos_online')
    .select('id, nome, preco, preco_promocional, fotos, estoque, destaque, subcategoria, genero, marca, categoria, tamanhos, cores', { count: 'exact' })
    .eq('visivel', true)
    .gt('estoque', 0)
    .order('criado_em', { ascending: false })
    .range(offset, offset + limit - 1)

  if (busca)        query = query.ilike('nome', `%${busca}%`)
  if (cat)          query = query.eq('categoria', cat)
  if (genero)       query = query.eq('genero', genero)
  if (subcategoria) query = query.eq('subcategoria', subcategoria)
  if (marca)        query = query.eq('marca', marca)
  if (destaque)     query = query.eq('destaque', true)

  const { data, error, count } = await query

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  const produtos = (data || []).map((p: any) => ({
    id:                p.id,
    nome:              p.nome,
    preco_venda:       p.preco,
    preco_promocional: p.preco_promocional,
    imagem_url:        p.fotos?.[0] || '',
    imagens_site:      p.fotos || [],
    estoque_atual:     p.estoque,
    destaque:          p.destaque,
    subcategoria:      p.subcategoria,
    genero:            p.genero,
    marca:             p.marca,
    categoria:         p.categoria,
    tamanhos:          p.tamanhos,
    cores:             p.cores,
  }))

  return NextResponse.json({
    data:  produtos,
    total: count || 0,
    page,
    pages: Math.ceil((count || 0) / limit),
  })
}
