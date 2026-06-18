// Estrutura de categorias e subcategorias do Brecho de Luxo
// Usado no Header (mega menu) e na pagina /loja (filtros)

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

export const CATEGORIAS: Categoria[] = [
  {
    label: 'Roupas',
    slug: 'roupas',
    tipo: 'genero',
    grupos: [
      {
        label: 'Feminino',
        slug: 'feminino',
        itens: [
          { label: 'Vestidos', slug: 'vestidos' },
          { label: 'Blusas', slug: 'blusas' },
          { label: 'Calcas', slug: 'calcas-fem' },
          { label: 'Saias', slug: 'saias' },
          { label: 'Shorts', slug: 'shorts-fem' },
          { label: 'Casacos', slug: 'casacos-fem' },
          { label: 'Macacao', slug: 'macacao' },
          { label: 'Lingerie', slug: 'lingerie' },
          { label: 'Conjuntos', slug: 'conjuntos' },
        ],
      },
      {
        label: 'Masculino',
        slug: 'masculino',
        itens: [
          { label: 'Calcas', slug: 'calcas-masc' },
          { label: 'Camisas', slug: 'camisas' },
          { label: 'Camisetas', slug: 'camisetas-masc' },
          { label: 'Short e Bermuda', slug: 'short-bermuda' },
          { label: 'Casacos', slug: 'casacos-masc' },
        ],
      },
      {
        label: 'Infantil',
        slug: 'infantil',
        itens: [
          { label: 'Calcas', slug: 'calcas-infantil' },
          { label: 'Camiseta', slug: 'camiseta-infantil' },
          { label: 'Casacos', slug: 'casacos-infantil' },
          { label: 'Pijamas', slug: 'pijamas-infantil' },
          { label: 'Variadas', slug: 'variadas-infantil' },
        ],
      },
    ],
  },
  {
    label: 'Bolsas',
    slug: 'bolsas',
    tipo: 'marca',
    itens: [
      { label: 'Louis Vuitton', slug: 'louis-vuitton' },
      { label: 'Chanel', slug: 'chanel' },
      { label: 'Gucci', slug: 'gucci' },
      { label: 'Prada', slug: 'prada' },
      { label: 'Hermes', slug: 'hermes' },
      { label: 'Dior', slug: 'dior' },
      { label: 'Santa Lolla', slug: 'santa-lolla' },
      { label: 'Schutz', slug: 'schutz' },
      { label: 'Monica Sanches', slug: 'monica-sanches' },
      { label: 'Tommy Hilfiger', slug: 'tommy-hilfiger' },
      { label: 'Luz da Lua', slug: 'luz-da-lua' },
      { label: 'Guess', slug: 'guess' },
      { label: 'Arezzo', slug: 'arezzo' },
      { label: 'Burberry', slug: 'burberry' },
    ],
  },
  {
    label: 'Calcados',
    slug: 'calcados',
    tipo: 'genero',
    grupos: [
      {
        label: 'Feminino',
        slug: 'feminino',
        itens: [
          { label: 'Scarpin', slug: 'scarpin' },
          { label: 'Sandalia', slug: 'sandalia' },
          { label: 'Bota', slug: 'bota' },
          { label: 'Sapatilha', slug: 'sapatilha' },
          { label: 'Mule', slug: 'mule' },
          { label: 'Sneaker', slug: 'sneaker' },
          { label: 'Rasteirinha', slug: 'rasteirinha' },
          { label: 'Sapato Social', slug: 'sapato-social' },
          { label: 'Tenis', slug: 'tenis-fem' },
        ],
      },
      {
        label: 'Masculino',
        slug: 'masculino',
        itens: [
          { label: 'Sapatos', slug: 'sapatos-masc' },
          { label: 'Tenis', slug: 'tenis-masc' },
          { label: 'Botas', slug: 'botas-masc' },
        ],
      },
      {
        label: 'Infantil',
        slug: 'infantil',
        itens: [
          { label: 'Tenis', slug: 'tenis-infantil' },
          { label: 'Sapatos', slug: 'sapatos-infantil' },
          { label: 'Sandalias', slug: 'sandalias-infantil' },
          { label: 'Chinelos', slug: 'chinelos-infantil' },
        ],
      },
    ],
  },
  {
    label: 'Acessorios',
    slug: 'acessorios',
    tipo: 'subcategoria',
    itens: [
      { label: 'Cintos', slug: 'cintos' },
      { label: 'Carteiras', slug: 'carteiras' },
      { label: 'Oculos', slug: 'oculos' },
      { label: 'Bijuterias', slug: 'bijuterias' },
      { label: 'Relogios', slug: 'relogios' },
      { label: 'Lencos', slug: 'lencos' },
      { label: 'Chapeus', slug: 'chapeus' },
      { label: 'Perfumes', slug: 'perfumes' },
    ],
  },
]

export function getCategoriaIcon(slug: string): string {
  const icons: Record<string, string> = {
    roupas: '👗', bolsas: '👜', calcados: '👠', acessorios: '💍',
  }
  return icons[slug] || '✨'
}
