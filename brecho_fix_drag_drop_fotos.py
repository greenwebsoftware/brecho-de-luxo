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

# Substitui o grid de fotos por versão com drag & drop
antigo = """                <div className="grid grid-cols-3 gap-2 mt-2">
                  {(formOnline.fotos || []).map((foto, i) => (
                    <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-gray-200">
                      <img src={foto} alt="" className="w-full h-full object-cover" />
                      <button onClick={() => setFormOnline(prev => ({ ...prev, fotos: (prev.fotos || []).filter((_, idx) => idx !== i) }))} className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs">├ù</button>
                      {i === 0 && <span className="absolute bottom-1 left-1 bg-gold-500 text-white text-[10px] px-1 rounded">Principal</span>}
                    </div>
                  ))}
                </div>"""

novo = """                <p className="text-xs text-gray-400 mt-2 mb-1">
                  Arraste as imagens para reordenar. A primeira é a imagem principal.
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {(formOnline.fotos || []).map((foto, i) => (
                    <div key={i}
                      draggable
                      onDragStart={e => { e.dataTransfer.effectAllowed = 'move'; setDragIndex(i) }}
                      onDragOver={e => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; setDragOverIndex(i) }}
                      onDrop={e => { e.preventDefault(); if (dragIndex !== null && dragIndex !== i) reordenarFotos(dragIndex, i); setDragIndex(null); setDragOverIndex(null) }}
                      onDragEnd={() => { setDragIndex(null); setDragOverIndex(null) }}
                      className={`relative aspect-square rounded-xl overflow-hidden cursor-grab active:cursor-grabbing transition-all select-none ${
                        dragOverIndex === i ? 'border-2 border-gold-500 scale-105 shadow-lg' : 'border border-gray-200'
                      } ${dragIndex === i ? 'opacity-40' : 'opacity-100'}`}>
                      <img src={foto} alt="" className="w-full h-full object-cover pointer-events-none" />
                      <button
                        onClick={() => setFormOnline(prev => ({ ...prev, fotos: (prev.fotos || []).filter((_, idx) => idx !== i) }))}
                        className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs z-10 cursor-pointer">
                        ×
                      </button>
                      {i === 0 && (
                        <span className="absolute bottom-1 left-1 bg-gold-500 text-white text-[10px] px-1 rounded">Principal</span>
                      )}
                      <span className="absolute top-1 left-1 bg-black/40 text-white text-[10px] px-1 rounded">{i + 1}</span>
                    </div>
                  ))}
                </div>"""

if antigo in c:
    c = c.replace(antigo, novo)
    print('OK: grid de fotos com drag & drop aplicado')
else:
    print('AVISO: trecho nao encontrado — mostrando contexto:')
    idx = c.find('aspect-square rounded-xl overflow-hidden border border-gray-200')
    if idx > 0:
        print(repr(c[idx-200:idx+300]))

with open(fp, 'w', encoding='utf-8', newline='\n') as f:
    f.write(c)

print()
print('Rode agora:')
print('  git add .')
print('  git commit -m "Feat: drag & drop para reordenar fotos no admin"')
print('  git push')
