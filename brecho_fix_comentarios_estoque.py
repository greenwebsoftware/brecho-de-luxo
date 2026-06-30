import os

base = os.path.dirname(os.path.abspath(__file__))

# ── 1. Corrige API de comentarios — status padrao = pendente ──
fp_com = os.path.join(base, 'src', 'app', 'api', 'blog', 'comentarios', 'route.ts')

with open(fp_com, 'r', encoding='utf-8') as f:
    c = f.read()

# Muda status padrão de 'aprovado' para 'pendente'
c = c.replace(
    "  return { status: 'aprovado' }",
    "  return { status: 'pendente' }"
)

# Muda mensagem de retorno para pendente
c = c.replace(
    """  return NextResponse.json({
    ok: true,
    mensagem: 'Coment├írio publicado!',
    data
  })""",
    """  return NextResponse.json({
    ok: true,
    mensagem: 'Comentário enviado e aguardando moderação. Obrigado!',
    data
  })"""
)

with open(fp_com, 'w', encoding='utf-8', newline='\n') as f:
    f.write(c)
print('OK: comentarios agora ficam pendentes por padrao')

# ── 2. Corrige API admin/produtos — busca produtos_online ─────
fp_adm = os.path.join(base, 'src', 'app', 'api', 'admin', 'produtos', 'route.ts')

novo_adm = '''import { NextResponse } from 'next/server'
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
'''

with open(fp_adm, 'w', encoding='utf-8', newline='\n') as f:
    f.write(novo_adm)
print('OK: API admin/produtos agora busca produtos_online')

print()
print('Rode agora:')
print('  git add .')
print('  git commit -m "Fix: comentarios pendentes + estoque-site mostra produtos_online"')
print('  git push')
