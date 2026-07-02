import os

base = os.path.dirname(os.path.abspath(__file__))
fp = os.path.join(base, 'src', 'app', 'admin-loja', 'page.tsx')

with open(fp, 'r', encoding='utf-8') as f:
    c = f.read()

antigo = """                  <p className="text-xs text-gray-400 mb-1">Arraste para reordenar. A primeira é a principal.</p>
                  <div className="grid grid-cols-4 gap-2">"""

novo = """                  <>
                  <p className="text-xs text-gray-400 mb-1">Arraste para reordenar. A primeira é a principal.</p>
                  <div className="grid grid-cols-4 gap-2">"""

if antigo in c:
    c = c.replace(antigo, novo)
    # Fecha o fragment no lugar certo — após o fechamento do div do grid
    c = c.replace(
        "                    ))}\n                  </div>\n                )}",
        "                    ))}\n                  </div>\n                  </>\n                )}"
    )
    print('OK: fragment adicionado')
else:
    print('AVISO: trecho nao encontrado')

with open(fp, 'w', encoding='utf-8', newline='\n') as f:
    f.write(c)

print()
print('Rode agora:')
print('  git add .')
print('  git commit -m "Fix: fragment no drag & drop de fotos"')
print('  git push')
