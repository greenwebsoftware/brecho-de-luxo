import os, re

base = os.path.dirname(os.path.abspath(__file__))
fp = os.path.join(base, 'src', 'components', 'layout', 'Header.tsx')

with open(fp, 'r', encoding='utf-8') as f:
    c = f.read()

# Remove import da LogoBrEcho se existir
c = c.replace("import LogoBrEcho from '../LogoBrEcho'\n", '')
c = c.replace("import LogoBrEcho from '../LogoBrEcho'", '')

# Substitui o bloco do logo no header - qualquer variacao
c = re.sub(
    r'<Link href="/" className="flex items-center gap-2 flex-shrink-0">.*?</Link>',
    '''<Link href="/" className="flex items-center gap-2 flex-shrink-0">
              <img
                src="https://spdwesjpyfukmdhgiudx.supabase.co/storage/v1/object/public/imagens/logo-large.png"
                alt="Brechó de Luxo"
                className="h-14 w-auto object-contain"
                style={{ maxHeight: '56px' }}
              />
            </Link>''',
    c,
    count=1,
    flags=re.DOTALL
)

with open(fp, 'w', encoding='utf-8', newline='\n') as f:
    f.write(c)

print('OK: Logo real inserida no Header')
print('Rode: npm run build')
