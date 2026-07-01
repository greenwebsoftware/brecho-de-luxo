import os

base = os.path.dirname(os.path.abspath(__file__))

# ── 1. Corrige next.config.js para aceitar qualquer dominio HTTPS ──
fp_next = os.path.join(base, 'next.config.js')

novo_next = """/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.supabase.co' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: '**.googleapis.com' },
      { protocol: 'https', hostname: '**.gstatic.com' },
      { protocol: 'https', hostname: '**.imgur.com' },
      { protocol: 'https', hostname: '**.unsplash.com' },
      { protocol: 'https', hostname: '**.pexels.com' },
      { protocol: 'https', hostname: '**.instagram.com' },
      { protocol: 'https', hostname: '**.cdninstagram.com' },
    ],
    // Permite qualquer URL externa via tag <img> normal (nao Next Image)
    unoptimized: false,
  },
}
module.exports = nextConfig
"""

with open(fp_next, 'w', encoding='utf-8', newline='\n') as f:
    f.write(novo_next)
print('OK: next.config.js atualizado para aceitar mais dominios')

# ── 2. Cria API de upload de imagem para o blog ───────────────
api_upload_dir = os.path.join(base, 'src', 'app', 'api', 'admin', 'upload-blog')
os.makedirs(api_upload_dir, exist_ok=True)

with open(os.path.join(api_upload_dir, 'route.ts'), 'w', encoding='utf-8', newline='\n') as f:
    f.write('''import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '../../../../lib/supabase-server'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const supabase = createServerClient()
    const formData = await req.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 })
    }

    // Valida tipo
    const tiposPermitidos = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
    if (!tiposPermitidos.includes(file.type)) {
      return NextResponse.json({ error: 'Tipo de arquivo nao permitido. Use JPG, PNG, WebP ou GIF.' }, { status: 400 })
    }

    // Valida tamanho (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'Arquivo muito grande. Maximo 5MB.' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = new Uint8Array(bytes)

    const ext = file.name.split('.').pop() || 'jpg'
    const nomeArquivo = `blog/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

    const { data, error } = await supabase.storage
      .from('imagens')
      .upload(nomeArquivo, buffer, {
        contentType: file.type,
        upsert: false,
      })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    const { data: urlData } = supabase.storage
      .from('imagens')
      .getPublicUrl(nomeArquivo)

    return NextResponse.json({ url: urlData.publicUrl })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Erro ao fazer upload' }, { status: 500 })
  }
}
''')
print('OK: API /api/admin/upload-blog criada')

# ── 3. Atualiza o modal de blog no admin para ter upload de imagem ──
fp_admin = os.path.join(base, 'src', 'app', 'admin-loja', 'page.tsx')

with open(fp_admin, 'r', encoding='utf-8') as f:
    c = f.read()

# Adiciona estado para upload de imagem do blog
if 'uploadingBlogImg' not in c:
    c = c.replace(
        "  const [salvandoBlog, setSalvandoBlog] = useState(false)",
        "  const [salvandoBlog, setSalvandoBlog] = useState(false)\n  const [uploadingBlogImg, setUploadingBlogImg] = useState(false)\n  const blogImgRef = useRef<HTMLInputElement>(null)"
    )
    print('OK: estado uploadingBlogImg adicionado')

# Adiciona funcao de upload de imagem do blog
if 'uploadBlogImg' not in c:
    c = c.replace(
        "  const salvarBlog = async () => {",
        """  const uploadBlogImg = async (file: File) => {
    setUploadingBlogImg(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/admin/upload-blog', { method: 'POST', body: fd })
      const data = await res.json()
      if (data.url) {
        setFormBlog(prev => ({ ...prev, imagem_capa: data.url }))
        toast.success('Imagem enviada!')
      } else {
        toast.error(data.error || 'Erro ao enviar imagem')
      }
    } catch {
      toast.error('Erro ao enviar imagem')
    }
    setUploadingBlogImg(false)
  }

  const salvarBlog = async () => {"""
    )
    print('OK: funcao uploadBlogImg adicionada')

# Atualiza campo de imagem capa no modal do blog para ter botao de upload
antigo_img = """                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block flex items-center gap-1"><ImageIcon className="w-3.5 h-3.5" /> Imagem Capa (URL)</label>
                  <input value={formBlog.imagem_capa} onChange={e => setFormBlog({ ...formBlog, imagem_capa: e.target.value })} className="input-luxo" placeholder="https://..." />
                </div>"""

novo_img = """                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block flex items-center gap-1"><ImageIcon className="w-3.5 h-3.5" /> Imagem Capa</label>
                  <input value={formBlog.imagem_capa} onChange={e => setFormBlog({ ...formBlog, imagem_capa: e.target.value })} className="input-luxo mb-2" placeholder="Cole uma URL ou faça upload abaixo..." />
                  <input ref={blogImgRef} type="file" accept="image/*" className="hidden" onChange={e => { if (e.target.files?.[0]) uploadBlogImg(e.target.files[0]) }} />
                  <button type="button" onClick={() => blogImgRef.current?.click()} disabled={uploadingBlogImg}
                    className="flex items-center gap-2 px-4 py-2 border border-dashed border-gray-300 rounded-xl text-sm text-gray-500 hover:border-gold-400 disabled:opacity-50">
                    {uploadingBlogImg ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    {uploadingBlogImg ? 'Enviando...' : 'Upload do computador'}
                  </button>
                  {formBlog.imagem_capa && (
                    <img src={formBlog.imagem_capa} alt="Preview" className="mt-2 w-full h-32 object-cover rounded-xl" />
                  )}
                </div>"""

if antigo_img in c:
    c = c.replace(antigo_img, novo_img)
    print('OK: campo imagem capa atualizado com upload')
else:
    print('AVISO: campo imagem capa nao encontrado — verifique manualmente')

with open(fp_admin, 'w', encoding='utf-8', newline='\n') as f:
    f.write(c)

print()
print('Rode agora:')
print('  git add .')
print('  git commit -m "Blog: upload de imagem local + aceita URLs externas"')
print('  git push')
