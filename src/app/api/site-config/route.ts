import { NextResponse } from 'next/server'
import { createServerClient } from '../../../lib/supabase-server'

export const dynamic = 'force-dynamic'

// Rota publica - sem autenticacao - usada pelo Footer e WhatsAppFloat
export async function GET() {
  const supabase = createServerClient()
  const { data } = await supabase
    .from('site_config')
    .select('whatsapp, instagram, facebook, tiktok, email_contato, frete_gratis_acima, frete_fixo')
    .eq('id', 1)
    .single()

  return NextResponse.json({ data: data || {} }, {
    headers: { 'Cache-Control': 'no-store' },
  })
}
