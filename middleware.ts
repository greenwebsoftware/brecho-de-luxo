import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname

  // Protege APIs admin (exceto a de login)
  if (path.startsWith('/api/admin') && !path.startsWith('/api/admin/login')) {
    const token = req.cookies.get('admin_token')?.value
    if (!token || token !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/api/admin/:path*'],
}
