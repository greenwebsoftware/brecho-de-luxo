import os, re

base = os.path.dirname(os.path.abspath(__file__))
fp = os.path.join(base, 'src', 'app', 'admin-loja', 'page.tsx')

with open(fp, 'r', encoding='utf-8') as f:
    c = f.read()

# ── 1. Corrige metrica produtosVisiveis — conta apenas produtosOnline ──
antigo_metrica = "produtosVisiveis: produtos.filter(p => p.visivel_site).length + produtosOnline.filter(p => p.visivel).length,"
novo_metrica   = "produtosVisiveis: produtosOnline.filter(p => p.visivel).length,"

if antigo_metrica in c:
    c = c.replace(antigo_metrica, novo_metrica)
    print('OK: metrica produtosVisiveis corrigida (sem duplicar)')
else:
    print('AVISO: metrica nao encontrada — buscando...')
    idx = c.find('produtosVisiveis')
    print(repr(c[idx:idx+150]))

# ── 2. Adiciona botoes renomear nos grupos e itens da tabela ──
# Verifica se ja existem
if 'setEditandoCat({ id: grupo.id' in c:
    print('OK: botoes renomear ja existem nos grupos')
else:
    antigo_btn_grupo = """                            <button onClick={() => excluirCategoria(grupo.id)} className="text-red-400 hover:text-red-600">
                              <Trash2 className="w-3 h-3" />
                            </button>"""
    novo_btn_grupo = """                            <div className="flex gap-1">
                                <button onClick={() => setEditandoCat({ id: grupo.id, label: grupo.label, slug: grupo.slug })} className="text-blue-400 hover:text-blue-600" title="Renomear">
                                  <Edit className="w-3 h-3" />
                                </button>
                                <button onClick={() => excluirCategoria(grupo.id)} className="text-red-400 hover:text-red-600" title="Excluir">
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>"""
    if antigo_btn_grupo in c:
        c = c.replace(antigo_btn_grupo, novo_btn_grupo)
        print('OK: botao renomear grupo adicionado')
    else:
        print('AVISO: botao grupo nao encontrado')

if 'setEditandoCat({ id: item.id' in c:
    print('OK: botoes renomear ja existem nos itens')
else:
    antigo_btn_item = """                            <button onClick={() => excluirCategoria(item.id)} className="text-red-300 hover:text-red-500 ml-2">
                                <Trash2 className="w-3 h-3" />
                              </button>"""
    novo_btn_item = """                            <div className="flex gap-1 ml-1">
                                <button onClick={() => setEditandoCat({ id: item.id, label: item.label, slug: item.slug })} className="text-blue-300 hover:text-blue-500" title="Renomear">
                                  <Edit className="w-3 h-3" />
                                </button>
                                <button onClick={() => excluirCategoria(item.id)} className="text-red-300 hover:text-red-500" title="Excluir">
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>"""
    if antigo_btn_item in c:
        c = c.replace(antigo_btn_item, novo_btn_item)
        print('OK: botao renomear item adicionado')
    else:
        print('AVISO: botao item nao encontrado')

# ── 3. Adiciona botao renomear nas categorias raiz ──
if 'setEditandoCat({ id: catRaiz.id' not in c:
    antigo_header = """                  <div className="bg-luxo-900 px-6 py-3 flex items-center justify-between">
                    <h3 className="text-white font-semibold">{catRaiz.label}</h3>
                    <span className="text-gold-300 text-xs">{catRaiz.tipo}</span>
                  </div>"""
    novo_header = """                  <div className="bg-luxo-900 px-6 py-3 flex items-center justify-between">
                    <h3 className="text-white font-semibold">{catRaiz.label}</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-gold-300 text-xs">{catRaiz.tipo}</span>
                      <button onClick={() => setEditandoCat({ id: catRaiz.id, label: catRaiz.label, slug: catRaiz.slug })} className="text-gold-300 hover:text-white" title="Renomear">
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => excluirCategoria(catRaiz.id)} className="text-red-400 hover:text-red-300" title="Excluir categoria raiz">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>"""
    if antigo_header in c:
        c = c.replace(antigo_header, novo_header)
        print('OK: botoes renomear/excluir categoria raiz adicionados')
    else:
        print('AVISO: header da categoria raiz nao encontrado')

with open(fp, 'w', encoding='utf-8', newline='\n') as f:
    f.write(c)

print()
print('Rode agora:')
print('  git add .')
print('  git commit -m "Fix: duplicacao produtos + botoes renomear categorias"')
print('  git push')
