import { NextResponse } from 'next/server'
import { createServerClient } from '../../../../lib/supabase-server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = createServerClient()

  // Busca produtos da loja fisica (AplicativoComercial)
  // Estes podem ser publicados na loja virtual via botao Publicar
  const { data } = await supabase
    .from('produtos')
    .select('id, nome, preco_venda, estoque_atual, visivel_site, destaque, imagem_url, imagens_site, publicado_loja')
    .eq('ativo', true)
    .order('nome')

  return NextResponse.json({ data: data || [] })
}
