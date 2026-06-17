import { createClient } from '@supabase/supabase-js'

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Cliente para uso no browser
export const supabase = createClient(URL, ANON)

// Cliente para uso no servidor (server components e API routes)
export function createServerClient() {
  return createClient(URL, SERVICE, {
    auth: { autoRefreshToken: false, persistSession: false }
  })
}
