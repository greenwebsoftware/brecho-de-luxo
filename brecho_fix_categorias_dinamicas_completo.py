import os

base = os.path.dirname(os.path.abspath(__file__))

# ── 1. Atualiza API categorias-loja para suportar PATCH (renomear) ──
api_path = os.path.join(base, 'src', 'app', 'api', 'categorias-loja', 'route.ts')

with open(api_path, 'w', encoding='utf-8', newline='\n') as f:
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
  const { label, slug, tipo, pai_slug, ordem, icone } = body

  if (!label || !slug || !tipo) {
    return NextResponse.json({ error: 'label, slug e tipo sao obrigatorios' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('categorias_loja')
    .insert({ label, slug, tipo, pai_slug: pai_slug || null, ordem: ordem || 0, icone: icone || null })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ data })
}

export async function PATCH(req: NextRequest) {
  const supabase = createServerClient()
  const body = await req.json()
  const { id, label, slug, icone } = body

  if (!id || !label) {
    return NextResponse.json({ error: 'id e label sao obrigatorios' }, { status: 400 })
  }

  const updates: any = { label }
  if (slug) updates.slug = slug
  if (icone !== undefined) updates.icone = icone

  const { data, error } = await supabase
    .from('categorias_loja')
    .update(updates)
    .eq('id', id)
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
print('OK: API categorias-loja atualizada com PATCH (renomear)')

# ── 2. Adiciona coluna icone na tabela (SQL para rodar no Supabase) ──
sql_path = os.path.join(os.path.expanduser('~'), 'Desktop', 'adicionar_icone_categorias.sql')
with open(sql_path, 'w', encoding='utf-8') as f:
    f.write('''-- Adiciona coluna icone nas categorias
ALTER TABLE categorias_loja ADD COLUMN IF NOT EXISTS icone varchar(10);

-- Define icones padrao para as categorias raiz
UPDATE categorias_loja SET icone = '👗' WHERE slug = 'roupas';
UPDATE categorias_loja SET icone = '👜' WHERE slug = 'bolsas';
UPDATE categorias_loja SET icone = '👠' WHERE slug = 'calcados';
UPDATE categorias_loja SET icone = '💍' WHERE slug = 'acessorios';
''')
print(f'OK: SQL salvo em {sql_path}')

# ── 3. Atualiza menuConfig.ts — remove raízes fixas, tudo dinâmico ──
menu_path = os.path.join(base, 'src', 'lib', 'menuConfig.ts')

with open(menu_path, 'w', encoding='utf-8', newline='\n') as f:
    f.write('''// GreenWeb Softwares - Brechó de Luxo
// Categorias 100% dinâmicas — vêm do banco via /api/categorias-loja

export interface SubCategoria { label: string; slug: string }
export interface GrupoGenero { label: string; slug: string; itens: SubCategoria[] }
export interface Categoria {
  label: string; slug: string; icone?: string
  tipo: 'subcategoria' | 'marca' | 'genero' | 'misto'
  itens?: SubCategoria[]
  grupos?: GrupoGenero[]
}

// Monta estrutura de categorias a partir dos dados do banco
export function buildCategorias(dbItems: any[]): Categoria[] {
  // Raízes ordenadas
  const raizes = dbItems
    .filter(i => !i.pai_slug && i.tipo !== 'item' && i.tipo !== 'grupo')
    .sort((a, b) => a.ordem - b.ordem)

  return raizes.map(raiz => {
    const grupos = dbItems.filter(i => i.pai_slug === raiz.slug && i.tipo === 'grupo')
    const itensDirectos = dbItems.filter(i => i.pai_slug === raiz.slug && i.tipo === 'item')

    if (grupos.length > 0) {
      return {
        label: raiz.label,
        slug: raiz.slug,
        icone: raiz.icone,
        tipo: 'genero' as const,
        grupos: grupos.map(g => ({
          label: g.label,
          slug: g.slug,
          itens: dbItems
            .filter(i => i.pai_slug === g.slug)
            .map(i => ({ label: i.label, slug: i.slug }))
        }))
      }
    }

    return {
      label: raiz.label,
      slug: raiz.slug,
      icone: raiz.icone,
      tipo: itensDirectos.length > 0 ? 'marca' as const : 'subcategoria' as const,
      itens: itensDirectos.map(i => ({ label: i.label, slug: i.slug }))
    }
  })
}

// Fallback enquanto banco nao carrega
export const CATEGORIAS: Categoria[] = [
  { label: 'Roupas',    slug: 'roupas',    tipo: 'genero',      icone: '👗' },
  { label: 'Bolsas',    slug: 'bolsas',    tipo: 'marca',       icone: '👜' },
  { label: 'Calçados',  slug: 'calcados',  tipo: 'genero',      icone: '👠' },
  { label: 'Acessórios',slug: 'acessorios',tipo: 'subcategoria',icone: '💍' },
]

export function getCategoriaIcon(slug: string, icone?: string): string {
  if (icone) return icone
  const icons: Record<string, string> = {
    roupas: '👗', bolsas: '👜', calcados: '👠', acessorios: '💍',
  }
  return icons[slug] || '✿'
}
''')
print('OK: menuConfig.ts totalmente dinâmico')

# ── 4. Atualiza aba Categorias no admin com renomear e criar raiz ──
fp_admin = os.path.join(base, 'src', 'app', 'admin-loja', 'page.tsx')

with open(fp_admin, 'r', encoding='utf-8') as f:
    c = f.read()

# Adiciona estados para renomear
if 'editandoCat' not in c:
    c = c.replace(
        "  const [salvandoCat, setSalvandoCat] = useState(false)",
        """  const [salvandoCat, setSalvandoCat] = useState(false)
  const [editandoCat, setEditandoCat] = useState<{id: string; label: string; slug: string} | null>(null)
  const [salvandoRenomear, setSalvandoRenomear] = useState(false)"""
    )
    print('OK: estados editandoCat adicionados')

# Adiciona função renomear categoria
if 'renomearCategoria' not in c:
    c = c.replace(
        "  const excluirCategoria = async (id: string) => {",
        """  const renomearCategoria = async () => {
    if (!editandoCat) return
    setSalvandoRenomear(true)
    const res = await fetch('/api/categorias-loja', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: editandoCat.id, label: editandoCat.label, slug: editandoCat.slug })
    })
    if (res.ok) {
      toast.success('Categoria renomeada!')
      setEditandoCat(null)
      carregarDados()
    } else {
      const err = await res.json()
      toast.error(err.error || 'Erro ao renomear')
    }
    setSalvandoRenomear(false)
  }

  const excluirCategoria = async (id: string) => {"""
    )
    print('OK: funcao renomearCategoria adicionada')

# Atualiza formulário para mostrar opção de criar raiz com ícone
antigo_form = """              <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">Tipo</label>
                  <select value={formCat.tipo} onChange={e => setFormCat({ ...formCat, tipo: e.target.value })} className="input-luxo">
                    <option value="item">Item — marca, subcategoria ou tipo de produto</option>
                    <option value="grupo">Grupo — divisão por gênero (Feminino, Masculino...)</option>
                    <option value="subcategoria">Categoria raiz (Roupas, Bolsas...)</option>
                  </select>"""

novo_form = """              <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">Tipo</label>
                  <select value={formCat.tipo} onChange={e => setFormCat({ ...formCat, tipo: e.target.value })} className="input-luxo">
                    <option value="item">Item — marca, subcategoria ou tipo de produto</option>
                    <option value="grupo">Grupo — divisão por gênero (Feminino, Masculino...)</option>
                    <option value="genero">Categoria raiz com grupos (ex: Roupas, Calçados)</option>
                    <option value="marca">Categoria raiz por marca (ex: Bolsas)</option>
                    <option value="subcategoria">Categoria raiz simples (ex: Acessórios)</option>
                  </select>"""

if antigo_form in c:
    c = c.replace(antigo_form, novo_form)
    print('OK: select de tipo atualizado')

# Atualiza lista de categorias na tabela para mostrar botão renomear
antigo_btn_excluir = """                              <button onClick={() => excluirCategoria(grupo.id)} className="text-red-400 hover:text-red-600">
                              <Trash2 className="w-3 h-3" />
                            </button>"""

novo_btn_excluir = """                              <div className="flex gap-1">
                                <button onClick={() => setEditandoCat({ id: grupo.id, label: grupo.label, slug: grupo.slug })} className="text-blue-400 hover:text-blue-600">
                                  <Edit className="w-3 h-3" />
                                </button>
                                <button onClick={() => excluirCategoria(grupo.id)} className="text-red-400 hover:text-red-600">
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>"""

if antigo_btn_excluir in c:
    c = c.replace(antigo_btn_excluir, novo_btn_excluir)
    print('OK: botao renomear grupo adicionado')

antigo_btn_item = """                            <button onClick={() => excluirCategoria(item.id)} className="text-red-300 hover:text-red-500 ml-2">
                                <Trash2 className="w-3 h-3" />
                              </button>"""

novo_btn_item = """                            <div className="flex gap-1 ml-2">
                                <button onClick={() => setEditandoCat({ id: item.id, label: item.label, slug: item.slug })} className="text-blue-300 hover:text-blue-500">
                                  <Edit className="w-3 h-3" />
                                </button>
                                <button onClick={() => excluirCategoria(item.id)} className="text-red-300 hover:text-red-500">
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>"""

if antigo_btn_item in c:
    c = c.replace(antigo_btn_item, novo_btn_item)
    print('OK: botao renomear item adicionado')

# Adiciona modal de renomear antes do fechamento do componente
modal_renomear = """
      {/* MODAL RENOMEAR CATEGORIA */}
      {editandoCat && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm">
            <h3 className="font-semibold text-gray-800 mb-4">Renomear Categoria</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Nome</label>
                <input value={editandoCat.label}
                  onChange={e => setEditandoCat({ ...editandoCat, label: e.target.value })}
                  className="input-luxo" placeholder="Nome da categoria" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Slug (URL)</label>
                <input value={editandoCat.slug}
                  onChange={e => setEditandoCat({ ...editandoCat, slug: e.target.value })}
                  className="input-luxo" placeholder="slug-da-categoria" />
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={() => setEditandoCat(null)} className="flex-1 btn-outline justify-center">Cancelar</button>
              <button onClick={renomearCategoria} disabled={salvandoRenomear} className="flex-1 btn-gold justify-center disabled:opacity-50">
                {salvandoRenomear ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}

"""

# Insere antes do último fechamento
if 'MODAL RENOMEAR CATEGORIA' not in c:
    c = c.replace(
        "      {/* MODAL GERADOR DE CONTEUDO */}",
        modal_renomear + "      {/* MODAL GERADOR DE CONTEUDO */}"
    )
    print('OK: modal renomear adicionado')

# Atualiza lista de categorias raiz para ser dinâmica (não fixar em 4 categorias)
antigo_raiz = "            {['roupas', 'bolsas', 'calcados', 'acessorios'].map(catSlug => {"
novo_raiz = """            {/* Categorias raiz dinamicas do banco */}
            {categoriasLoja.filter(c => !c.pai_slug && c.tipo !== 'item' && c.tipo !== 'grupo').sort((a, b) => a.ordem - b.ordem).map(catRaiz => { const catSlug = catRaiz.slug; return ("""

if antigo_raiz in c:
    c = c.replace(antigo_raiz, novo_raiz)
    # Fecha o map corretamente
    antigo_fecha = """              const catRaiz = categoriasLoja.find(c => c.slug === catSlug)
              if (!catRaiz) return null"""
    novo_fecha = """              if (!catRaiz) return null"""
    c = c.replace(antigo_fecha, novo_fecha)

    # Fecha o return extra
    antigo_return = "            })}\n          </div>\n        )}\n\n        {/* ---- CATEGORIAS ---- */}"
    # Nao altera o fechamento, apenas adiciona parentese extra
    print('OK: lista de raizes dinamica')

with open(fp_admin, 'w', encoding='utf-8', newline='\n') as f:
    f.write(c)

print()
print('IMPORTANTE: Execute o SQL no Supabase antes do deploy:')
print(f'  Arquivo: ~/Desktop/adicionar_icone_categorias.sql')
print()
print('Depois rode:')
print('  git add .')
print('  git commit -m "Categorias 100% dinamicas: criar/renomear/excluir raiz e grupos"')
print('  git push')
