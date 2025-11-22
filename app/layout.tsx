'use client'; // Importante: Privy usa contexto de React

import { PrivyProvider } from '@privy-io/react-auth';
import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // --- DEBUG ---
  console.log("Privy App ID:", process.env.NEXT_PUBLIC_PRIVY_APP_ID); 
  // Si esto imprime "undefined" o vacío en tu terminal o consola del navegador, ahí está el error.
  return (
    <html lang="es">
      <body>
        <PrivyProvider
          appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || ''}
          config={{
            // Personaliza el login
            loginMethods: ['email', 'wallet', 'google', 'apple'],
            appearance: {
              theme: 'dark',
              accentColor: '#22c55e', // Nuestro verde Matrix
              logo: 'https://tusitio.com/logo.png', // Opcional
            },
            // Crea wallets integradas para usuarios de email/google
            embeddedWallets: {
              ethereum: {
                createOnLogin: 'users-without-wallets',
              },
              // Si también quieres que genere wallet de Solana automáticamente:
              solana: {
                createOnLogin: 'users-without-wallets',
              },
            },
          }}
        >
          {children}
        </PrivyProvider>
      </body>
    </html>
  );
}