import os, re

base = os.path.dirname(os.path.abspath(__file__))
fp = os.path.join(base, 'src', 'components', 'layout', 'Header.tsx')

with open(fp, 'r', encoding='utf-8') as f:
    c = f.read()

# Remove qualquer variacao malformada e substitui pela correta
c = re.sub(
    r'[{`]?Frete gr[aá]tis nas compras acima de R\$[^<\n]*[`}]?\s*&bull;',
    '{`Frete grátis nas compras acima de R$${freteGratis}`} &bull;',
    c
)

with open(fp, 'w', encoding='utf-8', newline='\n') as f:
    f.write(c)

print('OK: JSX frete gratis corrigido')
print('Rode: npm run build')
