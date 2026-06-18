import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { senha } = await req.json()

  if (!process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Senha admin não configurada no servidor' }, { status: 500 })
  }

  if (senha === process.env.ADMIN_PASSWORD) {
    const res = NextResponse.json({ ok: true })
    res.cookies.set('admin_token', senha, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 dias
      path: '/',
    })
    return res
  }

  return NextResponse.json({ error: 'Senha incorreta' }, { status: 401 })
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true })
  res.cookies.delete('admin_token')
  return res
}
