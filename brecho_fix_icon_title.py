import os

base = os.path.dirname(os.path.abspath(__file__))
fp = os.path.join(base, 'src', 'app', 'admin-loja', 'page.tsx')

with open(fp, 'r', encoding='utf-8') as f:
    c = f.read()

c = c.replace(' title="Tem vídeo"', '')
c = c.replace(' title="Destaque"', '')

with open(fp, 'w', encoding='utf-8', newline='\n') as f:
    f.write(c)

print('OK: title removido dos icones Lucide')
print('Rode: npm run build')
