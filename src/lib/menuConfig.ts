// Estrutura de categorias e subcategorias do Brechó de Luxo
// Usado no Header (mega menu) e na página /loja (filtros)

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
          { label: 'Calças', slug: 'calcas-fem' },
          { label: 'Saias', slug: 'saias' },
          { label: 'Shorts', slug: 'shorts-fem' },
          { label: 'Casacos', slug: 'casacos-fem' },
          { label: 'Macacão', slug: 'macacao' },
          { label: 'Lingerie', slug: 'lingerie' },
          { label: 'Conjuntos', slug: 'conjuntos' },
        ],
      },
      {
        label: 'Masculino',
        slug: 'masculino',
        itens: [
          { label: 'Calças', slug: 'calcas-masc' },
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
          { label: 'Calças', slug: 'calcas-infantil' },
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
      { label: 'Hermès', slug: 'hermes' },
      { label: 'Dior', slug: 'dior' },
      { label: 'Santa Lolla', slug: 'santa-lolla' },
      { label: 'Schutz', slug: 'schutz' },
      { label: 'Mônica Sanches', slug: 'monica-sanches' },
      { label: 'Tommy Hilfiger', slug: 'tommy-hilfiger' },
      { label: 'Luz da Lua', slug: 'luz-da-lua' },
      { label: 'Guess', slug: 'guess' },
      { label: 'Arezzo', slug: 'arezzo' },
      { label: 'Burberry', slug: 'burberry' },
      { label: 'Outras Marcas', slug: 'outras-marcas' },
    ],
  },
  {
    label: 'Calçados',
    slug: 'calcados',
    tipo: 'genero',
    grupos: [
      {
        label: 'Feminino',
        slug: 'feminino',
        itens: [
          { label: 'Scarpin', slug: 'scarpin' },
          { label: 'Sandália', slug: 'sandalia' },
          { label: 'Bota', slug: 'bota' },
          { label: 'Sapatilha', slug: 'sapatilha' },
          { label: 'Mule', slug: 'mule' },
          { label: 'Sneaker', slug: 'sneaker' },
          { label: 'Rasteirinha', slug: 'rasteirinha' },
          { label: 'Sapato Social', slug: 'sapato-social' },
          { label: 'Tênis', slug: 'tenis-fem' },
        ],
      },
      {
        label: 'Masculino',
        slug: 'masculino',
        itens: [
          { label: 'Sapatos', slug: 'sapatos-masc' },
          { label: 'Tênis', slug: 'tenis-masc' },
          { label: 'Botas', slug: 'botas-masc' },
        ],
      },
      {
        label: 'Infantil',
        slug: 'infantil',
        itens: [
          { label: 'Tênis', slug: 'tenis-infantil' },
          { label: 'Sapatos', slug: 'sapatos-infantil' },
          { label: 'Sandálias', slug: 'sandalias-infantil' },
          { label: 'Chinelos', slug: 'chinelos-infantil' },
        ],
      },
    ],
  },
  {
    label: 'Acessórios',
    slug: 'acessorios',
    tipo: 'subcategoria',
    itens: [
      { label: 'Cintos', slug: 'cintos' },
      { label: 'Carteiras', slug: 'carteiras' },
      { label: 'Óculos', slug: 'oculos' },
      { label: 'Bijuterias', slug: 'bijuterias' },
      { label: 'Relógios', slug: 'relogios' },
      { label: 'Lenços', slug: 'lencos' },
      { label: 'Chapéus', slug: 'chapeus' },
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
