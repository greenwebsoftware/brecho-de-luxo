import os, re

base = os.path.dirname(os.path.abspath(__file__))
fp = os.path.join(base, 'src', 'app', 'api', 'webhook', 'mercadopago', 'route.ts')

with open(fp, 'r', encoding='utf-8') as f:
    c = f.read()

c = re.sub(r"from '[./]+lib/supabase-server'", "from '../../../../lib/supabase-server'", c)

with open(fp, 'w', encoding='utf-8', newline='\n') as f:
    f.write(c)

print('OK: webhook path corrigido')
print('Rode: npm run build')
