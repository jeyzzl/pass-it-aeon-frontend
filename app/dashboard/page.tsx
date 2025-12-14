// dashboard page

'use client';

import { useState, useEffect } from 'react';
// 1. Agregamos 'logout' al destructuring
import { usePrivy, useWallets } from '@privy-io/react-auth';
import axios from 'axios';
import ReferralCard from '@/components/ReferralCard';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { getActiveWalletAddress } from '@/lib/walletUtils';
import Link from 'next/link';

export default function DashboardPage() {
  // Hooks de Privy
  const { authenticated, user, ready, exportWallet, logout } = usePrivy();
  
  // Router
  const router = useRouter();

  // Contexto de Lenguage
  const { language, t } = useLanguage();
  
  // Estados de Pagina
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [baseUrl, setBaseUrl] = useState('');

  // Wallet activa
  const activeAddress = getActiveWalletAddress(user);

  // Conexion a Next JS
  const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

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
      console.error(t.error_perfil, error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = async () => {
    if (!activeAddress) return;
    setRegenerating(true);
    try {
      await axios.post(`/api/regenerate`, {
        walletAddress: activeAddress
      });
      // Recargamos el perfil para mostrar los nuevos códigos
      await fetchProfile(); 
    } catch (error) {
      console.error("Error regenerating codes", error);
      alert(t.error_regenerar);
    } finally {
      setRegenerating(false);
    }
  };

  if (!ready || loading) {
    return <div className="min-h-screen bg-black flex items-center justify-center text-green-500 animate-pulse font-mono">{t.cargando_perfil}</div>;
  }

  if (!authenticated) return null;

  const maxCodes = profileData?.maxCodes || 3;
  const currentCodes = profileData?.myCodes?.length || 0;
  const codesLeft = Math.max(0, maxCodes - currentCodes);

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-mono p-4 overflow-y-auto">
      <div className="max-w-5xl mx-auto py-8">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-center border-b border-zinc-800 pb-6 mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-green-500 tracking-tighter">{t.titulo_dashboard}</h1>
            <p className="text-zinc-500 text-sm">{t.bienvenido} {activeAddress?.substring(0, 6)}...</p>
          </div>
          
          {/* GRUPO DE BOTONES DE ACCIÓN */}
          <div className="flex gap-3">
            {/* Botón Exportar */}
            <button 
              onClick={exportWallet}
              className="bg-zinc-900 border border-zinc-700 text-zinc-300 px-4 py-2 rounded hover:border-yellow-500 hover:text-yellow-500 transition-all text-xs flex items-center gap-2"
            >
              🔑 {t.exportar_llaves}
            </button>

            {/* FAQ Link */}
            <Link href="/faq">
              <button className="bg-zinc-900 border border-zinc-700 text-zinc-300 px-4 py-2 rounded hover:border-green-500 hover:text-green-500 transition-all text-xs flex items-center gap-2">
                ❓ FAQ
              </button>
            </Link>

            {/* Botón Logout */}
            <button 
              onClick={logout}
              className="bg-red-900/20 border border-red-900/50 text-red-400 px-4 py-2 rounded hover:bg-red-900/40 hover:border-red-500 transition-all text-xs flex items-center gap-2"
            >
              🚪 {t.logout}
            </button>
          </div>
        </div>

        {/* ... (GRID: Stats, Leaderboard, Cards) ... */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* COLUMNA IZQUIERDA */}
            <div className="space-y-8">
                <div className="bg-zinc-900/50 border border-green-900/50 p-6 rounded-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10"><span className="text-6xl">🏆</span></div>
                    <h3 className="text-zinc-500 text-xs tracking-widest mb-2">{t.rango}</h3>
                    <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-bold text-white">#{profileData?.rank || '-'}</span>
                        <span className="text-sm text-green-500">GLOBAL</span>
                    </div>
                    <div className="mt-4 pt-4 border-t border-zinc-800">
                        <h3 className="text-zinc-500 text-xs tracking-widest mb-1">{t.puntos}</h3>
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
                {/* CABECERA DE SECCIÓN DE CÓDIGOS CON BOTÓN REFILL */}
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl text-white font-bold">{t.codigos_activos} ({currentCodes}/{maxCodes})</h2>
                  {/* BOTÓN REFILL: Solo aparece si hay huecos libres (Visualmente asumimos 3, el backend valida) */}
                  {currentCodes < maxCodes && (
                    <button 
                      onClick={handleRegenerate}
                      disabled={regenerating}
                      className="bg-green-600 hover:bg-green-500 disabled:bg-zinc-700 text-black px-4 py-2 rounded text-xs font-bold transition-all flex items-center gap-2"
                    >
                      {regenerating ? (
                        <span className="animate-pulse">PROCESSING...</span>
                      ) : (
                        <>
                          <span>+ REFILL</span>
                          <span className="bg-black/20 px-1.5 rounded-full text-[10px]">
                              {codesLeft} LEFT
                          </span>
                        </>
                      )}
                    </button>
                  )}
                </div>


                {/* LISTA DE CÓDIGOS */}
                {profileData?.myCodes.length === 0 ? (
                  <div className="text-center py-20 text-zinc-600 border border-dashed border-zinc-800 rounded bg-zinc-900/20">
                    <p>{t.no_codigos}</p>
                    <p className="text-xs mt-2 mb-4">{t.reclama_para_recibir || "Generate new codes to invite others."}</p>
                    {/* Botón grande si no hay ningún código */}
                    <button 
                      onClick={handleRegenerate}
                      disabled={regenerating}
                      className="text-green-500 underline hover:text-green-400 font-bold"
                    >
                      {regenerating ? "GENERATING..." : "CLICK TO GENERATE NEW CODES"}
                    </button>
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