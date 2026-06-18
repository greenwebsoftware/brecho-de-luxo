import os

base = os.path.dirname(os.path.abspath(__file__))

# Map: arquivo -> caminho relativo para supabase-server
fixes = {
    'src/app/api/produtos/route.ts': ('../../lib/supabase-server', None),
    'src/app/api/pagamento/route.ts': ('../../lib/supabase-server', None),
    'src/app/api/webhook/mercadopago/route.ts': ('../../../lib/supabase-server', None),
    'src/app/api/admin/produtos/route.ts': ('../../../lib/supabase-server', None),
    'src/app/api/admin/pedidos/route.ts': ('../../../lib/supabase-server', None),
    'src/app/api/admin/produtos/[id]/route.ts': ('../../../../lib/supabase-server', None),
    'src/app/api/admin/pedidos/[id]/route.ts': ('../../../../lib/supabase-server', None),
    'src/app/page.tsx': ('../lib/supabase-server', None),
    'src/app/loja/[id]/page.tsx': ('../../lib/supabase-server', '../../lib/carrinhoContext'),
    'src/app/layout.tsx': (None, '../lib/carrinhoContext'),
    'src/app/loja/page.tsx': (None, '../../lib/carrinhoContext'),
    'src/app/checkout/page.tsx': (None, '../../lib/carrinhoContext'),
    'src/components/layout/Header.tsx': (None, '../../lib/carrinhoContext'),
    'src/components/loja/ProdutoDetalhes.tsx': (None, '../../lib/carrinhoContext'),
}

for rel_file, (supabase_path, carrinho_path) in fixes.items():
    fp = os.path.join(base, rel_file)
    if not os.path.exists(fp):
        print(f"NOT FOUND: {rel_file}")
        continue

    with open(fp, 'r', encoding='utf-8') as f:
        content = f.read()

    original = content

    if supabase_path:
        content = content.replace(
            "from '@/lib/supabase-server'",
            f"from '{supabase_path}'"
        )

    if carrinho_path:
        content = content.replace(
            "from '@/lib/carrinhoContext'",
            f"from '{carrinho_path}'"
        )

    if content != original:
        with open(fp, 'w', encoding='utf-8', newline='\n') as f:
            f.write(content)
        print(f"FIXED: {rel_file}")
    else:
        print(f"OK (no change): {rel_file}")

print("\nDone! Now run: npm run build")
