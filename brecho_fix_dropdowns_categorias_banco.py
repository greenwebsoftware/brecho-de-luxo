import os

base = os.path.dirname(os.path.abspath(__file__))
fp = os.path.join(base, 'src', 'app', 'admin-loja', 'page.tsx')

with open(fp, 'r', encoding='utf-8') as f:
    c = f.read()

# ── 1. Dropdown de marcas de bolsas ──────────────────────────
antigo_bolsas = """                    <select value={formOnline.marca || ''} onChange={e => setFormOnline({ ...formOnline, marca: e.target.value })} className="input-luxo">
                      <option value="">Selecione a marca...</option>
                      {CATEGORIAS.find(c => c.slug === 'bolsas')?.itens?.map(item => (
                        <option key={item.slug} value={item.slug}>{item.label}</option>
                      ))}
                    </select>"""

novo_bolsas = """                    <select value={formOnline.marca || ''} onChange={e => setFormOnline({ ...formOnline, marca: e.target.value })} className="input-luxo">
                      <option value="">Selecione a marca...</option>
                      {categoriasLoja.filter(c => c.pai_slug === catSelecionada && c.tipo === 'item').map(item => (
                        <option key={item.slug} value={item.slug}>{item.label}</option>
                      ))}
                    </select>"""

if antigo_bolsas in c:
    c = c.replace(antigo_bolsas, novo_bolsas)
    print('OK: dropdown marcas atualizado para usar categoriasLoja')
else:
    print('AVISO: dropdown marcas nao encontrado')

# ── 2. Dropdown de gênero (roupas/calcados) ──────────────────
antigo_genero = """                        {CATEGORIAS.find(c => c.slug === catSelecionada)?.grupos?.map(grupo => (
                          <option key={grupo.slug} value={grupo.slug}>{grupo.label}</option>
                        ))}"""

novo_genero = """                        {categoriasLoja.filter(c => c.pai_slug === catSelecionada && c.tipo === 'grupo').map(grupo => (
                          <option key={grupo.slug} value={grupo.slug}>{grupo.label}</option>
                        ))}"""

if antigo_genero in c:
    c = c.replace(antigo_genero, novo_genero)
    print('OK: dropdown genero atualizado para usar categoriasLoja')
else:
    print('AVISO: dropdown genero nao encontrado')

# ── 3. Dropdown de tipo/subcategoria ─────────────────────────
antigo_tipo = """                          {CATEGORIAS.find(c => c.slug === catSelecionada)?.grupos
                            ?.find(g => g.slug === formOnline.genero)
                            ?.itens?.map(item => (
                              <option key={item.slug} value={item.slug}>{item.label}</option>
                            ))}"""

novo_tipo = """                          {categoriasLoja.filter(c => c.pai_slug === formOnline.genero && c.tipo === 'item').map(item => (
                            <option key={item.slug} value={item.slug}>{item.label}</option>
                          ))}"""

if antigo_tipo in c:
    c = c.replace(antigo_tipo, novo_tipo)
    print('OK: dropdown tipo/subcategoria atualizado para usar categoriasLoja')
else:
    print('AVISO: dropdown tipo nao encontrado')

# ── 4. Dropdown de acessórios ────────────────────────────────
antigo_acess = """                      {CATEGORIAS.find(c => c.slug === 'acessorios')?.itens?.map(item => (
                        <option key={item.slug} value={item.slug}>{item.label}</option>
                      ))}"""

novo_acess = """                      {categoriasLoja.filter(c => c.pai_slug === catSelecionada && c.tipo === 'item').map(item => (
                        <option key={item.slug} value={item.slug}>{item.label}</option>
                      ))}"""

if antigo_acess in c:
    c = c.replace(antigo_acess, novo_acess)
    print('OK: dropdown acessorios atualizado para usar categoriasLoja')
else:
    print('AVISO: dropdown acessorios nao encontrado')

# ── 5. Dropdown de categorias raiz no formulário ─────────────
antigo_cats = """                    {CATEGORIAS.map(cat => <option key={cat.slug} value={cat.slug}>{cat.label}</option>)}"""

novo_cats = """                    {categoriasLoja.filter(c => !c.pai_slug).sort((a,b) => a.ordem - b.ordem).map(cat => (
                      <option key={cat.slug} value={cat.slug}>{cat.label}</option>
                    ))}"""

if antigo_cats in c:
    c = c.replace(antigo_cats, novo_cats)
    print('OK: dropdown categorias raiz atualizado para usar categoriasLoja')
else:
    print('AVISO: dropdown categorias raiz nao encontrado')

# ── 6. Ajusta logica dos dropdowns para qualquer categoria ────
# Em vez de checar roupas/calcados/bolsas/acessorios fixos,
# checa se a categoria tem grupos ou itens diretos no banco

antigo_cond_bolsas = "{catSelecionada === 'bolsas' && ("
novo_cond_bolsas   = "{catSelecionada && categoriasLoja.filter(c => c.pai_slug === catSelecionada && c.tipo === 'item').length > 0 && categoriasLoja.filter(c => c.pai_slug === catSelecionada && c.tipo === 'grupo').length === 0 && ("

antigo_cond_roupas = "{(catSelecionada === 'roupas' || catSelecionada === 'calcados') && ("
novo_cond_roupas   = "{catSelecionada && categoriasLoja.filter(c => c.pai_slug === catSelecionada && c.tipo === 'grupo').length > 0 && ("

antigo_cond_acess  = "{catSelecionada === 'acessorios' && ("
novo_cond_acess    = "{catSelecionada && categoriasLoja.filter(c => c.pai_slug === catSelecionada && c.tipo === 'item').length > 0 && categoriasLoja.filter(c => c.pai_slug === catSelecionada && c.tipo === 'grupo').length === 0 && false && ("

if antigo_cond_bolsas in c:
    c = c.replace(antigo_cond_bolsas, novo_cond_bolsas)
    print('OK: condicao bolsas atualizada')
else:
    print('AVISO: condicao bolsas nao encontrada')

if antigo_cond_roupas in c:
    c = c.replace(antigo_cond_roupas, novo_cond_roupas)
    print('OK: condicao roupas/calcados atualizada')
else:
    print('AVISO: condicao roupas nao encontrada')

if antigo_cond_acess in c:
    c = c.replace(antigo_cond_acess, novo_cond_acess)
    print('OK: condicao acessorios atualizada')
else:
    print('AVISO: condicao acessorios nao encontrada')

with open(fp, 'w', encoding='utf-8', newline='\n') as f:
    f.write(c)

print()
print('Rode agora:')
print('  git add .')
print('  git commit -m "Fix: dropdowns produto online usam categorias do banco"')
print('  git push')
