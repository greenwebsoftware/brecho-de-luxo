import os, re

base = os.path.dirname(os.path.abspath(__file__))

fixes = {
    'src/app/sitemap.xml/route.ts': '../../lib/supabase-server',
    'src/app/robots.txt/route.ts': None,  # nao usa supabase
}

for rel, path in fixes.items():
    if not path:
        continue
    fp = os.path.join(base, rel)
    if not os.path.exists(fp):
        print(f'NAO ENCONTRADO: {rel}')
        continue
    with open(fp, 'r', encoding='utf-8') as f:
        c = f.read()
    c = re.sub(r"from '[./]+lib/supabase-server'", f"from '{path}'", c)
    with open(fp, 'w', encoding='utf-8', newline='\n') as f:
        f.write(c)
    print(f'OK: {rel}')

print()
print('Rode: npm run build')
