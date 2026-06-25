import { NextResponse } from 'next/server'

export async function GET() {
  const content = `User-agent: *
Allow: /
Disallow: /admin-loja
Disallow: /api/
Disallow: /checkout
Disallow: /conta
Disallow: /pedidos

# Sitemaps
Sitemap: https://brechodluxo.com.br/sitemap.xml

# Google
User-agent: Googlebot
Allow: /
Disallow: /admin-loja
Disallow: /api/

# Bing
User-agent: Bingbot
Allow: /
Disallow: /admin-loja
`

  return new NextResponse(content, {
    headers: { 'Content-Type': 'text/plain' },
  })
}
