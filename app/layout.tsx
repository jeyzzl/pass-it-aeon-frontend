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
              accentColor: '#22c55e', // Verde Matrix
              logo: 'https://imgur.com/a/9AW95Sz', // Opcional
            },
            // --- CONFIGURACIÓN DE RED (SOLANA) ---
            solanaClusters: [
              { 
                name: 'devnet', 
                rpcUrl: 'https://api.devnet.solana.com' 
              }
            ],
            // Crea wallets integradas para usuarios de email/google
            embeddedWallets: {
              // ethereum: {
              //   createOnLogin: 'users-without-wallets',
              // },

              createOnLogin: 'users-without-wallets',

              // Refuerzo específico si la versión lo soporta
              // solana: {
              //   createOnLogin: 'users-without-wallets',
              // },
            },
          }}
        >
          {children}
        </PrivyProvider>
      </body>
    </html>
  );
}