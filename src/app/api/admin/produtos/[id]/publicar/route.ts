import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '../../../../../lib/supabase-server'

export const dynamic = 'force-dynamic'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = createServerClient()
  const body = await req.json()

  // Atualiza campos de publicacao na loja
  const { error } = await supabase
    .from('produtos')
    .update({
      visivel_site: body.visivel_site !== false,
      publicado_loja: true,
      destaque: body.destaque || false,
      descricao_loja: body.descricao_loja || null,
      fotos_loja: body.fotos_loja || [],
      marca: body.marca || null,
      subcategoria: body.subcategoria || null,
      peso: body.peso || 0.3,
      altura_cm: body.altura_cm || 5,
      largura_cm: body.largura_cm || 20,
      comprimento_cm: body.comprimento_cm || 30,
    })
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ ok: true })
}
