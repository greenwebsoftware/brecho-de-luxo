import os, re

base = os.path.dirname(os.path.abspath(__file__))
fp = os.path.join(base, 'src', 'app', 'admin-loja', 'page.tsx')

with open(fp, 'r', encoding='utf-8') as f:
    c = f.read()

# Corrige comentário incompleto
c = c.replace(
    "{/* ---- CONFIGURAÇÕES ---- */",
    "{/* ---- CONFIGURAÇÕES ---- */}"
)

# Corrige aba categorias sem emoji
c = re.sub(
    r"\{ key: 'categorias', label: '.*?Categorias.*?' \}",
    "{ key: 'categorias', label: 'Categorias' }",
    c
)

with open(fp, 'w', encoding='utf-8', newline='\n') as f:
    f.write(c)

print('OK: sintaxe corrigida')
print()
print('Rode agora:')
print('  git add .')
print('  git commit -m "Fix: sintaxe page.tsx admin-loja"')
print('  git push')
