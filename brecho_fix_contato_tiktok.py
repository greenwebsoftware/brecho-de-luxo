import os, re

base = os.path.dirname(os.path.abspath(__file__))
fp = os.path.join(base, 'src', 'app', 'contato', 'page.tsx')

with open(fp, 'r', encoding='utf-8') as f:
    c = f.read()

# Adiciona tiktok na interface SiteConfig
c = c.replace(
    'interface SiteConfig {\n  whatsapp?: string\n  instagram?: string\n  email_contato?: string\n}',
    'interface SiteConfig {\n  whatsapp?: string\n  instagram?: string\n  facebook?: string\n  tiktok?: string\n  email_contato?: string\n}'
)

with open(fp, 'w', encoding='utf-8', newline='\n') as f:
    f.write(c)

print('OK: tiktok adicionado na interface SiteConfig')
print('Rode: npm run build')
