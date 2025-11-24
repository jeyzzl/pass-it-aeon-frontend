'use client'; // Importante: Privy usa contexto de React

import { PrivyProvider } from '@privy-io/react-auth';
import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
              accentColor: '#22c55e',
              logo: 'https://i.imgur.com/pgSIb1F.png',
            },
            // --- CONFIGURACIÓN DE RED (SOLANA) ---
            solanaClusters: [
              { 
                name: 'devnet', 
                rpcUrl: 'https://api.devnet.solana.com' 
              }
            ],
            // --- CONFIGURACIÓN DE WALLETS ---
            // Esto obliga a TypeScript a aceptar la configuración de 'solana'
            embeddedWallets: {
              createOnLogin: 'users-without-wallets',
              requireUserPasswordOnCreate: false,
              solana: {
                createOnLogin: 'users-without-wallets',
              }
            } as any,
          }}
        >
          {children}
        </PrivyProvider>
      </body>
    </html>
  );
}