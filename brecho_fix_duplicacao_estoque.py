import os

base = os.path.dirname(os.path.abspath(__file__))
fp = os.path.join(base, 'src', 'app', 'api', 'admin', 'produtos', 'route.ts')

# Restaura API para buscar da tabela produtos (loja fisica)
# A aba Estoque->Site é para produtos da loja física que podem ser publicados na loja virtual
# Os produtos exclusivamente online ficam na aba Produtos Online
novo = '''import { NextResponse } from 'next/server'
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
'''

with open(fp, 'w', encoding='utf-8', newline='\n') as f:
    f.write(novo)
print('OK: API admin/produtos restaurada para tabela produtos (loja fisica)')
print()
print('Rode agora:')
print('  git add .')
print('  git commit -m "Fix: Estoque-Site busca produtos da loja fisica sem duplicar"')
print('  git push')
