import { NextResponse } from 'next/server'
import { createServerClient } from '../../../../lib/supabase-server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = createServerClient()

  // Busca produtos online (exclusivos da loja virtual)
  const { data: online } = await supabase
    .from('produtos_online')
    .select('id, nome, preco, estoque, visivel, destaque, fotos, categoria, subcategoria, genero, marca')
    .order('criado_em', { ascending: false })

  // Normaliza para formato compatível com o frontend
  const data = (online || []).map((p: any) => ({
    id:           p.id,
    nome:         p.nome,
    preco_venda:  p.preco,
    estoque_atual: p.estoque,
    visivel_site: p.visivel,
    destaque:     p.destaque,
    imagem_url:   p.fotos?.[0] || '',
    imagens_site: p.fotos || [],
    categoria:    p.categoria,
    subcategoria: p.subcategoria,
    genero:       p.genero,
    marca:        p.marca,
    publicado_loja: p.visivel,
  }))

  return NextResponse.json({ data })
}
