'use client';

import { useState } from 'react';
import { Copy, Check, Wallet, Heart } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

// REPLACE THESE WITH YOUR ACTUAL PUBLIC FAUCET ADDRESSES
const WALLETS = [
  { 
    network: 'Solana', 
    symbol: 'SOL', 
    address: 'A6z6D9xJEJZ2dF2ie14tgRFa5YSGTe9wNtKqHzBCUj8A', 
    color: 'text-purple-400',
    bg: 'bg-purple-400/10',
    border: 'border-purple-400/20'
  },
  { 
    network: 'Base / ETH', 
    symbol: 'ETH', 
    address: '0x6C2Df83C4442b3F6B0407EDa831857bFd8EC0051', 
    color: 'text-blue-400',
    bg: 'bg-blue-400/10',
    border: 'border-blue-400/20'
  }
];

export default function DonateCard({ className = '' }: { className?: string }) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const { t } = useLanguage();

  const handleCopy = (address: string, index: number) => {
    navigator.clipboard.writeText(address);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className={`bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 backdrop-blur-sm ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500">
          <Heart className="w-5 h-5 fill-current" />
        </div>
        <div>
          <h3 className="text-zinc-100 font-bold text-sm uppercase tracking-wide">
            {t.donatecard_support}
          </h3>
          <p className="text-zinc-500 text-xs">
            {t.donatecard_donations}
          </p>
        </div>
      </div>

      {/* Wallet List */}
      <div className="space-y-3">
        {WALLETS.map((wallet, idx) => (
          <div 
            key={wallet.network}
            className={`group relative flex items-center justify-between p-3 rounded-lg border transition-all hover:border-zinc-600 ${wallet.bg} ${wallet.border}`}
          >
            {/* Left: Icon & Info */}
            <div className="flex items-center gap-3 overflow-hidden">
              <div className={`flex-shrink-0 w-8 h-8 rounded flex items-center justify-center font-bold text-xs ${wallet.color} bg-black/20`}>
                {wallet.symbol}
              </div>
              <div className="flex flex-col min-w-0">
                <span className={`text-[10px] font-bold uppercase ${wallet.color}`}>
                  {wallet.network}
                </span>
                <span className="text-zinc-300 text-xs font-mono truncate w-32 sm:w-auto opacity-80 group-hover:opacity-100 transition-opacity">
                  {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}
                </span>
              </div>
            </div>

            {/* Right: Copy Button */}
            <button
              onClick={() => handleCopy(wallet.address, idx)}
              className="ml-2 p-2 rounded-md hover:bg-black/20 text-zinc-400 hover:text-white transition-colors focus:outline-none"
              title="Copy Address"
            >
              {copiedIndex === idx ? (
                <Check className="w-4 h-4 text-green-400" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>
        ))}
      </div>
      
      {/* Footer Text */}
      <div className="mt-4 text-center">
        <p className="text-[10px] text-zinc-600">
          {t.donatecard_proceeds}
        </p>
      </div>
    </div>
  );
}