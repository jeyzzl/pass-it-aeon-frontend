// client-pass-it/layout.tsx

import type { Metadata } from 'next';
import './globals.css';

import PrivyWrapper from '@/components/PrivyWrapper';

import ClientLayoutWrapper from './ClientLayoutWrapper';

// --- CONFIGURACIÓN SEO Y REDES SOCIALES (VIRAL LOOP) ---
export const metadata: Metadata = {
  title: 'Pass It Ae[on] | Scan-Claim-Continue',
  description: 'Únete a la resistencia. Reclama tokens SPX gratis y expande la red. Solo por invitación. ¿Romperás la cadena?',
  
  // Metadatos para Facebook / Discord / WhatsApp
  openGraph: {
    title: 'INVITACIÓN CONFIDENCIAL: Pass It Ae[on]',
    description: 'Alguien te ha pasado la cadena. Reclama tus tokens SPX antes de que expiren.',
    url: 'https://passitaeon.com',
    siteName: 'Pass It Ae[on]',
    images: [
      {
        url: 'https://passitaeon.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Pass It Aeon - Enter the Cognisphere',
      },
    ],
    locale: 'es_MX',
    type: 'website',
  },
  
  // Metadatos para Twitter / X
  twitter: {
    card: 'summary_large_image',
    title: 'Pass It Ae[on] | Claim SPX6900',
    description: 'No rompas la cadena. Únete ahora.',
    images: ['https://passitaeon.com/og-image.jpg'], // La misma imagen
  },
  
  // Iconos
  // icons: {
  //   icon: '/favicon.png?v=2', // Tu logo como favicon
  //   shortcut: '/favicon.png?v=2',
  //   apple: '/favicon.png?v=2'
  // },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="es">
      <body className="bg-black text-white antialiased">

        {/* 1. Wrapper de Autenticación (Cliente) */}
        <PrivyWrapper>
           
          {/* Client-side wrapper for interactive elements */}
          <ClientLayoutWrapper>
            {children}
          </ClientLayoutWrapper>
        </PrivyWrapper>
      </body>
    </html>
  );
}