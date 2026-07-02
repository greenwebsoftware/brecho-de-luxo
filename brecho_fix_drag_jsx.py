import os

base = os.path.dirname(os.path.abspath(__file__))
fp = os.path.join(base, 'src', 'app', 'admin-loja', 'page.tsx')

with open(fp, 'r', encoding='utf-8') as f:
    c = f.read()

# Remove o fragment mal posicionado
antigo_errado = """                  </div>
                  </>
                )}"""

novo_correto = """                  </div>
                )}"""

# Conta quantas ocorrências existem
count = c.count(antigo_errado)
print(f'Ocorrencias encontradas: {count}')

if count > 0:
    c = c.replace(antigo_errado, novo_correto)
    print('OK: fragment mal posicionado removido')

# Agora localiza o grid correto (produto online, não publicar)
# e envolve a dica + grid em um div simples
antigo_p = '                  <p className="text-xs text-gray-400 mb-1">Arraste para reordenar. A primeira é a principal.</p>\n                  <div className="grid grid-cols-4 gap-2">'
novo_p   = '                  <div>\n                  <p className="text-xs text-gray-400 mb-1">Arraste para reordenar. A primeira é a principal.</p>\n                  <div className="grid grid-cols-4 gap-2">'

if antigo_p in c:
    c = c.replace(antigo_p, novo_p)
    # Fecha o div extra após o fechamento do grid de produto online
    # Encontra a posição e fecha corretamente
    idx = c.find(novo_p)
    # Procura o fechamento do grid (após o map de fotos do produto online)
    idx_fim = c.find('                    ))}\n                  </div>\n                )}', idx)
    if idx_fim > 0:
        c = c[:idx_fim] + '                    ))}\n                  </div>\n                  </div>\n                )}' + c[idx_fim + len('                    ))}\n                  </div>\n                })'):]
        print('OK: div wrapper adicionado corretamente')
    else:
        print('AVISO: fechamento do grid nao encontrado')
else:
    print('AVISO: p de dica nao encontrado')

with open(fp, 'w', encoding='utf-8', newline='\n') as f:
    f.write(c)

print()
print('Rode agora:')
print('  git add .')
print('  git commit -m "Fix: estrutura JSX drag & drop corrigida"')
print('  git push')
