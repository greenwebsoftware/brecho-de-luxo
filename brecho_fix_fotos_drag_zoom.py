import os

base = os.path.dirname(os.path.abspath(__file__))

# ── 1. Drag & drop no admin ───────────────────────────────────
fp_admin = os.path.join(base, 'src', 'app', 'admin-loja', 'page.tsx')

with open(fp_admin, 'r', encoding='utf-8') as f:
    c = f.read()

# Adiciona estado para drag & drop
if 'dragIndex' not in c:
    c = c.replace(
        "  const [novaFoto, setNovaFoto] = useState('')",
        """  const [novaFoto, setNovaFoto] = useState('')
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)"""
    )
    print('OK: estados drag & drop adicionados')

# Adiciona função de reordenação
if 'reordenarFotos' not in c:
    c = c.replace(
        "  const uploadBlogImg = async",
        """  const reordenarFotos = (fromIdx: number, toIdx: number) => {
    const fotos = [...(formOnline.fotos || [])]
    const [moved] = fotos.splice(fromIdx, 1)
    fotos.splice(toIdx, 0, moved)
    setFormOnline(prev => ({ ...prev, fotos }))
  }

  const uploadBlogImg = async"""
    )
    print('OK: funcao reordenarFotos adicionada')

# Substitui grid de fotos no modal de produto por versão com drag & drop
antigo_fotos = """                <div className="grid grid-cols-3 gap-2 mt-2">
                  {(formOnline.fotos || []).map((foto, i) => (
                    <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-gray-200">
                      <img src={foto} alt="" className="w-full h-full object-cover" />
                      <button onClick={() => setFormOnline(prev => ({ ...prev, fotos: (prev.fotos || []).filter((_, idx) => idx !== i) }))} className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs">×</button>
                      {i === 0 && <span className="absolute bottom-1 left-1 bg-gold-500 text-white text-[10px] px-1 rounded">Principal</span>}
                    </div>
                  ))}
                </div>"""

novo_fotos = """                <p className="text-xs text-gray-400 mt-2">Arraste as imagens para reordenar. A primeira é a imagem principal.</p>
                <div className="grid grid-cols-3 gap-2 mt-1">
                  {(formOnline.fotos || []).map((foto, i) => (
                    <div key={i}
                      draggable
                      onDragStart={() => setDragIndex(i)}
                      onDragOver={e => { e.preventDefault(); setDragOverIndex(i) }}
                      onDrop={() => {
                        if (dragIndex !== null && dragIndex !== i) reordenarFotos(dragIndex, i)
                        setDragIndex(null); setDragOverIndex(null)
                      }}
                      onDragEnd={() => { setDragIndex(null); setDragOverIndex(null) }}
                      className={`relative aspect-square rounded-xl overflow-hidden border-2 cursor-grab transition-all ${
                        dragOverIndex === i ? 'border-gold-500 scale-105' : 'border-gray-200'
                      } ${dragIndex === i ? 'opacity-50' : ''}`}>
                      <img src={foto} alt="" className="w-full h-full object-cover pointer-events-none" />
                      <button onClick={() => setFormOnline(prev => ({ ...prev, fotos: (prev.fotos || []).filter((_, idx) => idx !== i) }))}
                        className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs z-10">×</button>
                      {i === 0 && <span className="absolute bottom-1 left-1 bg-gold-500 text-white text-[10px] px-1 rounded">Principal</span>}
                      <div className="absolute top-1 left-1 text-white text-[10px] bg-black/40 rounded px-1">{i + 1}</div>
                    </div>
                  ))}
                </div>"""

if antigo_fotos in c:
    c = c.replace(antigo_fotos, novo_fotos)
    print('OK: grid de fotos com drag & drop')
else:
    print('AVISO: grid de fotos nao encontrado')

with open(fp_admin, 'w', encoding='utf-8', newline='\n') as f:
    f.write(c)

# ── 2. Zoom + Lightbox na página do produto ───────────────────
fp_produto = os.path.join(base, 'src', 'components', 'loja', 'ProdutoDetalhes.tsx')

with open(fp_produto, 'r', encoding='utf-8') as f:
    p = f.read()

# Adiciona estados de zoom e lightbox
if 'lightboxAberto' not in p:
    p = p.replace(
        "  const [imgAtiva, setImgAtiva] = useState(0)",
        """  const [imgAtiva, setImgAtiva] = useState(0)
  const [lightboxAberto, setLightboxAberto] = useState(false)
  const [lightboxIdx, setLightboxIdx] = useState(0)
  const [zoomPos, setZoomPos] = useState<{x: number, y: number, src: string, idx: number} | null>(null)"""
    )
    print('OK: estados lightbox e zoom adicionados')

# Substitui imagem principal por versão com zoom e lightbox
antigo_principal = """            <div className="aspect-square rounded-3xl overflow-hidden bg-gray-50 mb-3">
                <img
                  src={imagens[imgAtiva]}
                  alt={produto.nome}
                  className="w-full h-full object-cover"
                />
              </div>"""

novo_principal = """            <div className="aspect-square rounded-3xl overflow-hidden bg-gray-50 mb-3 relative group cursor-zoom-in"
                onMouseEnter={e => {
                  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
                  setZoomPos({ x: rect.left, y: rect.top, src: imagens[imgAtiva], idx: imgAtiva })
                }}
                onMouseLeave={() => setZoomPos(null)}
                onClick={() => { setLightboxIdx(imgAtiva); setLightboxAberto(true) }}>
                <img
                  src={imagens[imgAtiva]}
                  alt={produto.nome}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors flex items-center justify-center">
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 text-white text-xs px-2 py-1 rounded-full">
                    🔍 Clique para ampliar
                  </span>
                </div>
              </div>"""

if antigo_principal in p:
    p = p.replace(antigo_principal, novo_principal)
    print('OK: imagem principal com zoom e lightbox')
else:
    print('AVISO: imagem principal nao encontrada')

# Substitui miniaturas por versão com zoom ao hover
antigo_minis = """                  {imagens.map((img, i) => (
                    <button key={i} onClick={() => setImgAtiva(i)}
                      className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-colors ${
                        imgAtiva === i ? 'border-gold-500' : 'border-gray-100'
                      }`}>
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}"""

novo_minis = """                  {imagens.map((img, i) => (
                    <button key={i}
                      onClick={() => { setImgAtiva(i); setLightboxIdx(i); setLightboxAberto(true) }}
                      onMouseEnter={e => {
                        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
                        setZoomPos({ x: rect.left, y: rect.top, src: img, idx: i })
                      }}
                      onMouseLeave={() => setZoomPos(null)}
                      className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all hover:scale-110 hover:border-gold-400 ${
                        imgAtiva === i ? 'border-gold-500' : 'border-gray-100'
                      }`}>
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}"""

if antigo_minis in p:
    p = p.replace(antigo_minis, novo_minis)
    print('OK: miniaturas com zoom ao hover')
else:
    print('AVISO: miniaturas nao encontradas')

# Adiciona Lightbox e Zoom flutuante antes do return final
lightbox_zoom = """
  // Zoom flutuante e Lightbox
  const ZoomFlutuante = zoomPos ? (
    <div
      className="fixed z-50 pointer-events-none"
      style={{
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
        width: '75vw',
        height: '75vh',
        maxWidth: '900px',
        maxHeight: '900px',
      }}>
      <div className="w-full h-full rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
        <img src={zoomPos.src} alt="" className="w-full h-full object-contain bg-white" />
      </div>
    </div>
  ) : null

  const Lightbox = lightboxAberto ? (
    <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
      onClick={() => setLightboxAberto(false)}>
      <button className="absolute top-4 right-4 text-white text-3xl hover:text-gold-400 z-10">×</button>
      <button
        className="absolute left-4 top-1/2 -translate-y-1/2 text-white text-4xl hover:text-gold-400 z-10 px-4"
        onClick={e => { e.stopPropagation(); setLightboxIdx(i => Math.max(0, i - 1)) }}>
        ‹
      </button>
      <img
        src={imagens[lightboxIdx]}
        alt=""
        className="max-w-[90vw] max-h-[90vh] object-contain rounded-2xl shadow-2xl"
        onClick={e => e.stopPropagation()}
      />
      <button
        className="absolute right-4 top-1/2 -translate-y-1/2 text-white text-4xl hover:text-gold-400 z-10 px-4"
        onClick={e => { e.stopPropagation(); setLightboxIdx(i => Math.min(imagens.length - 1, i + 1)) }}>
        ›
      </button>
      <div className="absolute bottom-4 flex gap-2">
        {imagens.map((_, i) => (
          <button key={i} onClick={e => { e.stopPropagation(); setLightboxIdx(i) }}
            className={`w-2 h-2 rounded-full transition-all ${lightboxIdx === i ? 'bg-gold-400 w-4' : 'bg-white/50'}`} />
        ))}
      </div>
    </div>
  ) : null

"""

# Insere antes do return
if 'ZoomFlutuante' not in p:
    p = p.replace(
        "  return (\n    <div",
        lightbox_zoom + "  return (\n    <div"
    )
    print('OK: ZoomFlutuante e Lightbox adicionados')

# Adiciona os componentes no JSX
if '{ZoomFlutuante}' not in p:
    p = p.replace(
        "  return (\n    <div",
        "  return (\n    <>\n    {ZoomFlutuante}\n    {Lightbox}\n    <div"
    )
    # Fecha o fragment
    p = p.replace("  )\n}\n", "  </>\n  )\n}\n")
    print('OK: ZoomFlutuante e Lightbox inseridos no JSX')

with open(fp_produto, 'w', encoding='utf-8', newline='\n') as f:
    f.write(p)

print()
print('Rode agora:')
print('  git add .')
print('  git commit -m "Feat: drag & drop fotos no admin + zoom/lightbox na loja"')
print('  git push')
