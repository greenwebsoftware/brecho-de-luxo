import { NextRequest, NextResponse } from 'next/server'
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
