'use client';
// client-pass-it/app/claim/[token]/page.tsx

import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Turnstile from 'react-turnstile';
import { motion } from 'framer-motion';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import ReferralCard from '@/components/ReferralCard';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { getActiveWalletAddress, getWalletChainType } from '@/lib/walletUtils';
import { startPollingClaimStatus, getExplorerName } from '@/lib/pollingUtils';

type ClaimStatus = 'loading' | 'idle' | 'success' | 'error';

export default function ClaimPage({ params }: { params: { token: string } }) {
  // --- TOKEN ---
  const { token } = params;
  
  // --- Contexto de Lenguage ---
  const { language, t } = useLanguage();
  
  // --- Hooks de Privy ---
  const { login, authenticated, user, ready, logout, createWallet } = usePrivy();

  // --- Estado de la pagina ---
  const [status, setStatus] = useState<ClaimStatus>('loading');
  const [message, setMessage] = useState(t.verificando_codigo);
  const [childCodes, setChildCodes] = useState<string[]>([]);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  // --- Estado para select de blockchain para reclamo ---
  const [blockchain, setBlockchain] = useState('solana');
  const [baseUrl, setBaseUrl] = useState('');

  // --- Estado para seguir el status del reclamo ---
  const [claimId, setClaimId] = useState<string | null>(null);
  const [txStatus, setTxStatus] = useState<'pending' | 'success' | 'failed' | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [explorerLink, setExplorerLink] = useState<string | null>(null);
  const [pollingError, setPollingError] = useState<string | null>(null);

  // --- Conexion a Next JS ---
  const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '';

  // --- DETECCIÓN DE WALLET ---
  const activeAddress = getActiveWalletAddress(user);
  const walletChainType = getWalletChainType(activeAddress);

  const isEVM = walletChainType === 'evm'
  const isSolana = walletChainType === 'solana';

  // Efecto para autoseleccionar la red correcta en el dropdown
  useEffect(() => {
    if (authenticated && activeAddress) {
      if (isSolana) {
         setBlockchain('solana');
      } else if (isEVM) {
         setBlockchain('base'); 
      }
    }
  }, [authenticated, activeAddress, isEVM, isSolana]);

  // Efecto para la URL
  useEffect(() => {
    setBaseUrl(window.location.origin);
  }, []);

  // Efecto para validar Token al cargar
  useEffect(() => {
    const checkToken = async () => {
      try {
        await axios.get(`/c/${token}`);
        setStatus('idle');
        setMessage('');
      } catch (error: any) {
        setStatus('error');
        // Texto seguro
        const msg = error.response?.data?.error || t.codigo_invalido;
        setMessage(typeof msg === 'object' ? JSON.stringify(msg) : String(msg));
      }
    };
    checkToken();
  }, [token]);

  // Efecto para limpiar el state
  const cleanupRef = useRef<(() => void) | null>(null);
  
  useEffect(() => {
    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
    };
  }, []);

  // --- MANEJO DE RECLAMO ---
  const handleClaim = async () => {
    if (!captchaToken) return alert(t.completar_captcha);
    if (!activeAddress) return alert(t.billetera_error);

    setStatus('loading');
    setMessage(`${t.enviando} ${blockchain.toUpperCase()}...`);
    setPollingError(null);

    try {
      const response = await axios.post('/api/claim', {
        token,
        walletAddress: activeAddress,
        blockchain,
        captchaToken
      });

      if (response.data.success) {
        const rawCodes = response.data.newCodes || [];
        const safeCodes = rawCodes.map((c: any) => {
          if (typeof c === 'object' && c !== null) {
             return c.token || JSON.stringify(c);
          }
          return String(c);
        });

        setChildCodes(safeCodes);
        setClaimId(response.data.claimId);
        setTxStatus('pending');

        // Start polling for transaction status
        const cleanup = startPollingClaimStatus(response.data.claimId, {
          // update
          onUpdate: (status) => {
            setTxStatus(status.status);
            if (status.txHash) setTxHash(status.txHash);
            if (status.explorerLink) setExplorerLink(status.explorerLink);
          },
          // completado
          onComplete: (finalStatus) => {
            setTxStatus(finalStatus.status);
            if (finalStatus.txHash) setTxHash(finalStatus.txHash);
            if (finalStatus.explorerLink) setExplorerLink(finalStatus.explorerLink);
            
            if (finalStatus.status === 'success') {
              setStatus('success');
            } else {
              setStatus('error');
              setMessage(finalStatus.error || 'Transaction failed');
            }
          },
          // error
          onError: (error) => {
            setPollingError(error);
            setStatus('error');
            setMessage(`Polling error: ${error}`);
          },

          interval: 5000,
          maxAttempts: 60 // 5 minutos
        });

        // Clean up
        cleanupRef.current = cleanup;

        // Also set status to idle to show the waiting UI
        setStatus('idle'); // Change from 'loading' to show polling status
        setMessage(`${t.esperando_confirmacion} ${blockchain.toUpperCase()}...`);
      }
    } catch (err: any) {
      console.error("Error completo:", err);
      let errorMessage = t.error_desconocido;

      if (err.response && err.response.data && err.response.data.error) {
        errorMessage = err.response.data.error;
      } else if (err.message) {
        errorMessage = err.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      }

      if (typeof errorMessage === 'object') {
        errorMessage = JSON.stringify(errorMessage);
      }

      setMessage(errorMessage);
      setStatus('error');
    }
  };

  // --- VISTAS ---
  // Cargando
  if (!ready || status === 'loading') {
    return (
      <div className="min-h-screen bg-black text-green-500 flex flex-col items-center justify-center font-mono p-4 space-y-4">
        <div className="animate-spin w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full"></div>
        <div className="text-center animate-pulse">
            <p>{typeof message === 'string' ? message : t.cargando}</p>
        </div>
      </div>
    );
  }

  // Error
  if (status === 'error') {
    return (
      <div className="min-h-screen bg-black text-red-500 flex flex-col items-center justify-center font-mono p-4 text-center">
        <h1 className="text-4xl font-bold mb-4">{t.acceso_denegado}</h1>
        <div className="border border-red-800 p-4 rounded bg-red-900/20 max-w-md break-words">
          {/* Protección contra objetos en el renderizado */}
          {typeof message === 'object' ? JSON.stringify(message) : message}
        </div>
        <a href="/scan" className="mt-8 text-white underline hover:text-red-300">{t.otro_codigo}</a>
      </div>
    );
  }

  // Pendiente o inactiva
  if (status === 'idle' && txStatus === 'pending') {
    // Show polling/processing view
    return (
      <div className="min-h-screen bg-zinc-950 text-white p-4 font-mono flex flex-col items-center justify-center">
        <div className="max-w-md text-center">
          <div className="animate-spin w-16 h-16 border-4 border-yellow-500 border-t-transparent rounded-full mb-6 mx-auto"></div>
          <h1 className="text-2xl font-bold text-yellow-500 mb-4">{t.procesando_transaccion}</h1>
          <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-lg mb-6">
            <p className="text-gray-400 text-sm mb-2">{t.direccion}</p>
            <p className="text-white font-mono text-sm">{activeAddress}</p>
            <div className="mt-4 pt-4 border-t border-zinc-800">
              <p className="text-yellow-500 flex items-center justify-center gap-2">
                <span className="animate-pulse">●</span>
                {t.esperando_confirmacion} {blockchain.toUpperCase()}
              </p>
              <p className="text-xs text-zinc-500 mt-2">
                This usually takes 15-60 seconds...
              </p>
            </div>
          </div>
          <div className="text-zinc-500 text-sm">
            <p>Your QR codes are ready! Tokens will arrive shortly.</p>
            <button 
              onClick={() => setStatus('success')} // Allow manual skip for testing
              className="mt-4 text-xs underline text-zinc-600"
            >
              Skip waiting
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Success
  if (status === 'success') {
    return (
      <div className="min-h-screen bg-zinc-950 text-white p-4 font-mono overflow-y-auto">
        <div className="max-w-3xl mx-auto py-10 text-center">
          
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-6xl mb-4">🎉</motion.div>
          <h1 className="text-3xl font-bold text-green-400 mb-2">{t.success_title}</h1>
          
           {/* Transaction Status Card */}
          <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-lg mb-8 inline-block">
            <p className="text-gray-400 text-sm mb-1">{t.tokens_enviados}</p>
            <span className="text-white font-mono bg-black px-2 py-1 rounded border border-zinc-700 text-xs md:text-sm">
              {activeAddress}
            </span>
             {/* <p className="text-green-500 text-xs mt-2">
                ✅ {t.trans_confirmada}
             </p> */}

            {/* Transaction Status */}
            <div className="mt-4">
              {txHash ? (
                <div className="text-green-500">
                  <p className="flex items-center justify-center gap-2">
                    <span>✅</span>
                    Transaction confirmed!
                  </p>
                  {explorerLink && (
                    <a 
                      href={explorerLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 underline text-xs mt-1 block"
                    >
                      View on {getExplorerName(blockchain)}
                    </a>
                  )}
                </div>
              ) : (
                <div className="text-yellow-500">
                  <p className="flex items-center justify-center gap-2">
                    <div className="animate-spin w-4 h-4 border-2 border-yellow-500 border-t-transparent rounded-full"></div>
                    <span>Finalizing transaction...</span>
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-zinc-900 border border-green-900 rounded-xl p-6 mb-8">
            <h2 className="text-xl text-white mb-4 font-bold animate-pulse text-green-400"> 
              {t.mission_title} 
            </h2>
            <p className="text-sm text-zinc-500 mb-6">
              {t.descarga_tarjetas}
            </p>

            <div className="flex flex-wrap justify-center gap-8">
              {childCodes.map((code, index) => (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.3 }}
                >
                  <ReferralCard 
                    code={String(code)} 
                    index={index} 
                    baseUrl={baseUrl} 
                  />
                </motion.div>
              ))}
            </div>
          </div>
          
          {/* --- SECCIÓN DE NAVEGACIÓN --- */}
          <div className="flex flex-col md:flex-row gap-4 justify-center items-center mt-8 pb-10">
            
            {/* Botón Principal: Ir al Dashboard */}
            <Link href="/dashboard" className="w-full md:w-auto">
              <button className="w-full md:w-auto bg-green-600 hover:bg-green-500 text-black font-bold py-4 px-8 rounded transition-all shadow-[0_0_20px_rgba(34,197,94,0.4)] flex items-center justify-center gap-2">
                <span>📊</span>
                {t.ver_rango}
              </button>
            </Link>

            {/* Botón Secundario: Ir al Inicio */}
            <Link href="/" className="w-full md:w-auto">
              <button className="w-full md:w-auto bg-zinc-800 hover:bg-zinc-700 text-zinc-300 py-4 px-8 rounded transition-all border border-zinc-700">
                {t.volver_inicio}
              </button>
            </Link>
          </div>

          <div className="mt-4">
             <button onClick={logout} className="text-xs text-zinc-600 underline hover:text-zinc-400">
               {t.logout}
             </button>
          </div>

        </div>
      </div>
    );
  }

  // --- VISTA: LOGIN & CLAIM (IDLE) ---
  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6 font-mono flex flex-col items-center">
      <div className="w-full max-w-md mt-10">
        <h1 className="text-2xl font-bold text-green-500 mb-2">{t.pass_it_aeon_titulo}</h1>
        <div className="h-1 w-full bg-gradient-to-r from-green-500 to-transparent mb-8"></div>

        {!authenticated ? (
          // NO AUTENTICADO 
          <div className="flex flex-col items-center gap-6 text-center py-10 border border-zinc-800 rounded-xl bg-zinc-900/50">
            <p className="text-gray-400 px-4">{t.identificarte}</p>
            <button onClick={login} className="bg-white text-black font-bold py-3 px-8 rounded hover:bg-gray-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)]">{t.conectar}</button>
          </div>
        ) : (
          // AUTENTICADO
          <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            <div className="bg-zinc-900 p-4 rounded border border-zinc-700 flex justify-between items-center">
              <div>
                <p className="text-xs text-gray-500">{t.billetera} ({isEVM ? 'EVM' : 'SOLANA'})</p>
                <p className="text-sm font-mono text-green-400 truncate w-48">
                  {activeAddress || 'Detectando...'}
                </p>
              </div>
              <button onClick={logout} className="text-xs bg-zinc-800 px-2 py-1 rounded hover:bg-zinc-700">
                {t.logout}
              </button>
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-2">{t.red_destino}</label>
              <select 
                value={blockchain}
                onChange={(e) => setBlockchain(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 p-3 rounded text-white focus:border-green-500 outline-none"
              >
                {/* Mostramos opciones inteligentes */}
                {isSolana && <option value="solana">Solana</option>}
                
                {isEVM && (
                  <>
                    <option value="base">Base (EVM)</option>
                    <option value="ethereum">Ethereum (EVM)</option>
                    {/* <option value="bnb">BNB Chain (EVM)</option> */}
                  </>
                )}
                
                {!activeAddress && <option disabled>{t.conecta_billetera}</option>}
              </select>
            </div>

            <div className="flex justify-center py-2">
              <Turnstile sitekey={SITE_KEY} onVerify={(token) => setCaptchaToken(token)} theme="dark" />
            </div>

            <button
              onClick={handleClaim}
              disabled={!captchaToken || !activeAddress}
              className={`w-full py-4 rounded font-bold text-lg transition-all
                ${captchaToken && activeAddress
                  ? 'bg-green-600 hover:bg-green-500 text-black shadow-[0_0_15px_rgba(34,197,94,0.5)]' 
                  : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                }`}
            >
              {activeAddress ? `${t.reclamar_en} ${blockchain.toUpperCase()}` : t.cargando}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
