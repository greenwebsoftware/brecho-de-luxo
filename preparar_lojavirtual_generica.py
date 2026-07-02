"""
GreenWeb Softwares
Preparador da Versão Genérica — Loja Virtual v1.0.1
=====================================================
Remove todas as referências ao Brechó de Luxo e
parametriza o código com variáveis de ambiente.
Execute antes de gerar o instalador.
Comando: python preparar_lojavirtual_generica.py
"""

import os, re

DESTINO = r"C:\GreenWeb\LojaVirtual"

def titulo(t):
    print()
    print("=" * 60)
    print(f"  {t}")
    print("=" * 60)

def ok(m):   print(f"  [OK] {m}")
def aviso(m): print(f"  [AVISO] {m}")

def editar(caminho, substituicoes):
    if not os.path.isfile(caminho):
        aviso(f"Arquivo nao encontrado: {caminho}")
        return
    with open(caminho, 'r', encoding='utf-8') as f:
        c = f.read()
    original = c
    for antigo, novo in substituicoes:
        c = c.replace(antigo, novo)
    if c != original:
        with open(caminho, 'w', encoding='utf-8', newline='\n') as f:
            f.write(c)
        ok(os.path.basename(caminho))
    else:
        aviso(f"Sem alteracoes: {os.path.basename(caminho)}")

# ── 1. layout.tsx — metadados e JSON-LD ──────────────────────
titulo("1. layout.tsx — metadados e JSON-LD")

layout = os.path.join(DESTINO, 'src', 'app', 'layout.tsx')
editar(layout, [
    # Titulo
    ("Brechó de Luxo Jundiaí | Bolsas, Roupas e Acessórios Premium",
     "process.env.NEXT_PUBLIC_LOJA_NOME || 'Loja Virtual'"),
    ("Brechó de Luxo",
     "process.env.NEXT_PUBLIC_LOJA_NOME || 'Loja Virtual'"),
    # Descrição
    ("O melhor brechó de luxo de Jundiaí-SP. Peças autênticas de Louis Vuitton, Chanel, Gucci e mais. Moda circular premium para São Paulo e região de Campinas. Frete grátis acima de R$299.",
     "process.env.NEXT_PUBLIC_LOJA_DESCRICAO || 'Loja virtual com produtos selecionados. Qualidade garantida e entrega para todo o Brasil.'"),
    # Keywords
    ("'brechó de luxo', 'brecho de luxo', 'brechó', 'moda circular', 'moda de luxo',\n    'moda premium', 'bolsas de luxo', 'calçados de luxo', 'acessórios de luxo',\n    'roupas de luxo', 'peças únicas', 'brechó Jundiaí', 'brechó São Paulo',\n    'brechó Campinas', 'segunda mão luxo', 'Louis Vuitton segunda mão',",
     "'loja virtual', 'compras online', 'produtos', 'loja online',"),
    # JSON-LD Organization
    ("'Brechó de Luxo'", "process.env.NEXT_PUBLIC_LOJA_NOME || 'Loja Virtual'"),
    ("'contato@brechodluxo.com.br'", "process.env.NEXT_PUBLIC_LOJA_EMAIL || ''"),
    ("'https://brechodluxo.com.br'", "process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001'"),
    ("'Brechó especializado em peças premium de marcas internacionais. Bolsas, roupas, calçados e acessórios com autenticidade garantida.'",
     "process.env.NEXT_PUBLIC_LOJA_DESCRICAO || 'Loja virtual com produtos selecionados.'"),
    ("'https://www.instagram.com/brechodeluxo.20'", "''"),
    ("'https://www.tiktok.com/@brechodeluxo.20'", "''"),
    # hasOfferCatalog
    ("name: 'Peças de Luxo'", "name: process.env.NEXT_PUBLIC_LOJA_NOME || 'Produtos'"),
    ("{ '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Bolsas de Luxo' } },",
     "{ '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Categoria 1' } },"),
    ("{ '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Roupas de Luxo' } },",
     "{ '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Categoria 2' } },"),
    ("{ '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Calcados de Luxo' } },",
     "{ '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Categoria 3' } },"),
    ("{ '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Acessorios de Luxo' } },",
     "{ '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Categoria 4' } },"),
    # Localização Jundiaí
    ("postalCode: '13201-032'", "postalCode: ''"),
    ("latitude: -23.1857", "latitude: 0"),
    ("longitude: -46.8975", "longitude: 0"),
    ("'Jundiaí'", "''"),
    ("'SP'", "''"),
    # Moda circular
    ("'Moda circular premium em Jundiaí-SP'",
     "process.env.NEXT_PUBLIC_LOJA_DESCRICAO || 'Loja Virtual'"),
])

# ── 2. page.tsx (home) ────────────────────────────────────────
titulo("2. src/app/page.tsx — página inicial")

home = os.path.join(DESTINO, 'src', 'app', 'page.tsx')
editar(home, [
    ("Moda de Luxo", "Bem-vindo à Nossa Loja"),
    ("Peças autênticas de marcas premium cuidadosamente selecionadas. Qualidade garantida, preço acessível.",
     "Produtos selecionados com qualidade garantida. Encontre o que você procura."),
    ("Chegadas Recentes", "Produtos em Destaque"),
    ("Explore por Categoria", "Nossas Categorias"),
    ("Cada peça é selecionada com carinho para garantir qualidade e autenticidade.",
     "Produtos selecionados com qualidade garantida."),
    ("{ icon: Shield, titulo: 'Autenticidade Garantida', desc: 'Todas as peças são verificadas e certificadas' },",
     "{ icon: Shield, titulo: 'Qualidade Garantida', desc: 'Todos os produtos são verificados antes do envio' },"),
    ("{ icon: Star, titulo: 'Peças Únicas', desc: 'Coleção exclusiva e curada com cuidado' },",
     "{ icon: Star, titulo: 'Produtos Exclusivos', desc: 'Seleção cuidadosa para você' },"),
    ("{ nome: 'Ana C.', texto: 'Comprei uma bolsa incrível! Autenticidade verificada e entrega rápida.', nota: 5 },",
     "{ nome: 'Ana C.', texto: 'Produto excelente! Entrega rápida e qualidade garantida.', nota: 5 },"),
    ("{ nome: 'Patrícia M.', texto: 'Atendimento excelente! Qualidade acima da esperada para o preço.', nota: 5 },",
     "{ nome: 'Patrícia M.', texto: 'Atendimento excelente! Superou minhas expectativas.', nota: 5 },"),
    ("{ nome: 'Fernanda S.', texto: 'Site fácil de navegar e produto chegou exatamente como mostrado.', nota: 5 },",
     "{ nome: 'Fernanda S.', texto: 'Site fácil de usar e produto chegou exatamente como mostrado.', nota: 5 },"),
])

# ── 3. Footer ─────────────────────────────────────────────────
titulo("3. Footer.tsx")

footer = os.path.join(DESTINO, 'src', 'components', 'layout', 'Footer.tsx')
editar(footer, [
    ("Fique por dentro das novidades",
     "Fique por dentro das novidades"),
    ("Receba em primeira mão as novidades e ofertas exclusivas",
     "Receba em primeira mão as novidades e ofertas exclusivas"),
    ("Peças de moda de luxo cuidadosamente selecionadas com qualidade garantida.",
     "Produtos selecionados com qualidade garantida para você."),
    ("© 2026 Brechó de Luxo. Todos os direitos reservados.",
     "© 2026 {process.env.NEXT_PUBLIC_LOJA_NOME || 'Loja Virtual'}. Todos os direitos reservados."),
    ("['Roupas', '/loja?cat=roupas'], ['Acessórios', '/loja?cat=acessorios'],",
     "['Categoria 1', '/loja?cat=categoria-1'], ['Categoria 2', '/loja?cat=categoria-2'],"),
])

# ── 4. Header ─────────────────────────────────────────────────
titulo("4. Header.tsx")

header = os.path.join(DESTINO, 'src', 'components', 'layout', 'Header.tsx')
editar(header, [
    ("alt=\"Brechó de Luxo\"", "alt={process.env.NEXT_PUBLIC_LOJA_NOME || 'Loja Virtual'}"),
    ("Buscar por marca", "Buscar por subcategoria"),
])

# ── 5. Sobre ──────────────────────────────────────────────────
titulo("5. sobre/page.tsx")

sobre = os.path.join(DESTINO, 'src', 'app', 'sobre', 'page.tsx')
editar(sobre, [
    ("Uma paixão por moda de luxo que se transformou em um negócio com propósito",
     "Nossa história e missão"),
    ("O Brechó de Luxo nasceu da paixão por moda e da crença de que peças de qualidade\n              merecem uma segunda chance. Fundado com o objetivo de democratizar o acesso à",
     "Nossa loja nasceu com o objetivo de oferecer produtos de qualidade com"),
    ("Mais que um brechó — uma curadoria de luxo",
     "Conheça nossa história"),
    ("Todas as nossas peças passam por um rigoroso processo de verificação de\n              autenticidade antes de chegar até você. Acreditamos que moda sustentável",
     "Todos os nossos produtos passam por um rigoroso processo de verificação de\n              qualidade antes de chegar até você."),
    ("{ Icon: Heart, titulo: 'Sustentabilidade', desc: 'Moda circular para um planeta mais saudável' },",
     "{ Icon: Heart, titulo: 'Compromisso', desc: 'Comprometidos com a satisfação dos nossos clientes' },"),
    ("{ Icon: Award, titulo: 'Exclusividade', desc: 'Coleção curada com peças únicas e especiais' },",
     "{ Icon: Award, titulo: 'Exclusividade', desc: 'Produtos selecionados com cuidado para você' },"),
    ("Explore nossa coleção e descubra peças incríveis esperando por você",
     "Explore nossa loja e descubra produtos incríveis esperando por você"),
])

# ── 6. Blog ───────────────────────────────────────────────────
titulo("6. blog/page.tsx")

blog = os.path.join(DESTINO, 'src', 'app', 'blog', 'page.tsx')
editar(blog, [
    ("Dicas de moda, tendências, cuidados com peças de luxo e muito mais. Participe e compartilhe sua visão!",
     "Novidades, dicas e conteúdo exclusivo. Participe e compartilhe sua visão!"),
    ("Brechó de Luxo", "${process.env.NEXT_PUBLIC_LOJA_NOME || 'Nossa Loja'}"),
])

# ── 7. Contato ────────────────────────────────────────────────
titulo("7. contato/page.tsx")

contato = os.path.join(DESTINO, 'src', 'app', 'contato', 'page.tsx')
editar(contato, [
    ("contato@brechodeluxo.com.br", "${process.env.NEXT_PUBLIC_LOJA_EMAIL || 'contato@minhaloja.com.br'}"),
    ("brechodeluxo", "${process.env.NEXT_PUBLIC_LOJA_INSTAGRAM || 'minhaloja'}"),
])

# ── 8. WhatsApp Float ─────────────────────────────────────────
titulo("8. WhatsAppFloat.tsx")

wpp = os.path.join(DESTINO, 'src', 'components', 'layout', 'WhatsAppFloat.tsx')
editar(wpp, [
    ("Vim pelo site do Brecho de Luxo",
     "Vim pelo site da loja"),
])

# ── 9. SEO Config ─────────────────────────────────────────────
titulo("9. lib/seoConfig.ts")

seo = os.path.join(DESTINO, 'src', 'lib', 'seoConfig.ts')
editar(seo, [
    ("'Brechó de Luxo — Moda Premium em Jundiaí, SP'",
     "process.env.NEXT_PUBLIC_LOJA_NOME || 'Loja Virtual'"),
    ("'https://brechodluxo.com.br'",
     "process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001'"),
    ("'@brechodeluxo'", "''"),
    ("'https://brechodluxo.com.br/og-image.jpg'", "''"),
])

# ── 10. SQL — categorias genéricas ───────────────────────────
titulo("10. Atualizando SQL do instalador com categorias genéricas")
print("  (será aplicado no proximo gerar_instalador_lojavirtual.py)")

# ── 11. menuConfig — categorias genéricas ────────────────────
titulo("11. lib/menuConfig.ts — categorias genéricas")

menu = os.path.join(DESTINO, 'src', 'lib', 'menuConfig.ts')
editar(menu, [
    ("{ label: 'Roupas',    slug: 'roupas',    tipo: 'genero',      icone: '👗' },",
     "{ label: 'Categoria 1', slug: 'categoria-1', tipo: 'subcategoria', icone: '📦' },"),
    ("{ label: 'Bolsas',    slug: 'bolsas',    tipo: 'marca',       icone: '👜' },",
     "{ label: 'Categoria 2', slug: 'categoria-2', tipo: 'subcategoria', icone: '🛍️' },"),
    ("{ label: 'Calçados',  slug: 'calcados',  tipo: 'genero',      icone: '👠' },",
     "{ label: 'Categoria 3', slug: 'categoria-3', tipo: 'subcategoria', icone: '⭐' },"),
    ("{ label: 'Acessórios',slug: 'acessorios',tipo: 'subcategoria',icone: '💍' },",
     "{ label: 'Categoria 4', slug: 'categoria-4', tipo: 'subcategoria', icone: '✨' },"),
])

# ── 12. GeradorConteudo — hashtags ────────────────────────────
titulo("12. GeradorConteudo.tsx — hashtags genéricas")

gerador = os.path.join(DESTINO, 'src', 'components', 'GeradorConteudo.tsx')
editar(gerador, [
    ("'#brechodeluxo', '#brechó', '#modaCircular', '#modaSustentavel',\n  '#luxoAcessivel', '#pecasUnicas', '#segundaMao', '#moda', '#estilo',",
     "'#loja', '#compras', '#produtos', '#lojavirtual', '#oferta',"),
    ("bolsas: ['#bolsas', '#bolsasdeluxo', '#handbag', '#louisvuitton', '#chanel', '#bolsasegundamao'],",
     "categoria1: ['#produtos', '#loja', '#compras'],"),
    ("acessorios: ['#acessorios', '#joias', '#relogios', '#oculos', '#acessoriosfemininos'],",
     "categoria2: ['#novidades', '#oferta', '#lojavirtual'],"),
    ("Vim pelo site do Brecho de Luxo", "Vim pelo site da loja"),
    ("brechodluxo.com.br", "${process.env.NEXT_PUBLIC_SITE_URL || 'minhaloja.com.br'}"),
    ("#brechodeluxo", "#lojavirtual"),
])

# ── 13. next.config.js ───────────────────────────────────────
titulo("13. next.config.js — remove dominio Brechó")
cfg = os.path.join(DESTINO, 'next.config.js')
editar(cfg, [
    ("{ protocol: 'https', hostname: 'spdwesjpyfukmdhgiudx.supabase.co' },",
     "{ protocol: 'https', hostname: '**.supabase.co' },"),
])

# ── 14. robots.txt e sitemap ─────────────────────────────────
titulo("14. robots.txt e sitemap.xml")

robots = os.path.join(DESTINO, 'src', 'app', 'robots.txt', 'route.ts')
editar(robots, [
    ("https://brechodluxo.com.br/sitemap.xml",
     "${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001'}/sitemap.xml"),
])

sitemap = os.path.join(DESTINO, 'src', 'app', 'sitemap.xml', 'route.ts')
editar(sitemap, [
    ("'https://brechodluxo.com.br'",
     "process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001'"),
])

# ── Resumo ────────────────────────────────────────────────────
titulo("CONCLUÍDO!")
print()
print("  Versão genérica preparada em C:\\GreenWeb\\LojaVirtual")
print()
print("  Próximo passo:")
print("    python gerar_instalador_lojavirtual.py")
print()
