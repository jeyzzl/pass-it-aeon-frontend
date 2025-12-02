'use client'; 

import { PrivyProvider } from '@privy-io/react-auth';

export default function PrivyWrapper({ children }: { children: React.ReactNode }) {
  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || ''}
      config={{
        // Personaliza el login
        loginMethods: ['email', 'wallet', 'google', 'apple'],
        appearance: {
          theme: 'dark',
          accentColor: '#22c55e',
          logo: '/logo.png',
        },
        
        // CONFIGURACION DE CHAINS
        supportedChains: [
            { // Solana
            id: 101, // ID interno de Privy para Solana
            name: 'Solana',
            network: 'solana-mainnet',
            rpcUrls: { default: { http: ['https://solana-mainnet.g.alchemy.com/v2/heAo8ewdiKdcdXd5FYU8Z'] } },
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
        // Usamos 'as any' para forzar la configuración de Solana
        embeddedWallets: {
          // 1. Activamos Solana explícitamente
          solana: {
            createOnLogin: 'users-without-wallets',
          },
          // 2. Fallback general
          createOnLogin: 'users-without-wallets', 
        } as any, 
      }}
    >
      {children}
    </PrivyProvider>
  );
}