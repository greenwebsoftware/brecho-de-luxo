import os, base64, gzip

base = os.path.dirname(os.path.abspath(__file__))

# No Next.js 16, params é Promise<{id: string}>
pedidos_id = """import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '../../../../lib/supabase-server'

export const dynamic = 'force-dynamic'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = createServerClient()
  const body = await req.json()
  const { error } = await supabase.from('pedidos_online').update(body).eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ ok: true })
}
"""

produtos_id = """import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '../../../../lib/supabase-server'

export const dynamic = 'force-dynamic'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = createServerClient()
  const body = await req.json()
  const { error } = await supabase.from('produtos').update(body).eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ ok: true })
}
"""

loja_id = """import { notFound } from 'next/navigation'
import { createServerClient } from '../../../lib/supabase-server'
import ProdutoDetalhes from '../../../components/loja/ProdutoDetalhes'

async function getProduto(id: string) {
  const supabase = createServerClient()
  const { data } = await supabase
    .from('produtos')
    .select('*, categorias(nome), grade_tamanhos(tamanho, cor, estoque)')
    .eq('id', id)
    .eq('ativo', true)
    .eq('visivel_site', true)
    .single()
  return data
}

async function getProdutosRelacionados(categoriaId: string, id: string) {
  const supabase = createServerClient()
  const { data } = await supabase
    .from('produtos')
    .select('id, nome, preco_venda, imagem_url, imagens_site')
    .eq('ativo', true)
    .eq('visivel_site', true)
    .eq('categoria_id', categoriaId)
    .neq('id', id)
    .gt('estoque_atual', 0)
    .limit(4)
  return data || []
}

export default async function ProdutoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const produto = await getProduto(id)
  if (!produto) notFound()

  const relacionados = produto.categoria_id
    ? await getProdutosRelacionados(produto.categoria_id, produto.id)
    : []

  return <ProdutoDetalhes produto={produto} relacionados={relacionados} />
}
"""

files = {
    'src/app/api/admin/pedidos/[id]/route.ts': pedidos_id,
    'src/app/api/admin/produtos/[id]/route.ts': produtos_id,
    'src/app/loja/[id]/page.tsx': loja_id,
}

for rel, content in files.items():
    fp = os.path.join(base, rel)
    os.makedirs(os.path.dirname(fp), exist_ok=True)
    with open(fp, 'w', encoding='utf-8', newline='\n') as f:
        f.write(content)
    print(f'OK: {rel}')

print('\nDone! Run: npm run build')
