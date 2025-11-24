'use client';

import { useState, useEffect } from 'react';
// 1. Agregamos 'logout' al destructuring
import { usePrivy, useWallets } from '@privy-io/react-auth';
import axios from 'axios';
import ReferralCard from '@/components/ReferralCard';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const { authenticated, user, ready, exportWallet, logout } = usePrivy();
  const { wallets } = useWallets();
  const router = useRouter();
  
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [baseUrl, setBaseUrl] = useState('');

  // Lógica de wallet
  const solanaAccount = user?.linkedAccounts?.find((a: any) => a.type === 'wallet' && a.chainType === 'solana');
  const evmAccount = user?.linkedAccounts?.find((a: any) => a.type === 'wallet' && a.chainType === 'ethereum');
  // @ts-ignore
  const activeAddress = solanaAccount?.address || evmAccount?.address || user?.wallet?.address;

  useEffect(() => {
    setBaseUrl(window.location.origin);
  }, []);

  useEffect(() => {
    if (ready && !authenticated) {
      router.push('/'); 
    }
  }, [ready, authenticated, router]);

  useEffect(() => {
    if (authenticated && activeAddress) {
      fetchProfile();
    }
  }, [authenticated, activeAddress]);

  const fetchProfile = async () => {
    try {
      const res = await axios.get(`/api/profile/${activeAddress}`);
      setProfileData(res.data);
    } catch (error) {
      console.error("Error cargando perfil", error);
    } finally {
      setLoading(false);
    }
  };

  if (!ready || loading) {
    return <div className="min-h-screen bg-black flex items-center justify-center text-green-500 animate-pulse font-mono">LOADING PROFILE...</div>;
  }

  if (!authenticated) return null;

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-mono p-4 overflow-y-auto">
      <div className="max-w-5xl mx-auto py-8">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-center border-b border-zinc-800 pb-6 mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-green-500 tracking-tighter">AE(ON) DASHBOARD</h1>
            <p className="text-zinc-500 text-sm">Welcome back, Aeon {activeAddress?.substring(0, 6)}...</p>
          </div>
          
          {/* GRUPO DE BOTONES DE ACCIÓN */}
          <div className="flex gap-3">
            {/* Botón Exportar */}
            <button 
              onClick={exportWallet}
              className="bg-zinc-900 border border-zinc-700 text-zinc-300 px-4 py-2 rounded hover:border-yellow-500 hover:text-yellow-500 transition-all text-xs flex items-center gap-2"
            >
              🔑 EXPORT KEYS
            </button>

            {/* Botón Logout */}
            <button 
              onClick={logout}
              className="bg-red-900/20 border border-red-900/50 text-red-400 px-4 py-2 rounded hover:bg-red-900/40 hover:border-red-500 transition-all text-xs flex items-center gap-2"
            >
              🚪 LOGOUT
            </button>
          </div>
        </div>

        {/* ... (GRID: Stats, Leaderboard, Cards) ... */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* COLUMNA IZQUIERDA */}
            <div className="space-y-8">
                <div className="bg-zinc-900/50 border border-green-900/50 p-6 rounded-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10"><span className="text-6xl">🏆</span></div>
                    <h3 className="text-zinc-500 text-xs tracking-widest mb-2">CURRENT RANK</h3>
                    <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-bold text-white">#{profileData?.rank || '-'}</span>
                        <span className="text-sm text-green-500">GLOBAL</span>
                    </div>
                    <div className="mt-4 pt-4 border-t border-zinc-800">
                        <h3 className="text-zinc-500 text-xs tracking-widest mb-1">TOTAL SCORE</h3>
                        <span className="text-2xl font-bold text-green-400">{profileData?.points || 0} PTS</span>
                    </div>
                </div>

                <div className="bg-black border border-zinc-800 p-6 rounded-xl">
                    <h3 className="text-zinc-400 font-bold mb-4 flex items-center gap-2">
                        <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></span>
                        TOP AEONS
                    </h3>
                    <div className="space-y-3">
                        {profileData?.globalLeaderboard.map((agent: any, idx: number) => (
                        <div key={idx} className={`flex justify-between items-center text-sm p-2 rounded ${agent.wallet_address === activeAddress ? 'bg-green-900/20 border border-green-900' : 'bg-zinc-900/50'}`}>
                            <div className="flex items-center gap-3">
                            <span className="text-zinc-500 font-bold w-4">#{idx + 1}</span>
                            <span className={agent.wallet_address === activeAddress ? 'text-green-400' : 'text-zinc-300'}>
                                {agent.wallet_address.substring(0, 6)}...{agent.wallet_address.substring(agent.wallet_address.length - 4)}
                            </span>
                            </div>
                            <span className="font-bold text-zinc-500">{agent.points}</span>
                        </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* COLUMNA DERECHA */}
            <div className="lg:col-span-2">
                <div className="bg-zinc-900/30 border border-zinc-800 p-6 rounded-xl min-h-[500px]">
                    <h2 className="text-xl text-white mb-6 font-bold"> MY ACTIVE CODES</h2>
                    {profileData?.myCodes.length === 0 ? (
                        <div className="text-center py-20 text-zinc-600">
                        <p>NO ACTIVE CODES DETECTED.</p>
                        <p className="text-xs mt-2">Claim a token to receive distribution codes.</p>
                        </div>
                    ) : (
                        <div className="flex flex-wrap justify-center gap-6">
                        {profileData?.myCodes.map((code: string, idx: number) => (
                            <ReferralCard 
                            key={code}
                            code={code}
                            index={idx}
                            baseUrl={baseUrl}
                            />
                        ))}
                        </div>
                    )}
                </div>
            </div>

        </div>
      </div>
    </div>
  );
}