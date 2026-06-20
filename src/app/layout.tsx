import type { Metadata } from 'next'
import './globals.css'
import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'
import WhatsAppFloat from '../components/layout/WhatsAppFloat'
import { Toaster } from 'react-hot-toast'
import { CarrinhoProvider } from '../lib/carrinhoContext'

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
