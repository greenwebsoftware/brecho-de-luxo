import os

base = os.path.dirname(os.path.abspath(__file__))

# ── API pública de categorias (já existe, mas vamos garantir) ─
api_dir = os.path.join(base, 'src', 'app', 'api', 'categorias-loja')
os.makedirs(api_dir, exist_ok=True)
api_path = os.path.join(api_dir, 'route.ts')

if not os.path.isfile(api_path):
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
''')
    print('OK: API /api/categorias-loja garantida')
else:
    print('OK: API /api/categorias-loja ja existe')

# ── Atualiza menuConfig.ts para exportar função de build a partir do banco ──
menu_config = os.path.join(base, 'src', 'lib', 'menuConfig.ts')

novo_menu = '''// Estrutura de categorias e subcategorias do Brechó de Luxo
// As categorias raiz são fixas; os itens vêm do banco via /api/categorias-loja

export interface SubCategoria {
  label: string
  slug: string
}

export interface GrupoGenero {
  label: string
  slug: string
  itens: SubCategoria[]
}

export interface Categoria {
  label: string
  slug: string
  tipo: 'subcategoria' | 'marca' | 'genero'
  itens?: SubCategoria[]
  grupos?: GrupoGenero[]
}

// Categorias raiz fixas (ordem e tipo não mudam)
export const CATS_RAIZ = [
  { slug: 'roupas',    label: 'Roupas',    tipo: 'genero'      as const },
  { slug: 'bolsas',    label: 'Bolsas',    tipo: 'marca'       as const },
  { slug: 'calcados',  label: 'Calçados',  tipo: 'genero'      as const },
  { slug: 'acessorios',label: 'Acessórios',tipo: 'subcategoria'as const },
]

// Monta estrutura CATEGORIAS a partir dos dados do banco
export function buildCategorias(dbItems: any[]): Categoria[] {
  return CATS_RAIZ.map(raiz => {
    const grupos = dbItems.filter(i => i.pai_slug === raiz.slug && i.tipo === 'grupo')
    const itensDirectos = dbItems.filter(i => i.pai_slug === raiz.slug && i.tipo === 'item')

    if (raiz.tipo === 'genero' && grupos.length > 0) {
      return {
        ...raiz,
        grupos: grupos.map(g => ({
          label: g.label,
          slug: g.slug,
          itens: dbItems.filter(i => i.pai_slug === g.slug).map(i => ({ label: i.label, slug: i.slug }))
        }))
      }
    }

    return {
      ...raiz,
      itens: itensDirectos.map(i => ({ label: i.label, slug: i.slug }))
    }
  })
}

// Fallback estático (usado enquanto banco não carrega)
export const CATEGORIAS: Categoria[] = [
  {
    label: 'Roupas', slug: 'roupas', tipo: 'genero',
    grupos: [
      { label: 'Feminino', slug: 'feminino', itens: [
        { label: 'Vestidos', slug: 'vestidos' }, { label: 'Blusas', slug: 'blusas' },
        { label: 'Calças', slug: 'calcas-fem' }, { label: 'Saias', slug: 'saias' },
        { label: 'Shorts', slug: 'shorts-fem' }, { label: 'Casacos', slug: 'casacos-fem' },
        { label: 'Macacão', slug: 'macacao' }, { label: 'Lingerie', slug: 'lingerie' },
        { label: 'Conjuntos', slug: 'conjuntos' },
      ]},
      { label: 'Masculino', slug: 'masculino', itens: [
        { label: 'Calças', slug: 'calcas-masc' }, { label: 'Camisas', slug: 'camisas' },
        { label: 'Camisetas', slug: 'camisetas-masc' }, { label: 'Short e Bermuda', slug: 'short-bermuda' },
        { label: 'Casacos', slug: 'casacos-masc' },
      ]},
      { label: 'Infantil', slug: 'infantil', itens: [
        { label: 'Calças', slug: 'calcas-infantil' }, { label: 'Camiseta', slug: 'camiseta-infantil' },
        { label: 'Casacos', slug: 'casacos-infantil' }, { label: 'Pijamas', slug: 'pijamas-infantil' },
        { label: 'Variadas', slug: 'variadas-infantil' },
      ]},
    ],
  },
  {
    label: 'Bolsas', slug: 'bolsas', tipo: 'marca',
    itens: [
      { label: 'Louis Vuitton', slug: 'louis-vuitton' }, { label: 'Chanel', slug: 'chanel' },
      { label: 'Gucci', slug: 'gucci' }, { label: 'Prada', slug: 'prada' },
      { label: 'Hermès', slug: 'hermes' }, { label: 'Dior', slug: 'dior' },
      { label: 'Santa Lolla', slug: 'santa-lolla' }, { label: 'Schutz', slug: 'schutz' },
      { label: 'Mônica Sanches', slug: 'monica-sanches' }, { label: 'Tommy Hilfiger', slug: 'tommy-hilfiger' },
      { label: 'Luz da Lua', slug: 'luz-da-lua' }, { label: 'Guess', slug: 'guess' },
      { label: 'Arezzo', slug: 'arezzo' }, { label: 'Burberry', slug: 'burberry' },
      { label: 'Outras Marcas', slug: 'outras-marcas' },
    ],
  },
  {
    label: 'Calçados', slug: 'calcados', tipo: 'genero',
    grupos: [
      { label: 'Feminino', slug: 'feminino', itens: [
        { label: 'Scarpin', slug: 'scarpin' }, { label: 'Sandália', slug: 'sandalia' },
        { label: 'Bota', slug: 'bota' }, { label: 'Sapatilha', slug: 'sapatilha' },
        { label: 'Mule', slug: 'mule' }, { label: 'Sneaker', slug: 'sneaker' },
        { label: 'Rasteirinha', slug: 'rasteirinha' }, { label: 'Sapato Social', slug: 'sapato-social' },
        { label: 'Tênis', slug: 'tenis-fem' },
      ]},
      { label: 'Masculino', slug: 'masculino', itens: [
        { label: 'Sapatos', slug: 'sapatos-masc' }, { label: 'Tênis', slug: 'tenis-masc' },
        { label: 'Botas', slug: 'botas-masc' },
      ]},
      { label: 'Infantil', slug: 'infantil', itens: [
        { label: 'Tênis', slug: 'tenis-infantil' }, { label: 'Sapatos', slug: 'sapatos-infantil' },
        { label: 'Sandálias', slug: 'sandalias-infantil' }, { label: 'Chinelos', slug: 'chinelos-infantil' },
      ]},
    ],
  },
  {
    label: 'Acessórios', slug: 'acessorios', tipo: 'subcategoria',
    itens: [
      { label: 'Cintos', slug: 'cintos' }, { label: 'Carteiras', slug: 'carteiras' },
      { label: 'Óculos', slug: 'oculos' }, { label: 'Bijuterias', slug: 'bijuterias' },
      { label: 'Relógios', slug: 'relogios' }, { label: 'Lenços', slug: 'lencos' },
      { label: 'Chapéus', slug: 'chapeus' }, { label: 'Perfumes', slug: 'perfumes' },
    ],
  },
]

export function getCategoriaIcon(slug: string): string {
  const icons: Record<string, string> = {
    roupas: '👗', bolsas: '👜', calcados: '👠', acessorios: '💍',
  }
  return icons[slug] || '✿'
}
'''

with open(menu_config, 'w', encoding='utf-8', newline='\n') as f:
    f.write(novo_menu)
print('OK: menuConfig.ts atualizado com buildCategorias')

# ── Atualiza Header para buscar categorias do banco ──────────
header_path = os.path.join(base, 'src', 'components', 'layout', 'Header.tsx')

with open(header_path, 'r', encoding='utf-8') as f:
    h = f.read()

# Atualiza import para incluir buildCategorias e CATS_RAIZ
h = h.replace(
    "import { CATEGORIAS, getCategoriaIcon } from '../../lib/menuConfig'",
    "import { CATEGORIAS, buildCategorias, getCategoriaIcon, Categoria } from '../../lib/menuConfig'"
)

# Adiciona estado de categorias dinâmicas e fetch
if 'categoriasMenu' not in h:
    h = h.replace(
        "  const [megaAberto, setMegaAberto] = useState<string | null>(null)",
        """  const [categoriasMenu, setCategoriasMenu] = useState<Categoria[]>(CATEGORIAS)
  const [megaAberto, setMegaAberto] = useState<string | null>(null)"""
    )

    # Adiciona fetch de categorias no useEffect do freteGratis
    h = h.replace(
        """  useEffect(() => {
    fetch('/api/site-config', { cache: 'no-store' })
      .then(r => r.json())
      .then(d => { if (d.data?.frete_gratis_acima) setFreteGratis(Number(d.data.frete_gratis_acima)) })
      .catch(() => {})
  }, [])""",
        """  useEffect(() => {
    fetch('/api/site-config', { cache: 'no-store' })
      .then(r => r.json())
      .then(d => { if (d.data?.frete_gratis_acima) setFreteGratis(Number(d.data.frete_gratis_acima)) })
      .catch(() => {})
    fetch('/api/categorias-loja')
      .then(r => r.json())
      .then(d => { if (d.data?.length) setCategoriasMenu(buildCategorias(d.data)) })
      .catch(() => {})
  }, [])"""
    )

    # Substitui CATEGORIAS por categoriasMenu nos maps do Header
    h = h.replace(
        "              {CATEGORIAS.map(cat => (",
        "              {categoriasMenu.map(cat => ("
    )
    h = h.replace(
        "            {CATEGORIAS.map(cat => (",
        "            {categoriasMenu.map(cat => ("
    )
    print('OK: Header atualizado para buscar categorias do banco')
else:
    print('OK: Header ja tem categoriasMenu')

with open(header_path, 'w', encoding='utf-8', newline='\n') as f:
    f.write(h)

print()
print('Rode agora:')
print('  git add .')
print('  git commit -m "Header: categorias dinamicas do banco"')
print('  git push')
