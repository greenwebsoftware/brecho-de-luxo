import os, re

base = os.path.dirname(os.path.abspath(__file__))

# 1. Adiciona Blog no Header (depois de "Contato")
header_fp = os.path.join(base, 'src', 'components', 'layout', 'Header.tsx')
with open(header_fp, 'r', encoding='utf-8') as f:
    c = f.read()

# Adiciona Blog no menu desktop (depois do link Contato)
if '/blog' not in c:
    c = c.replace(
        '''<Link href="/contato" className="text-sm font-medium text-gray-700 hover:text-gold-600 transition-colors px-3 py-2">
                Contato
              </Link>''',
        '''<Link href="/contato" className="text-sm font-medium text-gray-700 hover:text-gold-600 transition-colors px-3 py-2">
                Contato
              </Link>
              <Link href="/blog" className="text-sm font-medium text-gray-700 hover:text-gold-600 transition-colors px-3 py-2">
                Blog
              </Link>'''
    )
    # Adiciona Blog no menu mobile (depois do link Contato mobile)
    c = c.replace(
        '''<Link href="/contato" onClick={() => setMenuAberto(false)}
              className="block px-6 py-3 text-sm text-gray-700 hover:bg-gold-50 border-b border-gray-50">
              Contato
            </Link>''',
        '''<Link href="/contato" onClick={() => setMenuAberto(false)}
              className="block px-6 py-3 text-sm text-gray-700 hover:bg-gold-50 border-b border-gray-50">
              Contato
            </Link>
            <Link href="/blog" onClick={() => setMenuAberto(false)}
              className="block px-6 py-3 text-sm text-gray-700 hover:bg-gold-50 border-b border-gray-50">
              Blog
            </Link>'''
    )
    with open(header_fp, 'w', encoding='utf-8', newline='\n') as f:
        f.write(c)
    print('OK: Blog adicionado no Header')
else:
    print('OK: Blog ja existe no Header')

# 2. Adiciona ContadorVisitas no Footer
footer_fp = os.path.join(base, 'src', 'components', 'layout', 'Footer.tsx')
with open(footer_fp, 'r', encoding='utf-8') as f:
    c = f.read()

if 'ContadorVisitas' not in c:
    # Adiciona import
    c = c.replace(
        "import Link from 'next/link'",
        "import Link from 'next/link'\nimport ContadorVisitas from '../ContadorVisitas'"
    )
    # Adiciona no rodape junto com o copyright
    c = c.replace(
        '<span>© 2026 Brechó de Luxo. Todos os direitos reservados.</span>',
        '<span>© 2026 Brechó de Luxo. Todos os direitos reservados.</span>\n          <ContadorVisitas />'
    )
    with open(footer_fp, 'w', encoding='utf-8', newline='\n') as f:
        f.write(c)
    print('OK: ContadorVisitas adicionado no Footer')
else:
    print('OK: ContadorVisitas ja existe no Footer')

# 3. Adiciona ContadorVisitas e link Blog na Home
home_fp = os.path.join(base, 'src', 'app', 'page.tsx')
with open(home_fp, 'r', encoding='utf-8') as f:
    c = f.read()

if 'ContadorVisitas' not in c:
    # Adiciona import
    c = c.replace(
        "import Link from 'next/link'",
        "import Link from 'next/link'\nimport ContadorVisitas from '../components/ContadorVisitas'"
    )
    # Adiciona contador na secao de metricas do hero
    c = c.replace(
        '<div className="w-px h-10 bg-white/20" />\n              <div className="text-center">\n                <div className="text-2xl font-bold text-gold-400">2k+</div>\n                <div className="text-xs text-gray-400">Clientes felizes</div>\n              </div>',
        '<div className="w-px h-10 bg-white/20" />\n              <div className="text-center">\n                <div className="text-2xl font-bold text-gold-400">2k+</div>\n                <div className="text-xs text-gray-400">Clientes felizes</div>\n              </div>\n              <div className="w-px h-10 bg-white/20" />\n              <div className="text-center">\n                <ContadorVisitas />\n              </div>'
    )
    with open(home_fp, 'w', encoding='utf-8', newline='\n') as f:
        f.write(c)
    print('OK: ContadorVisitas adicionado na Home')
else:
    print('OK: ContadorVisitas ja existe na Home')

print()
print('Rode: npm run build')
