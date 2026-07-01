// GreenWeb Softwares - Brechó de Luxo
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
