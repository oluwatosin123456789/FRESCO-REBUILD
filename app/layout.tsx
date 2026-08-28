import { Analytics } from '@vercel/analytics/next'
import { DM_Serif_Display, Inter } from 'next/font/google'
import type { Metadata, Viewport } from 'next'
import './globals.css'
import './farmer-workspace.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const dmSerif = DM_Serif_Display({ subsets: ['latin'], weight: '400', variable: '--font-dm-serif' })

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://fresco.example'),
  title: 'Fresco · From Harvest to Opportunity | Verified Farmer Commerce',
  description:
    'Fresco turns agricultural commerce into financial identity through Fresco-verified produce, a farmer-owned Financial Passport, deterministic FEAP scoring and explainable opportunity discovery.',
  generator: 'Fresco',
  openGraph: {
    title: 'Fresco · From Harvest to Opportunity',
    description:
      'Verified commerce becomes financial identity. Fresco-verified produce, a farmer-owned Financial Passport and explainable opportunity.',
    type: 'website',
    images: ['/fresco-field.png'],
  },
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="bg-background">
      <body className={`${inter.variable} ${dmSerif.variable} antialiased`}>
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
