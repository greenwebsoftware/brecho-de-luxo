import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '../../../lib/supabase-server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('categorias_loja')
    .select('*')
    .eq('ativo', true)
    .order('ordem')
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ data: data || [] })
}

export async function POST(req: NextRequest) {
  const supabase = createServerClient()
  const body = await req.json()
  const { label, slug, tipo, pai_slug, ordem } = body

  if (!label || !slug || !tipo) {
    return NextResponse.json({ error: 'label, slug e tipo sao obrigatorios' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('categorias_loja')
    .insert({ label, slug, tipo, pai_slug: pai_slug || null, ordem: ordem || 0 })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ data })
}

export async function DELETE(req: NextRequest) {
  const supabase = createServerClient()
  const { id } = await req.json()
  const { error } = await supabase
    .from('categorias_loja')
    .update({ ativo: false })
    .eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ success: true })
}
