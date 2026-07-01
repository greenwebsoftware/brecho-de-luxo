import type { Metadata } from 'next'
import './globals.css'
import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'
import WhatsAppFloat from '../components/layout/WhatsAppFloat'
import { Toaster } from 'react-hot-toast'
import { CarrinhoProvider } from '../lib/carrinhoContext'

const SITE_URL = 'https://brechodluxo.com.br'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Brechó de Luxo Jundiaí | Bolsas, Roupas e Acessórios Premium',
    template: '%s | Brechó de Luxo',
  },
  description: 'O melhor brechó de luxo de Jundiaí-SP. Peças autênticas de Louis Vuitton, Chanel, Gucci e mais. Moda circular premium para São Paulo e região de Campinas. Frete grátis acima de R$299.',
  keywords: [
    'brechó de luxo', 'brecho de luxo', 'brechó', 'moda circular', 'moda de luxo',
    'moda premium', 'bolsas de luxo', 'calçados de luxo', 'acessórios de luxo',
    'roupas de luxo', 'peças únicas', 'brechó Jundiaí', 'brechó São Paulo',
    'brechó Campinas', 'segunda mão luxo', 'Louis Vuitton segunda mão',
    'Chanel segunda mão', 'Gucci segunda mão', 'bolsas premium', 'moda sustentável',
  ],
  authors: [{ name: 'Brechó de Luxo', url: SITE_URL }],
  creator: 'Brechó de Luxo',
  publisher: 'Brechó de Luxo',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: SITE_URL,
    siteName: 'Brechó de Luxo',
    title: 'Brechó de Luxo Jundiaí | Bolsas, Roupas e Acessórios Premium',
    description: 'O melhor brechó de luxo de Jundiaí-SP. Peças autênticas de marcas premium com autenticidade garantida. Moda circular para São Paulo e região de Campinas.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Brechó de Luxo — Moda Premium Jundiaí SP',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Brechó de Luxo Jundiaí | Moda Premium',
    description: 'Bolsas, roupas, calçados e acessórios de luxo em Jundiaí-SP.',
    images: ['/og-image.jpg'],
  },
  alternates: {
    canonical: SITE_URL,
  },
  verification: {
    google: 'k4jyCmIH2z84Jy0_dS_H52R5hBTc3RFDu0E14c66lYI',
  },
  category: 'shopping',
}

// Schema.org LocalBusiness + Store
const schemaOrg = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': ['Store', 'LocalBusiness', 'ClothingStore'],
      '@id': `${SITE_URL}/#store`,
      name: 'Brechó de Luxo',
      description: 'Brechó de luxo especializado em peças premium de marcas internacionais. Bolsas, roupas, calçados e acessórios com autenticidade garantida.',
      url: SITE_URL,
      telephone: '+5511954021522',
      email: 'contato@brechodluxo.com.br',
      image: `${SITE_URL}/og-image.jpg`,
      logo: `${SITE_URL}/logo.png`,
      priceRange: '$$',
      currenciesAccepted: 'BRL',
      paymentAccepted: 'Credit Card, Debit Card, PIX',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Jundiaí',
        addressRegion: 'SP',
        addressCountry: 'BR',
        postalCode: '13201-032',
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: -23.1857,
        longitude: -46.8975,
      },
      areaServed: [
        { '@type': 'City', name: 'Jundiaí' },
        { '@type': 'City', name: 'São Paulo' },
        { '@type': 'City', name: 'Campinas' },
        { '@type': 'State', name: 'São Paulo' },
      ],
      openingHoursSpecification: [
        {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
          opens: '09:00',
          closes: '18:00',
        },
        {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: 'Saturday',
          opens: '09:00',
          closes: '13:00',
        },
      ],
      sameAs: [
        'https://www.instagram.com/brechodeluxo.20',
        'https://www.tiktok.com/@brechodeluxo.20',
      ],
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: 'Peças de Luxo',
        itemListElement: [
          { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Bolsas de Luxo' } },
          { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Roupas de Luxo' } },
          { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Calçados de Luxo' } },
          { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Acessórios de Luxo' } },
        ],
      },
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      url: SITE_URL,
      name: 'Brechó de Luxo',
      description: 'Moda circular premium em Jundiaí-SP',
      publisher: { '@id': `${SITE_URL}/#store` },
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${SITE_URL}/loja?busca={search_term_string}`,
        },
        'query-input': 'required name=search_term_string',
      },
      inLanguage: 'pt-BR',
    },
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="canonical" href={SITE_URL} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaOrg) }}
        />
      </head>
      <body>
        <CarrinhoProvider>
          <Header />
          <main>{children}</main>
          <Footer />
          <WhatsAppFloat />
          <Toaster position="top-right" toastOptions={{
            style: { background: '#1a1a1a', color: 'white', borderRadius: '12px' }
          }} />
        </CarrinhoProvider>
      </body>
    </html>
  )
}
