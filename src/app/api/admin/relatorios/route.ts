import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '../../../../lib/supabase-server'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const supabase = createServerClient()
  const { searchParams } = new URL(req.url)
  const periodo = searchParams.get('periodo') || '30'

  const dias = parseInt(periodo)
  const dataInicio = new Date()
  dataInicio.setDate(dataInicio.getDate() - dias)
  const dataInicioISO = dataInicio.toISOString()

  // 1. Pedidos no periodo
  const { data: pedidos } = await supabase
    .from('pedidos_online')
    .select('id, total, status, criado_em, cliente_nome')
    .gte('criado_em', dataInicioISO)
    .order('criado_em', { ascending: false })

  const pedidosValidos = (pedidos || []).filter(p => p.status !== 'cancelado')

  // 2. Total vendido e ticket medio
  const totalVendido = pedidosValidos.reduce((s, p) => s + (p.total || 0), 0)
  const ticketMedio = pedidosValidos.length > 0 ? totalVendido / pedidosValidos.length : 0

  // 3. Produtos mais vendidos
  const { data: itensPedido } = await supabase
    .from('itens_pedido_online')
    .select('produto_id, nome_produto, quantidade, preco_unitario, pedidos_online(criado_em, status)')
    .gte('pedidos_online.criado_em', dataInicioISO)

  const produtosMap: Record<string, { nome: string; quantidade: number; total: number }> = {}
  for (const item of itensPedido || []) {
    const pedido = item.pedidos_online as any
    if (pedido?.status === 'cancelado') continue
    const key = item.produto_id || item.nome_produto
    if (!produtosMap[key]) produtosMap[key] = { nome: item.nome_produto, quantidade: 0, total: 0 }
    produtosMap[key].quantidade += item.quantidade || 1
    produtosMap[key].total += (item.preco_unitario || 0) * (item.quantidade || 1)
  }
  const maisVendidos = Object.values(produtosMap)
    .sort((a, b) => b.quantidade - a.quantidade)
    .slice(0, 10)

  // 4. Vendas por dia (grafico)
  const vendasPorDia: Record<string, number> = {}
  for (let i = dias - 1; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const key = d.toISOString().split('T')[0]
    vendasPorDia[key] = 0
  }
  for (const p of pedidosValidos) {
    const key = p.criado_em?.split('T')[0]
    if (key && vendasPorDia[key] !== undefined) {
      vendasPorDia[key] += p.total || 0
    }
  }
  const graficoVendas = Object.entries(vendasPorDia).map(([data, valor]) => ({ data, valor }))

  // 5. Categorias mais vendidas
  const { data: produtosOnline } = await supabase
    .from('produtos_online')
    .select('id, categoria, preco, estoque')

  const categoriasMap: Record<string, { quantidade: number; total: number }> = {}
  for (const item of itensPedido || []) {
    const prod = produtosOnline?.find(p => p.id === item.produto_id)
    const cat = prod?.categoria || 'Outros'
    if (!categoriasMap[cat]) categoriasMap[cat] = { quantidade: 0, total: 0 }
    categoriasMap[cat].quantidade += item.quantidade || 1
    categoriasMap[cat].total += (item.preco_unitario || 0) * (item.quantidade || 1)
  }
  const categoriasMaisVendidas = Object.entries(categoriasMap)
    .map(([categoria, dados]) => ({ categoria, ...dados }))
    .sort((a, b) => b.quantidade - a.quantidade)

  // 6. Clientes que mais compram
  const clientesMap: Record<string, { nome: string; pedidos: number; total: number }> = {}
  for (const p of pedidosValidos) {
    const key = p.cliente_nome || 'Visitante'
    if (!clientesMap[key]) clientesMap[key] = { nome: key, pedidos: 0, total: 0 }
    clientesMap[key].pedidos += 1
    clientesMap[key].total += p.total || 0
  }
  const melhoresClientes = Object.values(clientesMap)
    .sort((a, b) => b.total - a.total)
    .slice(0, 10)

  // 7. Valor total do estoque
  const valorEstoque = (produtosOnline || []).reduce((s, p) => s + (p.preco || 0) * (p.estoque || 0), 0)
  const totalProdutosEstoque = (produtosOnline || []).reduce((s, p) => s + (p.estoque || 0), 0)

  // 8. Visitas no periodo
  const { count: totalVisitas } = await supabase
    .from('site_visitas')
    .select('id', { count: 'exact' })
    .gte('criado_em', dataInicioISO)

  // Taxa de conversao
  const taxaConversao = (totalVisitas || 0) > 0
    ? ((pedidosValidos.length / (totalVisitas || 1)) * 100).toFixed(2)
    : '0.00'

  return NextResponse.json({
    periodo: dias,
    resumo: {
      totalPedidos: pedidosValidos.length,
      totalVendido,
      ticketMedio,
      totalVisitas: totalVisitas || 0,
      taxaConversao: parseFloat(taxaConversao),
      valorEstoque,
      totalProdutosEstoque,
    },
    graficoVendas,
    maisVendidos,
    categoriasMaisVendidas,
    melhoresClientes,
    ultimosPedidos: (pedidos || []).slice(0, 5),
  })
}
