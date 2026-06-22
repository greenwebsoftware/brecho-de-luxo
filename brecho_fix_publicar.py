import os

base = os.path.dirname(os.path.abspath(__file__))

fp = os.path.join(base, 'src', 'app', 'api', 'admin', 'produtos', '[id]', 'publicar', 'route.ts')

with open(fp, 'r', encoding='utf-8') as f:
    c = f.read()

c = c.replace(
    "'../../../../../lib/supabase-server'",
    "'../../../../../../lib/supabase-server'"
)

with open(fp, 'w', encoding='utf-8', newline='\n') as f:
    f.write(c)

print('OK: publicar/route.ts corrigido')
print('Rode: npm run build')
