import type { Metadata } from 'next'
import './globals.css'
import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'
import WhatsAppFloat from '../components/layout/WhatsAppFloat'
import { Toaster } from 'react-hot-toast'
import { CarrinhoProvider } from '../lib/carrinhoContext'
import { createServerClient } from '../lib/supabase-server'

export const metadata: Metadata = {
  title: 'Brechó de Luxo — Moda Premium com História',
  description: 'As melhores peças de moda de luxo com preço acessível. Bolsas, roupas e acessórios de marcas premium.',
  keywords: 'brechó, luxo, moda, segunda mão, bolsas, roupas, acessórios, premium',
  openGraph: {
    title: 'Brechó de Luxo',
    description: 'Moda Premium com História',
    url: 'https://brechodeluxo.com.br',
    siteName: 'Brechó de Luxo',
    locale: 'pt_BR',
    type: 'website',
  },
}

async function getSiteConfig() {
  try {
    const supabase = createServerClient()
    const { data } = await supabase.from('site_config').select('*').eq('id', 1).single()
    return data || {}
  } catch {
    return {}
  }
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const config = await getSiteConfig()

  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <CarrinhoProvider>
          <Header />
          <main>{children}</main>
          <Footer
            whatsapp={config.whatsapp}
            instagram={config.instagram}
            facebook={config.facebook}
            tiktok={config.tiktok}
            emailContato={config.email_contato}
          />
          <WhatsAppFloat whatsapp={config.whatsapp} />
          <Toaster position="top-right" toastOptions={{
            style: { background: '#1a0533', color: 'white', borderRadius: '12px' }
          }} />
        </CarrinhoProvider>
      </body>
    </html>
  )
}
