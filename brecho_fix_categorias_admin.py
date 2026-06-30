import os

base = os.path.dirname(os.path.abspath(__file__))

# ── 1. API GET categorias ─────────────────────────────────────
api_cat_dir = os.path.join(base, 'src', 'app', 'api', 'categorias-loja')
os.makedirs(api_cat_dir, exist_ok=True)

with open(os.path.join(api_cat_dir, 'route.ts'), 'w', encoding='utf-8', newline='\n') as f:
    f.write('''import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '../../../lib/supabase-server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('categorias_loja')
    .select('*')
    .eq('ativo', true)
    .order('ordem')
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ data: data || [] })
}

export async function POST(req: NextRequest) {
  const supabase = createServerClient()
  const body = await req.json()
  const { label, slug, tipo, pai_slug, ordem } = body

  if (!label || !slug || !tipo) {
    return NextResponse.json({ error: 'label, slug e tipo sao obrigatorios' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('categorias_loja')
    .insert({ label, slug, tipo, pai_slug: pai_slug || null, ordem: ordem || 0 })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ data })
}

export async function DELETE(req: NextRequest) {
  const supabase = createServerClient()
  const { id } = await req.json()
  const { error } = await supabase
    .from('categorias_loja')
    .update({ ativo: false })
    .eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ success: true })
}
''')
print('OK: API /api/categorias-loja criada')

# ── 2. Adiciona aba Categorias no admin ───────────────────────
fp_admin = os.path.join(base, 'src', 'app', 'admin-loja', 'page.tsx')

with open(fp_admin, 'r', encoding='utf-8') as f:
    c = f.read()

# Adiciona tipo CategoriaLoja na interface
if 'CategoriaLoja' not in c:
    c = c.replace(
        "interface Comentario {",
        """interface CategoriaLoja { id: string; label: string; slug: string; tipo: string; pai_slug?: string; ordem: number; ativo: boolean }

interface Comentario {"""
    )
    print('OK: interface CategoriaLoja adicionada')

# Adiciona estado para categorias no componente
if 'categoriasLoja' not in c:
    c = c.replace(
        "  const [statusComentario, setStatusComentario] = useState('pendente')",
        """  const [statusComentario, setStatusComentario] = useState('pendente')
  const [categoriasLoja, setCategoriasLoja] = useState<CategoriaLoja[]>([])
  const [formCat, setFormCat] = useState({ label: '', slug: '', tipo: 'item', pai_slug: '' })
  const [salvandoCat, setSalvandoCat] = useState(false)"""
    )
    print('OK: estados categoriasLoja adicionados')

# Adiciona carregamento de categorias no carregarDados
c = c.replace(
    "    const [pRes, pedRes, poRes, blogRes, confRes] = await Promise.all([\n      fetch('/api/admin/produtos'), fetch('/api/admin/pedidos'),\n      fetch('/api/admin/produtos-online'), fetch('/api/admin/blog'),\n      fetch('/api/admin/config'),\n    ])\n    const [pData, pedData, poData, blogData, confData] = await Promise.all([\n      pRes.json(), pedRes.json(), poRes.json(), blogRes.json(), confRes.json()\n    ])\n    setProdutos(pData.data || [])\n    setPedidos(pedData.data || [])\n    setProdutosOnline(poData.data || [])\n    setBlogPosts(blogData.data || [])\n    setConfig(confData.data || {})",
    """    const [pRes, pedRes, poRes, blogRes, confRes, catRes] = await Promise.all([
      fetch('/api/admin/produtos'), fetch('/api/admin/pedidos'),
      fetch('/api/admin/produtos-online'), fetch('/api/admin/blog'),
      fetch('/api/admin/config'), fetch('/api/categorias-loja'),
    ])
    const [pData, pedData, poData, blogData, confData, catData] = await Promise.all([
      pRes.json(), pedRes.json(), poRes.json(), blogRes.json(), confRes.json(), catRes.json()
    ])
    setProdutos(pData.data || [])
    setPedidos(pedData.data || [])
    setProdutosOnline(poData.data || [])
    setBlogPosts(blogData.data || [])
    setConfig(confData.data || {})
    setCategoriasLoja(catData.data || [])"""
)
print('OK: carregamento de categorias adicionado')

# Adiciona funções de gerenciar categorias
if 'salvarCategoria' not in c:
    c = c.replace(
        "  const salvarConfig = async () => {",
        """  const salvarCategoria = async () => {
    if (!formCat.label || !formCat.slug || !formCat.tipo) {
      toast.error('Label, slug e tipo são obrigatórios')
      return
    }
    setSalvandoCat(true)
    const res = await fetch('/api/categorias-loja', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formCat)
    })
    if (res.ok) {
      toast.success('Categoria adicionada!')
      setFormCat({ label: '', slug: '', tipo: 'item', pai_slug: '' })
      carregarDados()
    } else {
      const err = await res.json()
      toast.error(err.error || 'Erro ao salvar')
    }
    setSalvandoCat(false)
  }

  const excluirCategoria = async (id: string) => {
    if (!confirm('Remover esta categoria?')) return
    await fetch('/api/categorias-loja', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    })
    toast.success('Categoria removida!')
    carregarDados()
  }

  const salvarConfig = async () => {"""
    )
    print('OK: funções salvarCategoria e excluirCategoria adicionadas')

# Adiciona aba Categorias no menu de abas
c = c.replace(
    "            { key: 'config', label: 'Configurações' },",
    """            { key: 'categorias', label: '🏷️ Categorias' },
            { key: 'config', label: 'Configurações' },"""
)

# Adiciona tipo na união da aba
c = c.replace(
    "const [aba, setAba] = useState<'pedidos' | 'produtos' | 'online' | 'blog' | 'moderacao' | 'config'>('pedidos')",
    "const [aba, setAba] = useState<'pedidos' | 'produtos' | 'online' | 'blog' | 'moderacao' | 'categorias' | 'config'>('pedidos')"
)

# Adiciona conteúdo da aba Categorias antes da aba Config
conteudo_aba_categorias = """
        {/* ---- CATEGORIAS ---- */}
        {aba === 'categorias' && (
          <div className="space-y-6">
            {/* Formulário adicionar */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="font-semibold text-gray-800 mb-4">Adicionar Nova Categoria/Subcategoria</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">Nome (Label)</label>
                  <input value={formCat.label} onChange={e => {
                    const label = e.target.value
                    const slug = label.toLowerCase()
                      .normalize('NFD').replace(/[\\u0300-\\u036f]/g, '')
                      .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
                    setFormCat({ ...formCat, label, slug })
                  }} className="input-luxo" placeholder="Ex: Michael Kors" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">Slug (URL)</label>
                  <input value={formCat.slug} onChange={e => setFormCat({ ...formCat, slug: e.target.value })} className="input-luxo" placeholder="Ex: michael-kors" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">Tipo</label>
                  <select value={formCat.tipo} onChange={e => setFormCat({ ...formCat, tipo: e.target.value })} className="input-luxo">
                    <option value="item">Item (subcategoria/marca)</option>
                    <option value="grupo">Grupo (ex: Feminino)</option>
                    <option value="subcategoria">Categoria raiz</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">Pertence a (pai)</label>
                  <select value={formCat.pai_slug} onChange={e => setFormCat({ ...formCat, pai_slug: e.target.value })} className="input-luxo">
                    <option value="">Nenhum (categoria raiz)</option>
                    {categoriasLoja.filter(c => c.tipo !== 'item').map(c => (
                      <option key={c.slug} value={c.slug}>{c.label} ({c.slug})</option>
                    ))}
                  </select>
                </div>
              </div>
              <button onClick={salvarCategoria} disabled={salvandoCat} className="btn-gold mt-4 disabled:opacity-50">
                {salvandoCat ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Adicionar Categoria
              </button>
            </div>

            {/* Lista por categoria raiz */}
            {['roupas', 'bolsas', 'calcados', 'acessorios'].map(catSlug => {
              const catRaiz = categoriasLoja.find(c => c.slug === catSlug)
              if (!catRaiz) return null
              const grupos = categoriasLoja.filter(c => c.pai_slug === catSlug && c.tipo === 'grupo')
              const itensDirectos = categoriasLoja.filter(c => c.pai_slug === catSlug && c.tipo === 'item')

              return (
                <div key={catSlug} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                  <div className="bg-luxo-900 px-6 py-3 flex items-center justify-between">
                    <h3 className="text-white font-semibold">{catRaiz.label}</h3>
                    <span className="text-gold-300 text-xs">{catRaiz.tipo}</span>
                  </div>

                  {grupos.length > 0 ? (
                    <div className="p-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                      {grupos.map(grupo => {
                        const itens = categoriasLoja.filter(c => c.pai_slug === grupo.slug)
                        return (
                          <div key={grupo.slug} className="border border-gray-100 rounded-xl p-3">
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-xs font-bold text-gold-600 uppercase">{grupo.label}</p>
                              <button onClick={() => excluirCategoria(grupo.id)} className="text-red-400 hover:text-red-600">
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                            <ul className="space-y-1">
                              {itens.map(item => (
                                <li key={item.slug} className="flex items-center justify-between text-sm text-gray-600">
                                  <span>{item.label}</span>
                                  <button onClick={() => excluirCategoria(item.id)} className="text-red-300 hover:text-red-500 ml-2">
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="p-4">
                      <div className="flex flex-wrap gap-2">
                        {itensDirectos.map(item => (
                          <div key={item.slug} className="flex items-center gap-1 bg-gray-50 border border-gray-100 rounded-full px-3 py-1">
                            <span className="text-sm text-gray-700">{item.label}</span>
                            <button onClick={() => excluirCategoria(item.id)} className="text-red-300 hover:text-red-500 ml-1">
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

"""

c = c.replace(
    "        {/* ---- CONFIGURAÇÕES ---- */}",
    conteudo_aba_categorias + "        {/* ---- CONFIGURAÇÕES ---- */"
)
print('OK: aba Categorias adicionada ao admin')

with open(fp_admin, 'w', encoding='utf-8', newline='\n') as f:
    f.write(c)

print()
print('Rode agora:')
print('  git add .')
print('  git commit -m "Admin: gerenciador de categorias dinamico"')
print('  git push')
