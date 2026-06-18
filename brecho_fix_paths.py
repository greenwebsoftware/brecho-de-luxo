import os

base = os.path.dirname(os.path.abspath(__file__))

# Caminho correto: contar quantos niveis subir ate chegar em src/lib/
# src/app/api/pagamento/route.ts          -> ../../../lib/ (3 niveis: pagamento->api->app->src)
# src/app/api/admin/produtos/route.ts     -> ../../../../lib/ (4 niveis)
# src/app/api/admin/produtos/[id]/route.ts-> ../../../../../lib/ (5 niveis)
# src/app/page.tsx                        -> ../lib/ (1 nivel: app->src)
# src/app/loja/[id]/page.tsx              -> ../../lib/ (2 niveis)
# src/components/layout/Header.tsx        -> ../../lib/ (2 niveis: layout->components->src)
# src/components/loja/ProdutoDetalhes.tsx -> ../../lib/ (2 niveis)

fixes = {
    'src/app/api/produtos/route.ts':                    '../../../lib/supabase-server',
    'src/app/api/pagamento/route.ts':                   '../../../lib/supabase-server',
    'src/app/api/webhook/mercadopago/route.ts':         '../../../../lib/supabase-server',
    'src/app/api/admin/produtos/route.ts':              '../../../../lib/supabase-server',
    'src/app/api/admin/pedidos/route.ts':               '../../../../lib/supabase-server',
    'src/app/api/admin/produtos/[id]/route.ts':         '../../../../../lib/supabase-server',
    'src/app/api/admin/pedidos/[id]/route.ts':          '../../../../../lib/supabase-server',
    'src/app/page.tsx':                                 '../lib/supabase-server',
    'src/app/loja/[id]/page.tsx':                       '../../lib/supabase-server',
    'src/app/layout.tsx':                               '../lib/carrinhoContext',
    'src/app/loja/page.tsx':                            '../../lib/carrinhoContext',
    'src/app/checkout/page.tsx':                        '../../lib/carrinhoContext',
    'src/components/layout/Header.tsx':                 '../../lib/carrinhoContext',
    'src/components/loja/ProdutoDetalhes.tsx':          '../../lib/carrinhoContext',
}

for rel_file, new_path in fixes.items():
    fp = os.path.join(base, rel_file)
    if not os.path.exists(fp):
        print(f'NOT FOUND: {rel_file}')
        continue
    with open(fp, 'r', encoding='utf-8') as f:
        content = f.read()
    # Replace any existing relative or @/ import
    import re
    content = re.sub(r"from '[./]*lib/supabase-server'", f"from '{new_path}'", content)
    content = re.sub(r"from '[./]*lib/carrinhoContext'", f"from '{new_path}'", content)
    content = content.replace("from '@/lib/supabase-server'", f"from '{new_path}'")
    content = content.replace("from '@/lib/carrinhoContext'", f"from '{new_path}'")
    with open(fp, 'w', encoding='utf-8', newline='\n') as f:
        f.write(content)
    print(f'OK: {rel_file} -> {new_path}')

print('\nDone! Run: npm run build')
