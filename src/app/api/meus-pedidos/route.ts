import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const token = req.cookies.get('cliente_token')?.value
  if (!token) return NextResponse.json({ data: [] })

  try {
    const { data: userData } = await supabase.auth.getUser(token)
    if (!userData.user) return NextResponse.json({ data: [] })

    // Busca cliente pelo user_id
    const { data: cliente } = await supabase
      .from('clientes_site')
      .select('id')
      .eq('id', userData.user.id)
      .single()

    if (!cliente) return NextResponse.json({ data: [] })

    // Busca pedidos do cliente
    const { data: pedidos } = await supabase
      .from('pedidos_online')
      .select('*, itens_pedido_online(quantidade, nome_produto)')
      .eq('cliente_id', cliente.id)
      .order('criado_em', { ascending: false })

    return NextResponse.json({ data: pedidos || [] })
  } catch {
    return NextResponse.json({ data: [] })
  }
}
