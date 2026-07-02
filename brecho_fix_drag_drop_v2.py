import os

base = os.path.dirname(os.path.abspath(__file__))
fp = os.path.join(base, 'src', 'app', 'admin-loja', 'page.tsx')

with open(fp, 'r', encoding='utf-8') as f:
    c = f.read()

# Adiciona estado dragOverIndex se não existir
if 'dragOverIndex' not in c:
    c = c.replace(
        "  const [dragIndex, setDragIndex] = useState<number | null>(null)",
        "  const [dragIndex, setDragIndex] = useState<number | null>(null)\n  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)"
    )
    print('OK: estado dragOverIndex adicionado')
else:
    print('OK: dragOverIndex ja existe')

# Adiciona função reordenarFotos se não existir
if 'reordenarFotos' not in c:
    c = c.replace(
        "  const salvarBlog = async () => {",
        """  const reordenarFotos = (fromIdx: number, toIdx: number) => {
    const fotos = [...(formOnline.fotos || [])]
    const [moved] = fotos.splice(fromIdx, 1)
    fotos.splice(toIdx, 0, moved)
    setFormOnline(prev => ({ ...prev, fotos }))
  }

  const salvarBlog = async () => {"""
    )
    print('OK: funcao reordenarFotos adicionada')
else:
    print('OK: reordenarFotos ja existe')

# Localiza o trecho exato conforme mostrado no contexto
antigo = """                  <div className="grid grid-cols-4 gap-2">
                    {(formOnline.fotos || []).map((f, i) => (
                      <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-gray-200">
                        <img src={f} alt="" className="w-full h-full object-cover" />
                        <button onClick={() => setFormOnline(prev => ({ ...prev, fotos: (prev.fotos || []).filter((_, idx) => idx !== i) }))} className"""

# Encontra e mostra o trecho completo
idx = c.find(antigo)
if idx >= 0:
    # Pega o trecho completo até o fechamento do map
    trecho_fim = c.find('                    ))}\n                  </div>', idx)
    trecho_completo = c[idx:trecho_fim + len('                    ))}\n                  </div>')]
    print(f'Trecho encontrado ({len(trecho_completo)} chars)')

    novo = """                  <p className="text-xs text-gray-400 mb-1">Arraste para reordenar. A primeira é a principal.</p>
                  <div className="grid grid-cols-4 gap-2">
                    {(formOnline.fotos || []).map((f, i) => (
                      <div key={i}
                        draggable
                        onDragStart={e => { e.dataTransfer.effectAllowed = 'move'; setDragIndex(i) }}
                        onDragOver={e => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; setDragOverIndex(i) }}
                        onDrop={e => { e.preventDefault(); if (dragIndex !== null && dragIndex !== i) reordenarFotos(dragIndex, i); setDragIndex(null); setDragOverIndex(null) }}
                        onDragEnd={() => { setDragIndex(null); setDragOverIndex(null) }}
                        className={`relative aspect-square rounded-xl overflow-hidden cursor-grab active:cursor-grabbing select-none transition-all ${dragOverIndex === i ? 'border-2 border-gold-500 scale-105 shadow-lg' : 'border border-gray-200'} ${dragIndex === i ? 'opacity-40' : ''}`}>
                        <img src={f} alt="" className="w-full h-full object-cover pointer-events-none" />
                        <button onClick={() => setFormOnline(prev => ({ ...prev, fotos: (prev.fotos || []).filter((_, idx) => idx !== i) }))} className"""

    c = c[:idx] + novo + c[idx + len(antigo):]
    print('OK: drag & drop adicionado')
else:
    print('AVISO: trecho ainda nao encontrado')
    # Mostra o que tem perto do grid de fotos
    idx2 = c.find('grid-cols-4 gap-2')
    if idx2 >= 0:
        print('Contexto encontrado:')
        print(repr(c[idx2-100:idx2+400]))

with open(fp, 'w', encoding='utf-8', newline='\n') as f:
    f.write(c)

print()
print('Rode agora:')
print('  git add .')
print('  git commit -m "Fix: drag & drop fotos admin com trecho correto"')
print('  git push')
