import os

base = os.path.dirname(os.path.abspath(__file__))
fp = os.path.join(base, 'src', 'app', 'api', 'admin', 'produtos', 'route.ts')

# Conteudo correto e definitivo
CONTEUDO_CORRETO = '''import { NextResponse } from 'next/server'
import { createServerClient } from '../../../../lib/supabase-server'

export const dynamic = 'force-dynamic'

// VERSAO DEFINITIVA v2 - NAO ALTERAR
// Busca produtos_online (loja virtual) para a aba Estoque-Site do admin
export async function GET() {
  const supabase = createServerClient()

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

# Verifica se já está correto
with open(fp, 'r', encoding='utf-8') as f:
    atual = f.read()

if 'produtos_online' in atual and 'VERSAO DEFINITIVA' in atual:
    print('OK: arquivo já está na versão definitiva, nenhuma alteração necessária')
else:
    with open(fp, 'w', encoding='utf-8', newline='\n') as f:
        f.write(CONTEUDO_CORRETO)
    print('OK: API admin/produtos fixada na versão definitiva')

print()
print('Rode agora:')
print('  git add .')
print('  git commit -m "Fix definitivo: Estoque-site sempre usa produtos_online"')
print('  git push')
