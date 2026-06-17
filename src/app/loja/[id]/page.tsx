import { notFound } from 'next/navigation'
import { createServerClient } from '@/lib/supabase-server'
import ProdutoDetalhes from '@/components/loja/ProdutoDetalhes'

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

export default async function ProdutoPage({ params }: { params: { id: string } }) {
  const produto = await getProduto(params.id)
  if (!produto) notFound()

  const relacionados = produto.categoria_id
    ? await getProdutosRelacionados(produto.categoria_id, produto.id)
    : []

  return <ProdutoDetalhes produto={produto} relacionados={relacionados} />
}
