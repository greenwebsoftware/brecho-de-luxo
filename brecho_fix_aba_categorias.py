import os

base = os.path.dirname(os.path.abspath(__file__))
fp = os.path.join(base, 'src', 'app', 'admin-loja', 'page.tsx')

with open(fp, 'r', encoding='utf-8') as f:
    c = f.read()

# Corrige o botão da aba categorias — remove emoji problemático
# Substitui qualquer variação do label de categorias
import re

c = re.sub(
    r"\{ key: 'categorias', label: '.*?Categorias.*?' \}",
    "{ key: 'categorias', label: 'Categorias' }",
    c
)

with open(fp, 'w', encoding='utf-8', newline='\n') as f:
    f.write(c)

print('OK: aba Categorias corrigida sem emoji')
print()
print('Rode agora:')
print('  git add .')
print('  git commit -m "Fix: aba Categorias sem emoji corrompido"')
print('  git push')
