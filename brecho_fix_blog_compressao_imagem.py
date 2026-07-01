import os

base = os.path.dirname(os.path.abspath(__file__))
fp_admin = os.path.join(base, 'src', 'app', 'admin-loja', 'page.tsx')

with open(fp_admin, 'r', encoding='utf-8') as f:
    c = f.read()

# Substitui funcao uploadBlogImg para comprimir antes de enviar
antigo = """  const uploadBlogImg = async (file: File) => {
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
  }"""

novo = """  const comprimirImagem = (file: File, maxWidth = 1200, qualidade = 0.8): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      const url = URL.createObjectURL(file)
      img.onload = () => {
        URL.revokeObjectURL(url)
        const canvas = document.createElement('canvas')
        let { width, height } = img
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width)
          width = maxWidth
        }
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        if (!ctx) { reject(new Error('Canvas nao suportado')); return }
        ctx.drawImage(img, 0, 0, width, height)
        canvas.toBlob(blob => {
          if (blob) resolve(blob)
          else reject(new Error('Erro ao comprimir'))
        }, 'image/jpeg', qualidade)
      }
      img.onerror = reject
      img.src = url
    })
  }

  const uploadBlogImg = async (file: File) => {
    setUploadingBlogImg(true)
    try {
      toast.loading('Comprimindo imagem...')
      const blob = await comprimirImagem(file, 1200, 0.8)
      const tamanhoMB = (blob.size / 1024 / 1024).toFixed(1)
      toast.dismiss()
      toast.loading(`Enviando (${tamanhoMB}MB)...`)

      const fd = new FormData()
      fd.append('file', blob, 'imagem.jpg')
      const res = await fetch('/api/admin/upload-blog', { method: 'POST', body: fd })
      const data = await res.json()
      toast.dismiss()

      if (data.url) {
        setFormBlog(prev => ({ ...prev, imagem_capa: data.url }))
        toast.success('Imagem enviada!')
      } else {
        toast.error(data.error || 'Erro ao enviar imagem')
      }
    } catch (err: any) {
      toast.dismiss()
      toast.error('Erro ao comprimir ou enviar imagem')
    }
    setUploadingBlogImg(false)
  }"""

if antigo in c:
    c = c.replace(antigo, novo)
    print('OK: funcao uploadBlogImg atualizada com compressao')
else:
    print('AVISO: funcao uploadBlogImg nao encontrada — verifique manualmente')

with open(fp_admin, 'w', encoding='utf-8', newline='\n') as f:
    f.write(c)

print()
print('Rode agora:')
print('  git add .')
print('  git commit -m "Blog: comprime imagem antes do upload (resolve limite 4.5MB Vercel)"')
print('  git push')
