import os

base = os.path.dirname(os.path.abspath(__file__))
fp = os.path.join(base, 'src', 'app', 'api', 'admin', 'produtos', 'route.ts')

novo = '''import { NextResponse } from 'next/server'
import { createServerClient } from '../../../../lib/supabase-server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = createServerClient()

  // Busca produtos online (exclusivos da loja virtual)
  const { data } = await supabase
    .from('produtos_online')
    .select('id, nome, preco, estoque, visivel, destaque, fotos, categoria, subcategoria, genero, marca')
    .order('criado_em', { ascending: false })

  const normalizado = (data || []).map((p: any) => ({
    id:            p.id,
    nome:          p.nome,
    preco_venda:   p.preco,
    estoque_atual: p.estoque,
    visivel_site:  p.visivel,
    destaque:      p.destaque,
    imagem_url:    p.fotos?.[0] || '',
    imagens_site:  p.fotos || [],
    categoria:     p.categoria,
    subcategoria:  p.subcategoria,
    genero:        p.genero,
    marca:         p.marca,
    publicado_loja: p.visivel,
  }))

  return NextResponse.json({ data: normalizado })
}
'''

with open(fp, 'w', encoding='utf-8', newline='\n') as f:
    f.write(novo)

print('OK: API admin/produtos corrigida para usar produtos_online')
print()
print('Rode agora:')
print('  git add .')
print('  git commit -m "Fix: Estoque-site busca produtos_online"')
print('  git push')
