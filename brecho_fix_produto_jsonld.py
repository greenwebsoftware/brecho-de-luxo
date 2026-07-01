import os

base = os.path.dirname(os.path.abspath(__file__))
fp = os.path.join(base, 'src', 'app', 'loja', '[id]', 'page.tsx')

novo = r'''import { notFound } from 'next/navigation'
import { createServerClient } from '../../../lib/supabase-server'
import ProdutoDetalhes from '../../../components/loja/ProdutoDetalhes'

async function getProduto(id: string) {
  const supabase = createServerClient()
  const { data } = await supabase
    .from('produtos_online')
    .select('*')
    .eq('id', id)
    .eq('visivel', true)
    .single()
  return data
}

async function getProdutosRelacionados(categoria: string, id: string) {
  const supabase = createServerClient()
  const { data } = await supabase
    .from('produtos_online')
    .select('id, nome, preco, fotos, categoria')
    .eq('visivel', true)
    .eq('categoria', categoria)
    .neq('id', id)
    .gt('estoque', 0)
    .limit(4)
  return (data || []).map((p: any) => ({
    id: p.id,
    nome: p.nome,
    preco_venda: p.preco,
    imagem_url: p.fotos?.[0] || '',
    imagens_site: p.fotos || [],
  }))
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const produto = await getProduto(id)
  if (!produto) return {}
  return {
    title: `${produto.nome} | Brechó de Luxo`,
    description: produto.descricao || `${produto.nome} por R$ ${produto.preco?.toFixed(2)}`,
    openGraph: {
      images: produto.fotos?.[0] ? [produto.fotos[0]] : [],
    },
  }
}

export default async function ProdutoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const produto = await getProduto(id)
  if (!produto) notFound()

  const relacionados = produto.categoria
    ? await getProdutosRelacionados(produto.categoria, produto.id)
    : []

  // Normaliza produto para o componente ProdutoDetalhes
  const produtoNormalizado = {
    ...produto,
    preco_venda: produto.preco,
    imagem_url: produto.fotos?.[0] || '',
    imagens_site: produto.fotos || [],
    estoque_atual: produto.estoque,
    visivel_site: produto.visivel,
  }

  // JSON-LD Schema.org Product — corrige erro do Google Search Console
  const jsonLd = {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name: produto.nome,
    description: produto.descricao || produto.nome,
    image: produto.fotos || [],
    sku: produto.id,
    brand: produto.marca ? { '@type': 'Brand', name: produto.marca } : undefined,
    offers: {
      '@type': 'Offer',
      url: `https://brechodluxo.com.br/loja/${produto.id}`,
      priceCurrency: 'BRL',
      price: produto.preco?.toFixed(2) || '0.00',
      availability: produto.estoque > 0
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/UsedCondition',
      seller: {
        '@type': 'Organization',
        name: 'Brechó de Luxo',
      },
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProdutoDetalhes produto={produtoNormalizado} relacionados={relacionados} />
    </>
  )
}
'''

os.makedirs(os.path.dirname(fp), exist_ok=True)
with open(fp, 'w', encoding='utf-8', newline='\n') as f:
    f.write(novo)

print('OK: pagina de produto corrigida')
print('  - Busca da tabela produtos_online')
print('  - JSON-LD Schema.org com offers (corrige erro Google)')
print('  - generateMetadata para SEO')
print()
print('Rode agora:')
print('  git add .')
print('  git commit -m "Fix: pagina produto usa produtos_online + JSON-LD Schema.org"')
print('  git push')
