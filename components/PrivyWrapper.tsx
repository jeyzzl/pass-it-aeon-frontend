'use client'; 

import { PrivyProvider } from '@privy-io/react-auth';
import {toSolanaWalletConnectors} from "@privy-io/react-auth/solana";
import { base } from 'framer-motion/client';

// Solana Configuration
const solanaMainnet = {
  id: 101,
  name: 'Solana',
  network: 'solana-mainnet',
  rpcUrls: { 
    default: { 
      http: ['https://solana-mainnet.g.alchemy.com/v2/heAo8ewdiKdcdXd5FYU8Z'],
      webSocket: ['wss://solana-mainnet.g.alchemy.com/v2/heAo8ewdiKdcdXd5FYU8Z']
    } 
  },
  nativeCurrency: { name: 'Solana', symbol: 'SOL', decimals: 9 },
  blockExplorers: {
    default: { name: 'Solscan', url: 'https://solscan.io' },
  },
}

// EVM Chain Configurations
const ethereumMainnet = {
  id: 1,
  name: 'Ethereum',
  network: 'ethereum-mainnet',
  rpcUrls: { 
    default: { 
      http: ['https://eth-mainnet.g.alchemy.com/v2/heAo8ewdiKdcdXd5FYU8Z'],
      webSocket: ['wss://eth-mainnet.g.alchemy.com/v2/heAo8ewdiKdcdXd5FYU8Z']
    } 
  },
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  blockExplorers: {
    default: { name: 'Etherscan', url: 'https://etherscan.io' },
  },
};

const baseMainnet = {
  id: 8453,
  name: 'Base',
  network: 'base-mainnet',
  rpcUrls: { 
    default: { 
      http: ['https://base-mainnet.g.alchemy.com/v2/heAo8ewdiKdcdXd5FYU8Z'],
      webSocket: ['wss://base-mainnet.g.alchemy.com/v2/heAo8ewdiKdcdXd5FYU8Z']
    } 
  },
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  blockExplorers: {
    default: { name: 'Basescan', url: 'https://basescan.org' },
  },
};

const solanaConnectors = toSolanaWalletConnectors({
  shouldAutoConnect: false,
});

export default function PrivyWrapper({ children }: { children: React.ReactNode }) {
  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || ''}
      config={{

        appearance: {
          accentColor: '#6A6FF5',
          theme: '#222224',
          showWalletLoginFirst: false,
          logo: '/logo.png',
          walletChainType: 'ethereum-and-solana',
          walletList: [
            'phantom',
            'metamask',
            'detected_solana_wallets',
            'detected_ethereum_wallets',
            'coinbase_wallet',
            'rainbow',
            'okx_wallet',
            'wallet_connect'
          ]
        },

        loginMethods: ['email', 'wallet', 'google', 'apple'],

        supportedChains: [solanaMainnet, ethereumMainnet, baseMainnet],

        externalWallets: {
          solana: {
            connectors: solanaConnectors,
          }
        },

        embeddedWallets: {
          showWalletUIs: false,
          ethereum: { createOnLogin: 'users-without-wallets'},
          solana: { createOnLogin: 'users-without-wallets'}
        } as any,
      }}
    >
      {children}
    </PrivyProvider>
  );
}