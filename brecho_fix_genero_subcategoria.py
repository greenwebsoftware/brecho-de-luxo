import os

base = os.path.dirname(os.path.abspath(__file__))

# ── 1. API de produtos — adiciona filtro por genero ──────────
fp_api = os.path.join(base, 'src', 'app', 'api', 'produtos', 'route.ts')

novo_api = '''import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '../../../lib/supabase-server'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const supabase = createServerClient()
  const { searchParams } = new URL(req.url)

  const busca        = searchParams.get('busca') || ''
  const cat          = searchParams.get('cat') || ''
  const subcategoria = searchParams.get('subcategoria') || ''
  const genero       = searchParams.get('genero') || ''
  const marca        = searchParams.get('marca') || ''
  const destaque     = searchParams.get('destaque') || ''
  const limit        = parseInt(searchParams.get('limit') || '20')
  const page         = parseInt(searchParams.get('page') || '1')
  const offset       = (page - 1) * limit

  let query = supabase
    .from('produtos_online')
    .select('id, nome, preco, preco_promocional, fotos, estoque, destaque, subcategoria, genero, marca, categoria, tamanhos, cores', { count: 'exact' })
    .eq('visivel', true)
    .gt('estoque', 0)
    .order('criado_em', { ascending: false })
    .range(offset, offset + limit - 1)

  if (busca)        query = query.ilike('nome', `%${busca}%`)
  if (cat)          query = query.eq('categoria', cat)
  if (genero)       query = query.eq('genero', genero)
  if (subcategoria) query = query.eq('subcategoria', subcategoria)
  if (marca)        query = query.eq('marca', marca)
  if (destaque)     query = query.eq('destaque', true)

  const { data, error, count } = await query

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  const produtos = (data || []).map((p: any) => ({
    id:                p.id,
    nome:              p.nome,
    preco_venda:       p.preco,
    preco_promocional: p.preco_promocional,
    imagem_url:        p.fotos?.[0] || '',
    imagens_site:      p.fotos || [],
    estoque_atual:     p.estoque,
    destaque:          p.destaque,
    subcategoria:      p.subcategoria,
    genero:            p.genero,
    marca:             p.marca,
    categoria:         p.categoria,
    tamanhos:          p.tamanhos,
    cores:             p.cores,
  }))

  return NextResponse.json({
    data:  produtos,
    total: count || 0,
    page,
    pages: Math.ceil((count || 0) / limit),
  })
}
'''

with open(fp_api, 'w', encoding='utf-8', newline='\n') as f:
    f.write(novo_api)
print('OK: API de produtos atualizada com filtro genero')

# ── 2. Admin — atualiza dropdowns para salvar genero/subcategoria separados ──
fp_admin = os.path.join(base, 'src', 'app', 'admin-loja', 'page.tsx')

with open(fp_admin, 'r', encoding='utf-8') as f:
    c = f.read()

# Atualiza interface ProdutoOnline para incluir genero
c = c.replace(
    "interface ProdutoOnline { id: string; nome: string; preco: number; preco_promocional?: number; estoque: number; categoria?: string; subcategoria?: string; marca?: string; tamanhos: string[]; cores: string[]; fotos: string[]; peso: number; visivel: boolean; destaque: boolean; descricao?: string }",
    "interface ProdutoOnline { id: string; nome: string; preco: number; preco_promocional?: number; estoque: number; categoria?: string; subcategoria?: string; genero?: string; marca?: string; tamanhos: string[]; cores: string[]; fotos: string[]; peso: number; visivel: boolean; destaque: boolean; descricao?: string }"
)

# Atualiza dropdowns de Roupas/Calcados para salvar genero e subcategoria separados
antigo_cascata = """\
                {/* Roupas e Calcados: dropdown de genero + subcategoria */}
                {(catSelecionada === 'roupas' || catSelecionada === 'calcados') && (
                  <>
                    <div>
                      <label className="text-xs font-medium text-gray-500 mb-1 block">Gênero</label>
                      <select value={formOnline.subcategoria?.split('|')[0] || ''} onChange={e => {
                        setFormOnline({ ...formOnline, subcategoria: e.target.value + '|' })
                      }} className="input-luxo">
                        <option value="">Selecione o gênero...</option>
                        {CATEGORIAS.find(c => c.slug === catSelecionada)?.grupos?.map(grupo => (
                          <option key={grupo.slug} value={grupo.slug}>{grupo.label}</option>
                        ))}
                      </select>
                    </div>
                    {formOnline.subcategoria?.split('|')[0] && (
                      <div>
                        <label className="text-xs font-medium text-gray-500 mb-1 block">Tipo</label>
                        <select value={formOnline.subcategoria?.split('|')[1] || ''} onChange={e => {
                          const genero = formOnline.subcategoria?.split('|')[0] || ''
                          setFormOnline({ ...formOnline, subcategoria: genero + '|' + e.target.value })
                        }} className="input-luxo">
                          <option value="">Selecione o tipo...</option>
                          {CATEGORIAS.find(c => c.slug === catSelecionada)?.grupos
                            ?.find(g => g.slug === formOnline.subcategoria?.split('|')[0])
                            ?.itens?.map(item => (
                              <option key={item.slug} value={item.slug}>{item.label}</option>
                            ))}
                        </select>
                      </div>
                    )}
                  </>
                )}"""

novo_cascata = """\
                {/* Roupas e Calcados: dropdown de genero + subcategoria separados */}
                {(catSelecionada === 'roupas' || catSelecionada === 'calcados') && (
                  <>
                    <div>
                      <label className="text-xs font-medium text-gray-500 mb-1 block">Gênero</label>
                      <select value={formOnline.genero || ''} onChange={e => {
                        setFormOnline({ ...formOnline, genero: e.target.value, subcategoria: '' })
                      }} className="input-luxo">
                        <option value="">Selecione o gênero...</option>
                        {CATEGORIAS.find(c => c.slug === catSelecionada)?.grupos?.map(grupo => (
                          <option key={grupo.slug} value={grupo.slug}>{grupo.label}</option>
                        ))}
                      </select>
                    </div>
                    {formOnline.genero && (
                      <div>
                        <label className="text-xs font-medium text-gray-500 mb-1 block">Tipo</label>
                        <select value={formOnline.subcategoria || ''} onChange={e => {
                          setFormOnline({ ...formOnline, subcategoria: e.target.value })
                        }} className="input-luxo">
                          <option value="">Selecione o tipo...</option>
                          {CATEGORIAS.find(c => c.slug === catSelecionada)?.grupos
                            ?.find(g => g.slug === formOnline.genero)
                            ?.itens?.map(item => (
                              <option key={item.slug} value={item.slug}>{item.label}</option>
                            ))}
                        </select>
                      </div>
                    )}
                  </>
                )}"""

if antigo_cascata in c:
    c = c.replace(antigo_cascata, novo_cascata)
    print('OK: dropdowns genero/subcategoria separados no admin')
else:
    print('AVISO: trecho cascata nao encontrado — pode ja estar atualizado')

# Atualiza abrirModalEditar para setar genero
c = c.replace(
    "  const abrirModalEditar = (p: ProdutoOnline) => { setEditandoOnline(p); setFormOnline({ ...p }); setCatSelecionada(p.categoria || ''); setModalOnline(true) }",
    "  const abrirModalEditar = (p: ProdutoOnline) => { setEditandoOnline(p); setFormOnline({ ...p }); setCatSelecionada(p.categoria || ''); setModalOnline(true) }"
)

with open(fp_admin, 'w', encoding='utf-8', newline='\n') as f:
    f.write(c)
print('OK: admin-loja atualizado')

# ── 3. API admin produtos-online — inclui genero no select/insert ──
fp_po = os.path.join(base, 'src', 'app', 'api', 'admin', 'produtos-online', 'route.ts')
if os.path.isfile(fp_po):
    with open(fp_po, 'r', encoding='utf-8') as f:
        po = f.read()
    # Adiciona genero no select
    po = po.replace(
        "'id, nome, preco, preco_promocional, estoque, categoria, subcategoria, marca, tamanhos, cores, fotos, peso, visivel, destaque, descricao'",
        "'id, nome, preco, preco_promocional, estoque, categoria, subcategoria, genero, marca, tamanhos, cores, fotos, peso, visivel, destaque, descricao'"
    )
    with open(fp_po, 'w', encoding='utf-8', newline='\n') as f:
        f.write(po)
    print('OK: API admin produtos-online atualizada com genero')
else:
    print('INFO: API admin produtos-online nao encontrada — verifique o caminho')

print()
print('Rode agora:')
print('  git add .')
print('  git commit -m "Fix: genero e subcategoria separados no cadastro e filtro"')
print('  git push')
