import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const token = req.cookies.get('cliente_token')?.value
  if (!token) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  try {
    const { data: userData } = await supabase.auth.getUser(token)
    if (!userData.user) return NextResponse.json({ error: 'Sessão inválida' }, { status: 401 })

    const { nome, telefone, nova_senha, endereco } = await req.json()

    // Atualiza senha se fornecida
    if (nova_senha) {
      await supabase.auth.admin.updateUserById(userData.user.id, {
        password: nova_senha,
        user_metadata: { nome },
      })
    } else {
      await supabase.auth.admin.updateUserById(userData.user.id, {
        user_metadata: { nome },
      })
    }

    // Atualiza dados complementares
    await supabase.from('clientes_site').update({
      nome,
      telefone: telefone || null,
      cep: endereco?.cep || null,
      logradouro: endereco?.logradouro || null,
      numero: endereco?.numero || null,
      complemento: endereco?.complemento || null,
      bairro: endereco?.bairro || null,
      cidade: endereco?.cidade || null,
      uf: endereco?.uf || null,
    }).eq('id', userData.user.id)

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Erro ao atualizar dados' }, { status: 500 })
  }
}
