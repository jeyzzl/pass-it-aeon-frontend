// client-pass-it/layout.tsx

import type { Metadata } from 'next';
import './globals.css';

import PrivyWrapper from '@/components/PrivyWrapper';

import ClientLayoutWrapper from './ClientLayoutWrapper';

// --- CONFIGURACIÓN SEO Y REDES SOCIALES (VIRAL LOOP) ---
export const metadata: Metadata = {
  title: 'PASS IT [AE]ON | Scan-Claim-Share',
  description: 'Join the movement. Claim SPX tokens and expand the network. Invitation only. Will you break the chain?',
  
  // Metadatos para Facebook / Discord / WhatsApp
  openGraph: {
    title: 'PASS IT [AE]ON',
    description: 'Claim SPX before they expire.',
    url: 'https://passitaeon.com',
    siteName: 'PASS IT [AE]ON',
    images: [
      {
        url: 'https://passitaeon.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'PASS IT [AE]ON - Enter the Cognisphere',
      },
    ],
    locale: 'es_MX',
    type: 'website',
  },
  
  // Metadatos para Twitter / X
  twitter: {
    card: 'summary_large_image',
    title: 'PASS IT [AE]ON - Claim SPX6900',
    description: 'Claim Now. Join the Movement',
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