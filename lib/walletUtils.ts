// client-pass-it/lib/walletUtils.ts

export const getActiveWalletAddress = (user: any): string | null => {
  if (!user) return null;
  
  // Priority 1: Linked external wallets (Solana or EVM)
  const solanaAccount = user?.linkedAccounts?.find((a: any) => 
    a.type === 'wallet' && a.chainType === 'solana'
  );
  
  const evmAccount = user?.linkedAccounts?.find((a: any) => 
    a.type === 'wallet' && a.chainType === 'ethereum'
  );
  
  // Priority 2: Embedded wallet (Privy custodial)
  const embeddedWallet = user?.wallet;
  
  // Return in priority order
  return solanaAccount?.address || evmAccount?.address || embeddedWallet?.address || null;
};

export const getWalletChainType = (address: string | null): 'evm' | 'solana' | null => {
  if (!address) return null;
  return address.startsWith('0x') ? 'evm' : 'solana';
};

export const formatShortAddress = (address: string): string => {
  if (!address) return '';
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
};