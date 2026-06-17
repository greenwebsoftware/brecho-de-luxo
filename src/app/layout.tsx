import type { Metadata } from 'next'
import './globals.css'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import WhatsAppFloat from '@/components/layout/WhatsAppFloat'
import { Toaster } from 'react-hot-toast'
import { CarrinhoProvider } from '@/lib/carrinhoContext'

export const metadata: Metadata = {
  title: 'Brecho de Luxo — Moda Premium com Historia',
  description: 'As melhores pecas de moda de luxo com preco acessivel. Bolsas, roupas e acessorios de marcas premium.',
  keywords: 'brecho, luxo, moda, segunda mao, bolsas, roupas, acessorios, premium',
  openGraph: {
    title: 'Brecho de Luxo',
    description: 'Moda Premium com Historia',
    url: 'https://brechodeluxo.com.br',
    siteName: 'Brecho de Luxo',
    locale: 'pt_BR',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
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
          <Footer />
          <WhatsAppFloat />
          <Toaster position="top-right" toastOptions={{
            style: { background: '#1a0533', color: 'white', borderRadius: '12px' }
          }} />
        </CarrinhoProvider>
      </body>
    </html>
  )
}
