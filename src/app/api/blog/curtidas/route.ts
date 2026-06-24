import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '../../../../lib/supabase-server'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const supabase = createServerClient()
  const { post_id } = await req.json()

  if (!post_id) return NextResponse.json({ error: 'post_id obrigatório' }, { status: 400 })

  // Pega IP do visitante
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown'

  // Tenta inserir curtida (unique constraint evita duplicatas)
  const { error } = await supabase
    .from('blog_curtidas')
    .insert({ post_id, ip })

  if (error) {
    // Já curtiu — remove a curtida (toggle)
    await supabase.from('blog_curtidas').delete().eq('post_id', post_id).eq('ip', ip)
    await supabase.rpc('decrementar_curtidas', { p_post_id: post_id })
    return NextResponse.json({ curtiu: false })
  }

  // Incrementa contador
  await supabase
    .from('blog_posts')
    .update({ curtidas: supabase.rpc('incrementar_curtidas' as never) })
    .eq('id', post_id)

  // Atualiza curtidas contando direto
  const { count } = await supabase
    .from('blog_curtidas')
    .select('*', { count: 'exact' })
    .eq('post_id', post_id)

  await supabase
    .from('blog_posts')
    .update({ curtidas: count || 0 })
    .eq('id', post_id)

  return NextResponse.json({ curtiu: true, total: count })
}
