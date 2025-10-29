import './globals.css'
import type { Metadata } from 'next'
import Header from '@/components/Header'
import { Inter } from 'next/font/google'
const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Wavoo',
  description: 'Viaja. Conecta. Vive.',
  icons: {
    icon: '/favicon.svg',
    apple: '/icon-192.png',     // para iOS
  },
  manifest: '/manifest.json',
  themeColor: '#14b8a6',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <Header />
        {children}
      </body>
    </html>
  )
}
