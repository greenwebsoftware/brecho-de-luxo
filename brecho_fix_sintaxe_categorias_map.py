import os, re

base = os.path.dirname(os.path.abspath(__file__))
fp = os.path.join(base, 'src', 'app', 'admin-loja', 'page.tsx')

with open(fp, 'r', encoding='utf-8') as f:
    c = f.read()

# Localiza e mostra o trecho problemático
idx = c.find('Categorias raiz dinamicas do banco')
if idx < 0:
    idx = c.find('categoriasLoja.filter(c => !c.pai_slug')
print("=== Trecho atual ===")
print(c[idx:idx+600])
print("===================")

# Substitui o map quebrado pelo correto
antigo = re.search(
    r'\{/\* Categorias raiz dinamicas do banco \*/\}.*?\{categoriasLoja\.filter.*?\.map.*?\{.*?const catSlug = catRaiz\.slug.*?return \(',
    c, re.DOTALL
)

if antigo:
    print("\nEncontrou o trecho problemático via regex")
else:
    print("\nNao encontrou via regex, tentando substring...")

# Substitui o bloco inteiro do map por versão correta
antigo_map = """{/* Categorias raiz dinamicas do banco */}
            {categoriasLoja.filter(c => !c.pai_slug && c.tipo !== 'item' && c.tipo !== 'grupo').sort((a, b) => a.ordem - b.ordem).map(catRaiz => { const catSlug = catRaiz.slug; return ("""

novo_map = """{/* Categorias raiz dinamicas do banco */}
            {categoriasLoja.filter(c => !c.pai_slug && c.tipo !== 'item' && c.tipo !== 'grupo').sort((a, b) => a.ordem - b.ordem).map(catRaiz => {
              const catSlug = catRaiz.slug;"""

if antigo_map in c:
    c = c.replace(antigo_map, novo_map)
    # Remove o "if (!catRaiz) return null" que ficou solto
    c = c.replace(
        "\n              if (!catRaiz) return null\n",
        "\n"
    )
    print("OK: map corrigido")
else:
    print("ERRO: trecho nao encontrado exatamente")
    # Mostra o que tem perto da linha 940-950
    linhas = c.split('\n')
    for i, l in enumerate(linhas[938:955], start=939):
        print(f"{i}: {l}")

with open(fp, 'w', encoding='utf-8', newline='\n') as f:
    f.write(c)

import py_compile
try:
    py_compile.compile(fp, doraise=True)
    print("OK: sintaxe Python valida")
except:
    pass

print()
print('Rode agora:')
print('  git add .')
print('  git commit -m "Fix: sintaxe map categorias raiz"')
print('  git push')
