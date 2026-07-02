import os, re

base = os.path.dirname(os.path.abspath(__file__))
fp = os.path.join(base, 'src', 'components', 'loja', 'ProdutoDetalhes.tsx')

with open(fp, 'r', encoding='utf-8') as f:
    c = f.read()

# Remove o bloco ZoomFlutuante e Lightbox fora do JSX
c = re.sub(
    r'\n  // Zoom flutuante e Lightbox\n  const ZoomFlutuante.*?const Lightbox.*?\) : null\n\n',
    '\n',
    c,
    flags=re.DOTALL
)
print('OK: bloco externo removido')

# Remove as referencias no JSX
c = c.replace("    {ZoomFlutuante}\n    {Lightbox}\n    <div", "    <div")
c = c.replace("  </>\n  )\n}\n", "  )\n}\n")
c = c.replace("  return (\n    <>", "  return (")
print('OK: referencias JSX removidas')

# Adiciona Lightbox e Zoom dentro do return, antes do fechamento
lightbox_jsx = """
      {/* ZOOM FLUTUANTE */}
      {zoomPos && (
        <div className="fixed z-50 pointer-events-none" style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)', width: '75vw', height: '75vh', maxWidth: '900px', maxHeight: '900px' }}>
          <div className="w-full h-full rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
            <img src={zoomPos.src} alt="" className="w-full h-full object-contain bg-white" />
          </div>
        </div>
      )}

      {/* LIGHTBOX */}
      {lightboxAberto && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center" onClick={() => setLightboxAberto(false)}>
          <button className="absolute top-4 right-4 text-white text-3xl hover:text-gold-400 z-10">×</button>
          <button className="absolute left-4 top-1/2 -translate-y-1/2 text-white text-4xl hover:text-gold-400 z-10 px-4"
            onClick={e => { e.stopPropagation(); setLightboxIdx(i => Math.max(0, i - 1)) }}>‹</button>
          <img src={imagens[lightboxIdx]} alt="" className="max-w-[90vw] max-h-[90vh] object-contain rounded-2xl shadow-2xl" onClick={e => e.stopPropagation()} />
          <button className="absolute right-4 top-1/2 -translate-y-1/2 text-white text-4xl hover:text-gold-400 z-10 px-4"
            onClick={e => { e.stopPropagation(); setLightboxIdx(i => Math.min(imagens.length - 1, i + 1)) }}>›</button>
          <div className="absolute bottom-4 flex gap-2">
            {imagens.map((_, i) => (
              <button key={i} onClick={e => { e.stopPropagation(); setLightboxIdx(i) }}
                className={`w-2 h-2 rounded-full transition-all ${lightboxIdx === i ? 'bg-gold-400 w-4' : 'bg-white/50'}`} />
            ))}
          </div>
        </div>
      )}
"""

# Insere antes do último fechamento do componente
c = c.rstrip()
if c.endswith(')'):
    c = c[:-1] + lightbox_jsx + '\n  )'
    print('OK: Lightbox e Zoom inseridos no JSX')
else:
    # Tenta inserir antes da última div de fechamento
    idx = c.rfind('    </div>\n  )')
    if idx > 0:
        c = c[:idx + 10] + lightbox_jsx + c[idx + 10:]
        print('OK: Lightbox inserido antes do fechamento')
    else:
        print('AVISO: ponto de insercao nao encontrado')

with open(fp, 'w', encoding='utf-8', newline='\n') as f:
    f.write(c)

print()
print('Rode agora:')
print('  git add .')
print('  git commit -m "Fix: Lightbox e Zoom dentro do escopo correto"')
print('  git push')
