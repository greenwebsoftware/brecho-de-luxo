import os

base = os.path.dirname(os.path.abspath(__file__))
fp = os.path.join(base, 'src', 'app', 'admin-loja', 'page.tsx')

with open(fp, 'r', encoding='utf-8') as f:
    c = f.read()

antigo = """                {(formOnline.fotos || []).length > 0 && (
                  <>
                  <div>
                  <p className="text-xs text-gray-400 mb-1">Arraste para reordenar. A primeira \u00c3\u00a9 a principal.</p>
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
                        <button onClick={() => setFormOnline(prev => ({ ...prev, fotos: (prev.fotos || []).filter((_, idx) => idx !== i) }))} className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs">\u00c3\u0097</button>
                        {i === 0 && <span className="absolute bottom-1 left-1 bg-gold-500 text-white text-[10px] px-1 rounded">Principal</span>}
                      </div>
                    ))}
                  </div>
                  </div>
                )}"""

novo = """                {(formOnline.fotos || []).length > 0 && (
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Arraste para reordenar. A primeira é a principal.</p>
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
                          <button onClick={() => setFormOnline(prev => ({ ...prev, fotos: (prev.fotos || []).filter((_, idx) => idx !== i) }))} className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs">×</button>
                          {i === 0 && <span className="absolute bottom-1 left-1 bg-gold-500 text-white text-[10px] px-1 rounded">Principal</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}"""

if antigo in c:
    c = c.replace(antigo, novo)
    print('OK: estrutura JSX corrigida definitivamente')
else:
    print('AVISO: trecho nao encontrado — tentando busca parcial')
    idx = c.find('(formOnline.fotos || []).length > 0 && (')
    if idx >= 0:
        print('Trecho encontrado em:')
        print(repr(c[idx:idx+200]))

with open(fp, 'w', encoding='utf-8', newline='\n') as f:
    f.write(c)

print()
print('Rode agora:')
print('  git add .')
print('  git commit -m "Fix: JSX drag & drop fotos definitivo"')
print('  git push')
