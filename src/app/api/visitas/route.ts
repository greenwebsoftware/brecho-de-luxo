import { NextResponse } from 'next/server'
import { createServerClient } from '../../../lib/supabase-server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = createServerClient()

  // Incrementa e retorna total
  const { data } = await supabase
    .from('site_visitas')
    .select('total')
    .eq('id', 1)
    .single()

  const novoTotal = (data?.total || 1247) + 1

  await supabase
    .from('site_visitas')
    .update({ total: novoTotal, atualizado_em: new Date().toISOString() })
    .eq('id', 1)

  return NextResponse.json({ total: novoTotal })
}
