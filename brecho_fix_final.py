import os

base = os.path.dirname(os.path.abspath(__file__))

files = [
    'src/app/api/admin/pedidos/[id]/route.ts',
    'src/app/api/admin/produtos/[id]/route.ts',
]

for rel in files:
    fp = os.path.join(base, rel)
    with open(fp, 'r', encoding='utf-8') as f:
        c = f.read()
    c = c.replace('../../../../lib/supabase-server', '../../../../../lib/supabase-server')
    with open(fp, 'w', encoding='utf-8', newline='\n') as f:
        f.write(c)
    print('Fixed:', rel)

print('Done! Run: npm run build')
