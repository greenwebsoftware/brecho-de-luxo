import os, re

base = os.path.dirname(os.path.abspath(__file__))

fixes = {
    'src/app/api/admin/blog/route.ts': '../../../../lib/supabase-server',
    'src/app/api/admin/blog/[id]/route.ts': '../../../../../lib/supabase-server',
    'src/app/api/admin/blog/comentarios/route.ts': '../../../../../lib/supabase-server',
}

for rel, novo_path in fixes.items():
    fp = os.path.join(base, rel)
    if not os.path.exists(fp):
        print(f'NAO ENCONTRADO: {rel}')
        continue
    with open(fp, 'r', encoding='utf-8') as f:
        c = f.read()
    c = re.sub(r"from '[./]+lib/supabase-server'", f"from '{novo_path}'", c)
    with open(fp, 'w', encoding='utf-8', newline='\n') as f:
        f.write(c)
    print(f'OK: {rel}')

print()
print('Rode: npm run build')
