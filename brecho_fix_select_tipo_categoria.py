import os, re

base = os.path.dirname(os.path.abspath(__file__))
fp = os.path.join(base, 'src', 'app', 'admin-loja', 'page.tsx')

with open(fp, 'r', encoding='utf-8') as f:
    c = f.read()

# ── 1. Corrige select de tipo de categoria ────────────────────
antigo_tipo = """                    <option value="item">Item (subcategoria/marca)</option>
                    <option value="grupo">Grupo (ex: Feminino)</option>
                    <option value="subcategoria">Categoria raiz</option>"""

novo_tipo = """                    <option value="item">Item — marca, subcategoria ou tipo de produto</option>
                    <option value="grupo">Grupo — divisão por gênero (Feminino, Masculino...)</option>
                    <option value="genero">Categoria raiz com grupos (ex: Roupas, Calçados)</option>
                    <option value="marca">Categoria raiz por marca (ex: Bolsas)</option>
                    <option value="subcategoria">Categoria raiz simples (ex: Acessórios)</option>"""

if antigo_tipo in c:
    c = c.replace(antigo_tipo, novo_tipo)
    print('OK: select de tipo atualizado com todas as opcoes')
else:
    print('AVISO: select tipo nao encontrado')
    idx = c.find('option value="item"')
    print(repr(c[idx-50:idx+200]))

# ── 2. Corrige encoding corrompido no select de gênero ────────
c = c.replace('Selecione o g\u00c3\u00aanero...', 'Selecione o gênero...')
c = c.replace('gÃªnero', 'gênero')
c = c.replace('G\u00c3\u00aanero', 'Gênero')
print('OK: encoding de genero corrigido')

with open(fp, 'w', encoding='utf-8', newline='\n') as f:
    f.write(c)

print()
print('Rode agora:')
print('  git add .')
print('  git commit -m "Fix: opcoes de tipo categoria + encoding genero"')
print('  git push')
