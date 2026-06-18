import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'

export async function GET() {
  const supabase = createServerClient()
  const { data } = await supabase
    .from('pedidos_online')
    .select('id, numero, cliente_nome, total, status, criado_em, integrado_modasystem')
    .order('criado_em', { ascending: false })
    .limit(50)
  return NextResponse.json({ data: data || [] })
}
