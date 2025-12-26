'use client';

import { useState, useEffect } from 'react';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import axios from 'axios';
import { Shield, Gift, AlertTriangle, Loader2, RefreshCcw } from 'lucide-react';
import ReferralCard from '@/components/ReferralCard'; 
import { useLanguage } from '@/context/LanguageContext';
import Link from 'next/link';

// Adjust if you use a specific layout or context
const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

export default function AmbassadorDashboard() {
  const { ready, authenticated, login } = usePrivy();
  const { wallets } = useWallets();
  const activeWallet = wallets[0]?.address;

  const [faucetStats, setFaucetStats] = useState<any>([]);
  const [customAmount, setCustomAmount] = useState('6.9');
  const [customDays, setCustomDays] = useState(14);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Checking role state
  const [isCheckingRole, setIsCheckingRole] = useState(true);

  // Contexto de Lenguage
  const { t } = useLanguage();

  const totalBalance = faucetStats.reduce((acc: number, curr: any) => {
    return acc + (parseFloat(curr.token_balance) || 0);
  }, 0);

  useEffect(() => {
    if (ready && authenticated && activeWallet) {
      fetchStats();
    } else if (ready && !authenticated) {
      setIsCheckingRole(false);
    }
  }, [ready, authenticated, activeWallet]);

  const fetchStats = async () => {
    setError('');
    setIsCheckingRole(true);
    try {
      const res = await axios.post(`/api/ambassador/stats`, { 
        walletAddress: activeWallet 
      });
      setFaucetStats(res.data);
    } catch (err: any) {
      console.error(err);
      if (err.response?.status === 403) {
        setError(t.acceso_denegado);
      } else {
        setError('Connection Error');
      }
    } finally {
      setIsCheckingRole(false);
    }
  };

  const handleCreateGift = async () => {
    if (!faucetStats) return;
    setLoading(true);
    setError('');
    setGeneratedCode(null);

    const maxAllowed = totalBalance * 0.25;
    const amountNum = parseFloat(customAmount);

    if (isNaN(amountNum) || amountNum <= 0) {
      setError(t.enter_valid_number);
      setLoading(false);
      return;
    }

    if (amountNum > maxAllowed) {
      setError(`Amount too high. Max limit is ${maxAllowed.toFixed(2)} SPX (25% of holdings).`);
      setLoading(false);
      return;
    }

    try {
      const res = await axios.post(`/api/ambassador/create-code`, {
        walletAddress: activeWallet,
        customAmount: customAmount,
        days: customDays,
      });
      setGeneratedCode(res.data.fullToken);
    } catch (err: any) {
      setError(err.response?.data?.error || t.fallo_generar);
    } finally {
      setLoading(false);
    }
  };

  // --- RENDERING STATES ---

  if (!ready) return <div className="min-h-screen bg-black flex items-center justify-center text-green-500">{t.inicializando}</div>;

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 text-center">
        <Shield size={64} className="text-zinc-700 mb-6" />
        <h1 className="text-2xl text-white font-bold mb-2">{t.ambassador_titulo}</h1>
        <p className="text-zinc-500 mb-8">{t.ambassador_subtitulo}</p>
        <button onClick={login} className="bg-white text-black font-bold px-8 py-3 rounded hover:bg-zinc-200">
          {t.conecta_billetera}
        </button>
      </div>
    );
  }

  if (error === 'ACCESS_DENIED') {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 text-center">
        <AlertTriangle size={64} className="text-red-500 mb-6" />
        <h1 className="text-3xl text-red-500 font-bold mb-2">{t.acceso_denegado}</h1>
        <p className="text-zinc-400 max-w-md mx-auto">
          {t.ambassador_tu_billetera} <span className="text-white font-mono bg-zinc-900 px-1 rounded">{activeWallet?.slice(0,6)}...{activeWallet?.slice(-4)}</span> {t.ambassador_no_registrada}
        </p>
        <button onClick={() => window.location.href = '/'} className="mt-8 text-zinc-500 underline hover:text-white">
          {t.volver_inicio}
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans p-4 md:p-8 pb-20">
      <div className="max-w-5xl mx-auto">
        <div className="top-6 left-10 z-20">
          <Link href="/">
              <img 
                src="/logo.png" 
                alt="Pass It Aeon" 
                className="w-28 md:w-40 h-auto object-contain opacity-80 hover:opacity-100 transition-opacity cursor-pointer" 
              />
          </Link>
        </div>
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 border-b border-zinc-800 pb-6 gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-yellow-500/10 p-3 rounded-full border border-yellow-500/20">
              <Shield className="text-yellow-500" size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tighter text-white">{t.ambassador_consola}</h1>
              <p className="text-zinc-500 text-sm">{t.bienvenido}, {activeWallet?.slice(0,6)}...{activeWallet?.slice(-4)}</p>
            </div>
          </div>
          
          <div className="lg:text-right md:text-left md:block">
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">{t.ambassador_total}</p>
            {faucetStats.length > 0 ? (
              <div>
                <p className="text-green-400 font-mono font-bold text-xl">
                  {totalBalance.toLocaleString()} SPX
                </p>
                {/* Mini breakdown tooltip or subtext */}
                <div className="flex gap-2 justify-end text-[10px] text-zinc-600 mt-1">
                  {faucetStats.map((f: any) => (
                    <span key={f.blockchain} className="uppercase">
                      {f.blockchain}: {parseFloat(f.token_balance).toLocaleString()}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-4 w-20 bg-zinc-800 animate-pulse rounded"></div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT: GENERATOR */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-zinc-900/30 border border-zinc-800 p-6 md:p-10 rounded-2xl relative overflow-hidden group hover:border-yellow-900/50 transition-colors">
              <h2 className="text-2xl font-bold mb-2 flex items-center gap-3">
                {t.ambassador_generar}
              </h2>
              <p className="text-zinc-400 text-sm mb-8 max-w-md">
                {t.ambassador_inst_1}
                {t.ambassador_inst_2}
              </p>

              <div className="space-y-6 max-w-md relative z-10">
                <div>
                  <label className="text-xs text-zinc-500 font-bold mb-2 block uppercase tracking-wider">{t.ambassador_cantidad} (SPX)</label>
                  <div className="relative">
                    <input 
                      type="number" 
                      value={customAmount}
                      onChange={(e) => setCustomAmount(e.target.value)}
                      className="w-full bg-black border border-zinc-700 p-4 pl-4 pr-16 rounded-xl text-3xl font-bold text-white focus:border-yellow-500 outline-none transition-all placeholder-zinc-800"
                      placeholder="0.00"
                    />
                  </div>
                  <label className="text-xs text-zinc-500 font-bold mt-4 mb-2 block uppercase tracking-wider">{t.ambassador_dias}</label>
                  <div className="relative"></div>
                    <input 
                      type="number" 
                      value={customDays}
                      onChange={(e) => setCustomDays(Number(e.target.value))}
                      className="w-full bg-black border border-zinc-700 p-4 pl-4 pr-16 rounded-xl text-3xl font-bold text-white focus:border-yellow-500 outline-none transition-all placeholder-zinc-800"
                      placeholder="14"
                    />
                  </div>
                  {faucetStats && (
                    <p className="text-xs text-zinc-600 mt-2 flex justify-between">
                      <span>Standard: 6.9 SPX</span>
                      <span>{t.ambassador_limite}: {(totalBalance * 0.25).toLocaleString()} SPX</span>
                    </p>
                  )}
                

                <button 
                  onClick={handleCreateGift}
                  disabled={loading || !faucetStats}
                  className="w-full bg-yellow-600 hover:bg-yellow-500 text-black font-bold text-lg py-4 rounded-xl transition-all shadow-lg shadow-yellow-900/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                >
                  {loading ? <Loader2 className="animate-spin" /> : <Gift size={20} />}
                  {loading ? t.ambassador_generando : t.ambassador_crear_regalo}
                </button>

                {error && (
                  <div className="bg-red-900/20 border border-red-900/50 text-red-400 p-3 rounded text-sm flex items-center gap-2">
                    <AlertTriangle size={16} />
                    {error}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT: OUTPUT */}
          <div className="lg:col-span-1">
            {generatedCode ? (
              <div className="sticky top-8">
                <div className="bg-zinc-900 border border-green-900/50 p-4 rounded-2xl animate-in slide-in-from-bottom duration-500">
                  <h3 className="text-green-400 font-bold mb-4 text-center flex items-center justify-center gap-2">
                    <span>✅</span> {t.ambassador_regalo_listo}
                  </h3>
                  
                  <div className="flex justify-center scale-90 origin-top">
                    {/* Reuse your existing component */}
                    <ReferralCard 
                       code={generatedCode} 
                       index={999} 
                       baseUrl={window.location.origin} 
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full border-2 border-dashed border-zinc-900 rounded-2xl flex flex-col items-center justify-center text-zinc-800 p-8 text-center">
                <Gift size={48} className="mb-4 opacity-50" />
                <p className="text-sm font-bold">{t.ambassador_no_codigo}</p>
                <p className="text-xs">{t.ambassador_rellena_form}</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}