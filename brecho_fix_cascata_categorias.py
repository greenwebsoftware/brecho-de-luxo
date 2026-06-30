import os, re

base = os.path.dirname(os.path.abspath(__file__))
fp = os.path.join(base, 'src', 'app', 'admin-loja', 'page.tsx')

with open(fp, 'r', encoding='utf-8') as f:
    c = f.read()

# 1. Adiciona import do menuConfig após os imports existentes
if 'menuConfig' not in c:
    c = c.replace(
        "import GeradorConteudo from '../../components/GeradorConteudo'",
        "import GeradorConteudo from '../../components/GeradorConteudo'\nimport { CATEGORIAS } from '../../lib/menuConfig'"
    )
    print('OK: import menuConfig adicionado')
else:
    print('OK: menuConfig ja importado')

# 2. Adiciona estado para categoria selecionada no modal (para cascata)
if 'catSelecionada' not in c:
    c = c.replace(
        "  const [novaFoto, setNovaFoto] = useState('')",
        "  const [novaFoto, setNovaFoto] = useState('')\n  const [catSelecionada, setCatSelecionada] = useState('')"
    )
    print('OK: estado catSelecionada adicionado')

# 3. Reset catSelecionada ao abrir modal novo
c = c.replace(
    "  const abrirModalNovo = () => { setEditandoOnline(null); setFormOnline({ fotos: [], tamanhos: [], cores: [], visivel: true, destaque: false, peso: 0.3 }); setModalOnline(true) }",
    "  const abrirModalNovo = () => { setEditandoOnline(null); setFormOnline({ fotos: [], tamanhos: [], cores: [], visivel: true, destaque: false, peso: 0.3 }); setCatSelecionada(''); setModalOnline(true) }"
)

# 4. Reset catSelecionada ao abrir modal editar
c = c.replace(
    "  const abrirModalEditar = (p: ProdutoOnline) => { setEditandoOnline(p); setFormOnline({ ...p }); setModalOnline(true) }",
    "  const abrirModalEditar = (p: ProdutoOnline) => { setEditandoOnline(p); setFormOnline({ ...p }); setCatSelecionada(p.categoria || ''); setModalOnline(true) }"
)

# 5. Substitui os campos categoria/subcategoria/marca no modal por dropdowns em cascata
antigo = """                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">Marca</label>
                  <input value={formOnline.marca || ''} onChange={e => setFormOnline({ ...formOnline, marca: e.target.value })} className="input-luxo" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">Categoria</label>
                  <select value={formOnline.categoria || ''} onChange={e => setFormOnline({ ...formOnline, categoria: e.target.value })} className="input-luxo">
                    <option value="">Selecione...</option>
                    {CATEGORIAS_OPTS.map(c => <option key={c} value={c.toLowerCase()}>{c}</option>)}
                  </select>
                </div>"""

novo = """                <div className="col-span-2">
                  <label className="text-xs font-medium text-gray-500 mb-1 block">Categoria *</label>
                  <select value={catSelecionada} onChange={e => {
                    setCatSelecionada(e.target.value)
                    setFormOnline({ ...formOnline, categoria: e.target.value, subcategoria: '', marca: '' })
                  }} className="input-luxo">
                    <option value="">Selecione a categoria...</option>
                    {CATEGORIAS.map(cat => <option key={cat.slug} value={cat.slug}>{cat.label}</option>)}
                  </select>
                </div>

                {/* Bolsas: dropdown de marca */}
                {catSelecionada === 'bolsas' && (
                  <div className="col-span-2">
                    <label className="text-xs font-medium text-gray-500 mb-1 block">Marca</label>
                    <select value={formOnline.marca || ''} onChange={e => setFormOnline({ ...formOnline, marca: e.target.value })} className="input-luxo">
                      <option value="">Selecione a marca...</option>
                      {CATEGORIAS.find(c => c.slug === 'bolsas')?.itens?.map(item => (
                        <option key={item.slug} value={item.slug}>{item.label}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Roupas e Calcados: dropdown de genero + subcategoria */}
                {(catSelecionada === 'roupas' || catSelecionada === 'calcados') && (
                  <>
                    <div>
                      <label className="text-xs font-medium text-gray-500 mb-1 block">Gênero</label>
                      <select value={formOnline.subcategoria?.split('|')[0] || ''} onChange={e => {
                        setFormOnline({ ...formOnline, subcategoria: e.target.value + '|' })
                      }} className="input-luxo">
                        <option value="">Selecione o gênero...</option>
                        {CATEGORIAS.find(c => c.slug === catSelecionada)?.grupos?.map(grupo => (
                          <option key={grupo.slug} value={grupo.slug}>{grupo.label}</option>
                        ))}
                      </select>
                    </div>
                    {formOnline.subcategoria?.split('|')[0] && (
                      <div>
                        <label className="text-xs font-medium text-gray-500 mb-1 block">Tipo</label>
                        <select value={formOnline.subcategoria?.split('|')[1] || ''} onChange={e => {
                          const genero = formOnline.subcategoria?.split('|')[0] || ''
                          setFormOnline({ ...formOnline, subcategoria: genero + '|' + e.target.value })
                        }} className="input-luxo">
                          <option value="">Selecione o tipo...</option>
                          {CATEGORIAS.find(c => c.slug === catSelecionada)?.grupos
                            ?.find(g => g.slug === formOnline.subcategoria?.split('|')[0])
                            ?.itens?.map(item => (
                              <option key={item.slug} value={item.slug}>{item.label}</option>
                            ))}
                        </select>
                      </div>
                    )}
                  </>
                )}

                {/* Acessorios: dropdown de subcategoria direta */}
                {catSelecionada === 'acessorios' && (
                  <div className="col-span-2">
                    <label className="text-xs font-medium text-gray-500 mb-1 block">Subcategoria</label>
                    <select value={formOnline.subcategoria || ''} onChange={e => setFormOnline({ ...formOnline, subcategoria: e.target.value })} className="input-luxo">
                      <option value="">Selecione...</option>
                      {CATEGORIAS.find(c => c.slug === 'acessorios')?.itens?.map(item => (
                        <option key={item.slug} value={item.slug}>{item.label}</option>
                      ))}
                    </select>
                  </div>
                )}"""

if antigo in c:
    c = c.replace(antigo, novo)
    print('OK: campos categoria/subcategoria/marca substituidos por dropdowns em cascata')
else:
    print('AVISO: trecho nao encontrado — verifique manualmente')
    # Mostra contexto para diagnóstico
    idx = c.find('Categoria</label>')
    if idx > 0:
        print('Contexto encontrado:')
        print(repr(c[idx-200:idx+300]))

with open(fp, 'w', encoding='utf-8', newline='\n') as f:
    f.write(c)

print()
print('Rode agora:')
print('  git add .')
print('  git commit -m "Admin: dropdowns em cascata categoria/subcategoria/marca"')
print('  git push')
