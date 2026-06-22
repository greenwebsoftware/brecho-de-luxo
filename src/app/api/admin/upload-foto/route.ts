import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '../../../../lib/supabase-server'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File

    if (!file) return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 })

    const supabase = createServerClient()

    // Gera nome unico
    const ext = file.name.split('.').pop() || 'jpg'
    const nome = `produtos/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

    // Converte para buffer
    const buffer = await file.arrayBuffer()

    const { error } = await supabase.storage
      .from('imagens')
      .upload(nome, buffer, {
        contentType: file.type,
        upsert: false,
      })

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })

    const { data: urlData } = supabase.storage
      .from('imagens')
      .getPublicUrl(nome)

    return NextResponse.json({ url: urlData.publicUrl })
  } catch (err) {
    return NextResponse.json({ error: 'Erro ao fazer upload' }, { status: 500 })
  }
}
