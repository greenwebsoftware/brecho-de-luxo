import { NextResponse } from 'next/server'
import { createServerClient } from '../../lib/supabase-server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const baseUrl = 'https://brechodluxo.com.br'
  const now = new Date().toISOString()

  // Busca produtos visíveis
  const supabase = createServerClient()
  const { data: produtos } = await supabase
    .from('produtos')
    .select('id, atualizado_em')
    .eq('ativo', true)
    .eq('visivel_site', true)
    .limit(500)

  const { data: posts } = await supabase
    .from('blog_posts')
    .select('slug, atualizado_em')
    .eq('publicado', true)
    .limit(200)

  const staticPages = [
    { url: '/', priority: '1.0', changefreq: 'daily' },
    { url: '/loja', priority: '0.9', changefreq: 'daily' },
    { url: '/loja?cat=bolsas', priority: '0.8', changefreq: 'daily' },
    { url: '/loja?cat=roupas', priority: '0.8', changefreq: 'daily' },
    { url: '/loja?cat=calcados', priority: '0.8', changefreq: 'daily' },
    { url: '/loja?cat=acessorios', priority: '0.8', changefreq: 'daily' },
    { url: '/blog', priority: '0.7', changefreq: 'weekly' },
    { url: '/sobre', priority: '0.6', changefreq: 'monthly' },
    { url: '/contato', priority: '0.6', changefreq: 'monthly' },
  ]

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">

  ${staticPages.map(p => `<url>
    <loc>${baseUrl}${p.url}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`).join('\n  ')}

  ${(produtos || []).map(p => `<url>
    <loc>${baseUrl}/loja/${p.id}</loc>
    <lastmod>${p.atualizado_em || now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`).join('\n  ')}

  ${(posts || []).map(p => `<url>
    <loc>${baseUrl}/blog/${p.slug}</loc>
    <lastmod>${p.atualizado_em || now}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`).join('\n  ')}

</urlset>`

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=86400',
    },
  })
}
