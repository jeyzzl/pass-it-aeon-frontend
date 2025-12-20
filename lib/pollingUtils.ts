// client-pass-it/lib/pollingUtils.ts

interface ClaimStatus {
  claimId: string;
  status: 'pending' | 'success' | 'failed';
  txHash?: string;
  explorerLink?: string;
  blockchain?: string;
  error?: string;
}

export const startPollingClaimStatus = (
  claimId: string,
  options: {
    onUpdate: (status: ClaimStatus) => void;
    onComplete: (finalStatus: ClaimStatus) => void;
    onError: (error: string) => void;
    interval?: number;
    maxAttempts?: number;
  }
) => {
  const {
    onUpdate,
    onComplete,
    onError,
    interval = 5000,
    maxAttempts = 60 // 5 minutes total
  } = options;

  let attempts = 0;
  let isPolling = true;
  let timeoutId: NodeJS.Timeout | null = null;

  const poll = async () => {
    if (!isPolling || attempts >= maxAttempts) {
      if (attempts >= maxAttempts) {
        onError('Polling timeout: Transaction took too long to process.');
      }
      return;
    }

    try {
      const response = await fetch(`/api/claim/${claimId}/status`);
      if (!response.ok) throw new Error('Failed to fetch claim status');
      
      const data: ClaimStatus = await response.json();
      
      onUpdate(data);
      
      if (data.status !== 'pending') {
        onComplete(data);
        isPolling = false;
        return;
      }
      
      attempts++;
      if (isPolling) {
        timeoutId = setTimeout(poll, interval);
      }
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Unknown error');
      isPolling = false;
    }
  };

  // Start polling immediately
  poll();
  
  // Return cleanup function (synchronous)
  const cleanup = () => {
    isPolling = false;
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };
  
  return cleanup;
};

export const getExplorerName = (blockchain: string): string => {
  switch (blockchain) {
    case 'solana': return 'Solscan';
    case 'ethereum': return 'Etherscan';
    case 'base': return 'Basescan';
    default: return 'Explorer';
  }
};