// Configuração central de SEO do Brechó de Luxo
export const SEO_CONFIG = {
  siteName: 'Brechó de Luxo',
  siteUrl: 'https://brechodluxo.com.br',
  defaultTitle: 'Brechó de Luxo — Moda Premium em Jundiaí, SP',
  defaultDescription: 'Brechó de Luxo em Jundiaí-SP. Bolsas, roupas, calçados e acessórios de marcas premium com autenticidade garantida. Moda circular de luxo para São Paulo e região de Campinas.',
  keywords: [
    'brechó de luxo',
    'brecho de luxo',
    'brechó',
    'moda circular',
    'moda de luxo',
    'moda premium',
    'bolsas de luxo',
    'calçados de luxo',
    'acessórios de luxo',
    'roupas de luxo',
    'peças únicas',
    'brechó Jundiaí',
    'brechó São Paulo',
    'brechó Campinas',
    'segunda mão luxo',
    'Louis Vuitton segunda mão',
    'Chanel segunda mão',
    'Gucci segunda mão',
    'bolsas premium',
    'moda sustentável',
  ].join(', '),
  locale: 'pt_BR',
  twitterHandle: '@brechodeluxo',
  ogImage: 'https://brechodluxo.com.br/og-image.jpg',
}

export const PAGES_SEO: Record<string, { title: string; description: string; keywords?: string }> = {
  home: {
    title: 'Brechó de Luxo Jundiaí | Bolsas, Roupas e Acessórios Premium',
    description: 'O melhor brechó de luxo de Jundiaí-SP. Peças autênticas de Louis Vuitton, Chanel, Gucci e mais. Moda circular premium para São Paulo e região de Campinas. Frete grátis acima de R$299.',
    keywords: 'brechó de luxo Jundiaí, brecho de luxo SP, bolsas Louis Vuitton usadas, moda circular luxo',
  },
  loja: {
    title: 'Loja | Brechó de Luxo — Peças Premium Selecionadas',
    description: 'Explore nossa coleção de bolsas, roupas, calçados e acessórios de luxo. Peças únicas de marcas premium com autenticidade garantida. Entrega para todo o Brasil.',
    keywords: 'loja brechó luxo, bolsas segunda mão, roupas premium, calçados luxo, acessórios marcas',
  },
  bolsas: {
    title: 'Bolsas de Luxo | Brechó de Luxo Jundiaí',
    description: 'Bolsas autênticas de Louis Vuitton, Chanel, Gucci, Prada, Hermès e outras marcas premium. Segunda mão com autenticidade certificada em Jundiaí-SP.',
    keywords: 'bolsas de luxo, bolsas Louis Vuitton, bolsas Chanel, bolsas Gucci, bolsas segunda mão Jundiaí',
  },
  roupas: {
    title: 'Roupas de Luxo | Brechó de Luxo — Moda Premium',
    description: 'Vestidos, blusas, calças e muito mais de marcas premium. Roupas femininas, masculinas e infantis de luxo com qualidade garantida.',
    keywords: 'roupas de luxo, vestidos premium, moda feminina luxo, roupas segunda mão',
  },
  calcados: {
    title: 'Calçados de Luxo | Brechó de Luxo Jundiaí',
    description: 'Scarpin, sandálias, botas, sneakers e mais de marcas premium. Calçados femininos, masculinos e infantis de luxo.',
    keywords: 'calçados de luxo, sapatos premium, scarpin luxo, botas grife',
  },
  acessorios: {
    title: 'Acessórios de Luxo | Brechó de Luxo',
    description: 'Cintos, carteiras, óculos, joias, relógios e perfumes de marcas premium. Acessórios autênticos com preços acessíveis.',
    keywords: 'acessórios de luxo, cintos premium, relógios segunda mão, óculos grife',
  },
  sobre: {
    title: 'Sobre Nós | Brechó de Luxo — Nossa História',
    description: 'Conheça o Brechó de Luxo de Jundiaí-SP. Nossa missão é democratizar o acesso à moda premium através da moda circular sustentável.',
    keywords: 'sobre brechó de luxo, moda circular Jundiaí, sustentabilidade moda',
  },
  contato: {
    title: 'Contato | Brechó de Luxo Jundiaí',
    description: 'Entre em contato com o Brechó de Luxo de Jundiaí-SP. WhatsApp, Instagram e e-mail disponíveis. Atendemos São Paulo e região de Campinas.',
    keywords: 'contato brechó luxo Jundiaí, WhatsApp brechó luxo',
  },
  blog: {
    title: 'Blog | Brechó de Luxo — Dicas de Moda e Estilo',
    description: 'Dicas de moda, tendências, cuidados com peças de luxo e muito mais. O blog do Brechó de Luxo de Jundiaí-SP.',
    keywords: 'blog moda luxo, dicas moda circular, tendências luxo, cuidados bolsas grife',
  },
  conta: {
    title: 'Minha Conta | Brechó de Luxo',
    description: 'Acesse sua conta no Brechó de Luxo. Acompanhe seus pedidos, favoritos e configurações.',
    keywords: 'minha conta brechó luxo, pedidos brechó',
  },
}
