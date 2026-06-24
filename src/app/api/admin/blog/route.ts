import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '../../../../lib/supabase-server'

export const dynamic = 'force-dynamic'

function gerarSlug(titulo: string): string {
  return titulo
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
    + '-' + Date.now().toString(36)
}

export async function GET() {
  const supabase = createServerClient()
  const { data } = await supabase
    .from('blog_posts')
    .select('*')
    .order('criado_em', { ascending: false })
  return NextResponse.json({ data: data || [] })
}

export async function POST(req: NextRequest) {
  const supabase = createServerClient()
  const body = await req.json()

  const slug = body.slug || gerarSlug(body.titulo)

  const { data, error } = await supabase
    .from('blog_posts')
    .insert({
      titulo: body.titulo,
      slug,
      resumo: body.resumo || null,
      conteudo: body.conteudo,
      imagem_capa: body.imagem_capa || null,
      video_url: body.video_url || null,
      tags: body.tags || [],
      publicado: body.publicado || false,
      destaque: body.destaque || false,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ data })
}
