import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '../../../../lib/supabase-server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

// Lista de palavras ofensivas para filtro automático
const PALAVRAS_PROIBIDAS = [
  'palavrão1', 'palavrão2', // adicione conforme necessário
  'idiota', 'imbecil', 'burro', 'lixo', 'merda', 'viado', 'puta',
  'racista', 'nazi', 'fascista', 'vagabund', 'prostitut'
]

function verificarConteudo(texto: string): { status: string; motivo?: string } {
  const lower = texto.toLowerCase()

  for (const palavra of PALAVRAS_PROIBIDAS) {
    if (lower.includes(palavra)) {
      return { status: 'rejeitado', motivo: 'Conteúdo com linguagem ofensiva' }
    }
  }

  // Suspeito se tiver muitos links ou parece spam
  const links = (texto.match(/http/g) || []).length
  if (links > 2) return { status: 'suspeito', motivo: 'Possível spam com múltiplos links' }

  // Suspeito se tiver muitas maiúsculas (possível agressividade)
  const maiusculas = (texto.match(/[A-Z]/g) || []).length
  if (maiusculas > texto.length * 0.5 && texto.length > 20) {
    return { status: 'suspeito', motivo: 'Texto em maiúsculas excessivas' }
  }

  return { status: 'pendente' }
}

export async function GET(req: NextRequest) {
  const supabase = createServerClient()
  const { searchParams } = new URL(req.url)
  const postId = searchParams.get('post_id')

  if (!postId) return NextResponse.json({ data: [] })

  const { data } = await supabase
    .from('blog_comentarios')
    .select('id, nome_visitante, conteudo, curtidas, criado_em, clientes_site(nome)')
    .eq('post_id', postId)
    .eq('status', 'aprovado')
    .order('criado_em', { ascending: true })

  return NextResponse.json({ data: data || [] })
}

export async function POST(req: NextRequest) {
  const supabase = createServerClient()
  const body = await req.json()
  const { post_id, conteudo, nome_visitante, email_visitante } = body

  if (!post_id || !conteudo?.trim()) {
    return NextResponse.json({ error: 'Comentário não pode ser vazio' }, { status: 400 })
  }

  if (conteudo.trim().length < 5) {
    return NextResponse.json({ error: 'Comentário muito curto' }, { status: 400 })
  }

  // Verifica se o post existe e está publicado
  const { data: post } = await supabase
    .from('blog_posts')
    .select('id')
    .eq('id', post_id)
    .eq('publicado', true)
    .single()

  if (!post) return NextResponse.json({ error: 'Post não encontrado' }, { status: 404 })

  // Tenta obter cliente logado pelo token
  let clienteId = null
  const token = req.cookies.get('cliente_token')?.value
  if (token) {
    const supabaseAuth = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    const { data: userData } = await supabaseAuth.auth.getUser(token)
    if (userData?.user) clienteId = userData.user.id
  }

  // Visitante precisa informar nome e e-mail
  if (!clienteId && !nome_visitante?.trim()) {
    return NextResponse.json({ error: 'Informe seu nome para comentar' }, { status: 400 })
  }

  // Verifica conteúdo
  const verificacao = verificarConteudo(conteudo)

  const { data, error } = await supabase
    .from('blog_comentarios')
    .insert({
      post_id,
      cliente_id: clienteId,
      nome_visitante: clienteId ? null : nome_visitante,
      email_visitante: clienteId ? null : email_visitante,
      conteudo: conteudo.trim(),
      status: verificacao.status,
      motivo_rejeicao: verificacao.motivo || null,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  if (verificacao.status === 'rejeitado') {
    return NextResponse.json({
      ok: false,
      mensagem: 'Seu comentário foi removido por conter conteúdo inadequado.'
    })
  }

  if (verificacao.status === 'suspeito') {
    return NextResponse.json({
      ok: true,
      mensagem: 'Seu comentário está aguardando moderação antes de ser publicado.'
    })
  }

  return NextResponse.json({
    ok: true,
    mensagem: 'Comentário publicado!',
    data
  })
}
