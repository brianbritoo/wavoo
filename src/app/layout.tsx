import './globals.css'
import type { Metadata } from 'next'
import Header from '@/components/Header'   // 👈 importa tu header aquí

export const metadata: Metadata = {
  title: 'Wavoo',
  description: 'Viaja. Conecta. Vive.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body>
        <Header />      {/* 👈 ahora se muestra en todas las páginas */}
        {children}      {/* aquí se carga el contenido de cada página */}
      </body>
    </html>
  )
}
