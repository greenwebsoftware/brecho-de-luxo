import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const { acao, email, senha, nome, telefone, cpf, data_nascimento, endereco } = await req.json()

    // CADASTRO
    if (acao === 'cadastrar') {
      const { data, error } = await supabase.auth.admin.createUser({
        email,
        password: senha,
        email_confirm: true,
        user_metadata: { nome, telefone, cpf },
      })

      if (error) {
        if (error.message.includes('already registered')) {
          return NextResponse.json({ error: 'Este e-mail já está cadastrado' }, { status: 400 })
        }
        return NextResponse.json({ error: error.message }, { status: 400 })
      }

      // Salva dados complementares na tabela clientes_site
      await supabase.from('clientes_site').upsert({
        id: data.user.id,
        nome,
        email,
        telefone: telefone || null,
        cpf: cpf || null,
        data_nascimento: data_nascimento || null,
        cep: endereco?.cep || null,
        logradouro: endereco?.logradouro || null,
        numero: endereco?.numero || null,
        complemento: endereco?.complemento || null,
        bairro: endereco?.bairro || null,
        cidade: endereco?.cidade || null,
        uf: endereco?.uf || null,
      })

      return NextResponse.json({ ok: true, mensagem: 'Cadastro realizado com sucesso! Faça login para continuar.' })
    }

    // LOGIN
    if (acao === 'login') {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password: senha })

      if (error) {
        return NextResponse.json({ error: 'E-mail ou senha incorretos' }, { status: 401 })
      }

      const res = NextResponse.json({
        ok: true,
        usuario: {
          id: data.user.id,
          email: data.user.email,
          nome: data.user.user_metadata?.nome,
        }
      })

      // Salva token como cookie httpOnly
      res.cookies.set('cliente_token', data.session.access_token, {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 dias
        path: '/',
      })

      return res
    }

    // LOGOUT
    if (acao === 'logout') {
      const res = NextResponse.json({ ok: true })
      res.cookies.delete('cliente_token')
      return res
    }

    // RECUPERAR SENHA
    if (acao === 'recuperar') {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/conta?modo=nova-senha`,
      })
      if (error) return NextResponse.json({ error: error.message }, { status: 400 })
      return NextResponse.json({ ok: true })
    }

    return NextResponse.json({ error: 'Ação inválida' }, { status: 400 })
  } catch (err) {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

// Busca dados do cliente logado
export async function GET(req: NextRequest) {
  const token = req.cookies.get('cliente_token')?.value
  if (!token) return NextResponse.json({ usuario: null })

  try {
    const { data, error } = await supabase.auth.getUser(token)
    if (error || !data.user) return NextResponse.json({ usuario: null })

    const { data: cliente } = await supabase
      .from('clientes_site')
      .select('*')
      .eq('id', data.user.id)
      .single()

    return NextResponse.json({ usuario: { ...data.user, ...cliente } })
  } catch {
    return NextResponse.json({ usuario: null })
  }
}
