import os, re

base = os.path.dirname(os.path.abspath(__file__))

files = [
    'src/components/layout/Footer.tsx',
    'src/app/contato/page.tsx',
]

for rel in files:
    fp = os.path.join(base, rel)
    if not os.path.exists(fp):
        print(f'NAO ENCONTRADO: {rel}')
        continue

    with open(fp, 'r', encoding='utf-8') as f:
        c = f.read()

    # Se ja e URL completa usa direto, senao monta a URL
    c = re.sub(
        r"const igLink = .*",
        "const igLink = (config.instagram || '').startsWith('http') ? (config.instagram || '') : `https://instagram.com/${(config.instagram || 'brechodeluxo').replace('@', '')}`",
        c
    )

    # Exibicao do usuario: extrai da URL ou usa o campo direto
    c = re.sub(
        r"const igUser = .*",
        "const igUser = (config.instagram || 'brechodeluxo').startsWith('http') ? (config.instagram || '').replace(/.*instagram\\.com\\//, '').replace(/\\//g, '') : (config.instagram || 'brechodeluxo').replace('@', '')",
        c
    )

    with open(fp, 'w', encoding='utf-8', newline='\n') as f:
        f.write(c)
    print(f'OK: {rel}')

print()
print('Rode: npm run build')
