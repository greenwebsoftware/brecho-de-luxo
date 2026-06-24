import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '../../../../../lib/supabase-server'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const supabase = createServerClient()
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status') || 'pendente'

  const { data } = await supabase
    .from('blog_comentarios')
    .select('*, blog_posts(titulo), clientes_site(nome)')
    .eq('status', status)
    .order('criado_em', { ascending: false })

  return NextResponse.json({ data: data || [] })
}

export async function PATCH(req: NextRequest) {
  const supabase = createServerClient()
  const { id, status, motivo_rejeicao } = await req.json()

  const { error } = await supabase
    .from('blog_comentarios')
    .update({ status, motivo_rejeicao: motivo_rejeicao || null })
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ ok: true })
}

export async function DELETE(req: NextRequest) {
  const supabase = createServerClient()
  const { id } = await req.json()

  const { error } = await supabase.from('blog_comentarios').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ ok: true })
}
