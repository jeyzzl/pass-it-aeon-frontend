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
            // CONFIGURACION DE CHAINS
            supportedChains: [
              { // Solana Devnet
                id: 103, // ID interno de Privy para Solana Devnet
                name: 'Solana Devnet',
                network: 'solana-devnet',
                rpcUrls: { default: { http: ['https://api.devnet.solana.com'] } },
                nativeCurrency: { name: 'Solana', symbol: 'SOL', decimals: 9 },
              },
              { // Base Sepolia (Red de pruebas EVM rápida y barata)
                id: 84532,
                name: 'Base Sepolia',
                network: 'base-sepolia',
                rpcUrls: { default: { http: ['https://sepolia.base.org'] } },
                nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
              }
            ],
            // --- CONFIGURACIÓN DE WALLETS ---
            // Esto obliga a TypeScript a aceptar la configuración de 'solana'
            embeddedWallets: {
              createOnLogin: 'users-without-wallets',
            },
          }}
        >
          {children}
        </PrivyProvider>
      </body>
    </html>
  );
}