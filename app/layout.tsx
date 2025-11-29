import type { Metadata } from 'next';
import './globals.css';
import PrivyWrapper from '@/components/PrivyWrapper';
import { LanguageProvider } from '@/context/LanguageContext';
import LanguageSwitcher from '@/components/LanguageSwitcher';

// --- CONFIGURACIÓN SEO Y REDES SOCIALES (VIRAL LOOP) ---
export const metadata: Metadata = {
  title: 'Pass It Ae[on] | The Viral Airdrop',
  description: 'Únete a la resistencia. Reclama tokens SPX gratis y expande la red. Solo por invitación. ¿Romperás la cadena?',
  
  // Metadatos para Facebook / Discord / WhatsApp
  openGraph: {
    title: 'INVITACIÓN CONFIDENCIAL: Pass It Ae[on]',
    description: 'Alguien te ha pasado el testigo. Reclama tus tokens SPX antes de que expiren.',
    url: 'https://passitaeon.com',
    siteName: 'Pass It Ae[on]',
    images: [
      {
        url: 'https://passitaeon.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Pass It Aeon - Viral Network',
      },
    ],
    locale: 'es_MX',
    type: 'website',
  },
  
  // Metadatos para Twitter / X
  twitter: {
    card: 'summary_large_image',
    title: 'Pass It Ae[on] | SPX Airdrop',
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
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="bg-black text-white antialiased">
        {/* 1. Wrapper de Autenticación (Cliente) */}
        <PrivyWrapper>
           
           {/* 2. Wrapper de Idioma (Cliente) */}
           <LanguageProvider>
              
              {/* 3. Botón Flotante de Idioma */}
              <LanguageSwitcher />
              
              {/* 4. La Aplicación */}
              {children}

           </LanguageProvider>
        </PrivyWrapper>
      </body>
    </html>
  );
}