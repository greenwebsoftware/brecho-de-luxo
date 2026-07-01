import os

base = os.path.dirname(os.path.abspath(__file__))

# ── 1. API de relatórios ──────────────────────────────────────
api_rel_dir = os.path.join(base, 'src', 'app', 'api', 'admin', 'relatorios')
os.makedirs(api_rel_dir, exist_ok=True)

with open(os.path.join(api_rel_dir, 'route.ts'), 'w', encoding='utf-8', newline='\n') as f:
    f.write('''import { NextRequest, NextResponse } from 'next/server'
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
''')
print('OK: API /api/admin/relatorios criada')

# ── 2. Adiciona aba Relatorios no admin ───────────────────────
fp_admin = os.path.join(base, 'src', 'app', 'admin-loja', 'page.tsx')

with open(fp_admin, 'r', encoding='utf-8') as f:
    c = f.read()

# Adiciona tipo na union da aba
c = c.replace(
    "const [aba, setAba] = useState<'pedidos' | 'produtos' | 'online' | 'blog' | 'moderacao' | 'categorias' | 'config'>('pedidos')",
    "const [aba, setAba] = useState<'pedidos' | 'produtos' | 'online' | 'blog' | 'moderacao' | 'categorias' | 'relatorios' | 'config'>('pedidos')"
)

# Adiciona estados para relatorios
if 'dadosRelatorio' not in c:
    c = c.replace(
        "  const [salvandoCat, setSalvandoCat] = useState(false)",
        """  const [salvandoCat, setSalvandoCat] = useState(false)
  const [dadosRelatorio, setDadosRelatorio] = useState<any>(null)
  const [periodoRelatorio, setPeriodoRelatorio] = useState('30')
  const [loadingRelatorio, setLoadingRelatorio] = useState(false)"""
    )
    print('OK: estados relatorio adicionados')

# Adiciona funcao carregar relatorio
if 'carregarRelatorio' not in c:
    c = c.replace(
        "  const salvarCategoria = async () => {",
        """  const carregarRelatorio = async (periodo: string) => {
    setLoadingRelatorio(true)
    const res = await fetch('/api/admin/relatorios?periodo=' + periodo)
    const data = await res.json()
    setDadosRelatorio(data)
    setLoadingRelatorio(false)
  }

  const salvarCategoria = async () => {"""
    )
    print('OK: funcao carregarRelatorio adicionada')

# Adiciona botao Relatorios no menu de abas
c = c.replace(
    "            { key: 'categorias', label: 'Categorias' },",
    """            { key: 'relatorios', label: 'Relatorios' },
            { key: 'categorias', label: 'Categorias' },"""
)

# Adiciona conteudo da aba Relatorios
conteudo_relatorios = """
        {/* ---- RELATORIOS ---- */}
        {aba === 'relatorios' && (
          <div className="space-y-6">
            {/* Selector de periodo */}
            <div className="bg-white rounded-2xl shadow-sm p-5 flex items-center gap-4 flex-wrap">
              <span className="text-sm font-medium text-gray-700">Periodo:</span>
              {[
                { label: '7 dias', value: '7' },
                { label: '30 dias', value: '30' },
                { label: '3 meses', value: '90' },
                { label: '6 meses', value: '180' },
                { label: '1 ano', value: '365' },
              ].map(p => (
                <button key={p.value}
                  onClick={() => { setPeriodoRelatorio(p.value); carregarRelatorio(p.value) }}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${periodoRelatorio === p.value ? 'bg-luxo-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                  {p.label}
                </button>
              ))}
              {!dadosRelatorio && (
                <button onClick={() => carregarRelatorio(periodoRelatorio)} className="btn-gold ml-auto">
                  Carregar Relatorio
                </button>
              )}
              {loadingRelatorio && <Loader2 className="w-5 h-5 animate-spin text-gold-500 ml-auto" />}
            </div>

            {dadosRelatorio && !loadingRelatorio && (
              <>
                {/* Cards resumo */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: 'Total Vendido', value: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(dadosRelatorio.resumo.totalVendido), color: 'text-green-600', bg: 'bg-green-50' },
                    { label: 'Pedidos', value: dadosRelatorio.resumo.totalPedidos, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Ticket Medio', value: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(dadosRelatorio.resumo.ticketMedio), color: 'text-purple-600', bg: 'bg-purple-50' },
                    { label: 'Taxa Conversao', value: dadosRelatorio.resumo.taxaConversao + '%', color: 'text-amber-600', bg: 'bg-amber-50' },
                    { label: 'Visitas', value: dadosRelatorio.resumo.totalVisitas, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                    { label: 'Valor Estoque', value: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(dadosRelatorio.resumo.valorEstoque), color: 'text-rose-600', bg: 'bg-rose-50' },
                    { label: 'Itens em Estoque', value: dadosRelatorio.resumo.totalProdutosEstoque + ' un', color: 'text-teal-600', bg: 'bg-teal-50' },
                    { label: 'Produtos Online', value: dadosRelatorio.resumo.totalProdutosEstoque, color: 'text-gold-600', bg: 'bg-gold-50' },
                  ].map(card => (
                    <div key={card.label} className={`${card.bg} rounded-2xl p-5`}>
                      <p className="text-xs text-gray-500 mb-1">{card.label}</p>
                      <p className={`text-xl font-bold ${card.color}`}>{card.value}</p>
                    </div>
                  ))}
                </div>

                {/* Grafico de vendas por dia */}
                <div className="bg-white rounded-2xl shadow-sm p-5">
                  <h3 className="font-semibold text-gray-800 mb-4">Vendas por Dia (R$)</h3>
                  {dadosRelatorio.graficoVendas.every((d: any) => d.valor === 0) ? (
                    <p className="text-gray-400 text-sm text-center py-8">Nenhuma venda no periodo</p>
                  ) : (
                    <div className="flex items-end gap-1 h-32 overflow-x-auto">
                      {dadosRelatorio.graficoVendas.map((d: any) => {
                        const max = Math.max(...dadosRelatorio.graficoVendas.map((x: any) => x.valor), 1)
                        const altura = Math.max((d.valor / max) * 100, d.valor > 0 ? 4 : 0)
                        return (
                          <div key={d.data} className="flex flex-col items-center gap-1 flex-1 min-w-[20px]" title={`${d.data}: R$ ${d.valor.toFixed(2)}`}>
                            <div className="w-full bg-gold-400 rounded-t transition-all" style={{ height: `${altura}%` }} />
                            {dadosRelatorio.graficoVendas.length <= 30 && (
                              <span className="text-[8px] text-gray-400 rotate-45 origin-left">{d.data.slice(5)}</span>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Produtos mais vendidos */}
                  <div className="bg-white rounded-2xl shadow-sm p-5">
                    <h3 className="font-semibold text-gray-800 mb-4">Top 10 Produtos Mais Vendidos</h3>
                    {dadosRelatorio.maisVendidos.length === 0 ? (
                      <p className="text-gray-400 text-sm text-center py-4">Nenhuma venda no periodo</p>
                    ) : (
                      <div className="space-y-3">
                        {dadosRelatorio.maisVendidos.map((p: any, i: number) => (
                          <div key={i} className="flex items-center gap-3">
                            <span className="w-6 h-6 rounded-full bg-gold-100 text-gold-700 text-xs font-bold flex items-center justify-center flex-shrink-0">{i + 1}</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-800 truncate">{p.nome}</p>
                              <p className="text-xs text-gray-400">{p.quantidade} vendidos</p>
                            </div>
                            <span className="text-sm font-semibold text-green-600 flex-shrink-0">
                              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(p.total)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Categorias mais vendidas */}
                  <div className="bg-white rounded-2xl shadow-sm p-5">
                    <h3 className="font-semibold text-gray-800 mb-4">Categorias Mais Vendidas</h3>
                    {dadosRelatorio.categoriasMaisVendidas.length === 0 ? (
                      <p className="text-gray-400 text-sm text-center py-4">Nenhuma venda no periodo</p>
                    ) : (
                      <div className="space-y-3">
                        {dadosRelatorio.categoriasMaisVendidas.map((c: any, i: number) => {
                          const total = dadosRelatorio.categoriasMaisVendidas.reduce((s: number, x: any) => s + x.quantidade, 0)
                          const pct = total > 0 ? Math.round((c.quantidade / total) * 100) : 0
                          return (
                            <div key={i} className="space-y-1">
                              <div className="flex justify-between text-sm">
                                <span className="font-medium text-gray-700 capitalize">{c.categoria}</span>
                                <span className="text-gray-500">{c.quantidade} un ({pct}%)</span>
                              </div>
                              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full bg-gold-400 rounded-full" style={{ width: `${pct}%` }} />
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>

                  {/* Melhores clientes */}
                  <div className="bg-white rounded-2xl shadow-sm p-5">
                    <h3 className="font-semibold text-gray-800 mb-4">Clientes que Mais Compram</h3>
                    {dadosRelatorio.melhoresClientes.length === 0 ? (
                      <p className="text-gray-400 text-sm text-center py-4">Nenhuma venda no periodo</p>
                    ) : (
                      <div className="space-y-3">
                        {dadosRelatorio.melhoresClientes.map((cl: any, i: number) => (
                          <div key={i} className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-luxo-100 flex items-center justify-center text-sm font-bold text-luxo-700 flex-shrink-0">
                              {cl.nome.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-800 truncate">{cl.nome}</p>
                              <p className="text-xs text-gray-400">{cl.pedidos} pedido(s)</p>
                            </div>
                            <span className="text-sm font-semibold text-green-600 flex-shrink-0">
                              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cl.total)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Ultimos pedidos */}
                  <div className="bg-white rounded-2xl shadow-sm p-5">
                    <h3 className="font-semibold text-gray-800 mb-4">Ultimos Pedidos</h3>
                    {dadosRelatorio.ultimosPedidos.length === 0 ? (
                      <p className="text-gray-400 text-sm text-center py-4">Nenhum pedido no periodo</p>
                    ) : (
                      <div className="space-y-3">
                        {dadosRelatorio.ultimosPedidos.map((p: any) => (
                          <div key={p.id} className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-800">{p.cliente_nome || 'Cliente'}</p>
                              <p className="text-xs text-gray-400">{new Date(p.criado_em).toLocaleDateString('pt-BR')}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-semibold text-green-600">
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(p.total)}
                              </p>
                              <span className={`text-xs px-2 py-0.5 rounded-full ${p.status === 'entregue' ? 'bg-green-100 text-green-700' : p.status === 'cancelado' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                                {p.status?.replace(/_/g, ' ')}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

"""

c = c.replace(
    "        {/* ---- CATEGORIAS ---- */}",
    conteudo_relatorios + "        {/* ---- CATEGORIAS ---- */}"
)

with open(fp_admin, 'w', encoding='utf-8', newline='\n') as f:
    f.write(c)
print('OK: aba Relatorios adicionada ao admin')

print()
print('Rode agora:')
print('  git add .')
print('  git commit -m "Admin: aba Relatorios completa com metricas financeiras"')
print('  git push')
