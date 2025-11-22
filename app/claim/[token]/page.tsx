'use client';

import { useState, useEffect, use } from 'react';
import axios from 'axios';
import Turnstile from 'react-turnstile';
import { motion } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import ReferralCard from '@/components/ReferralCard';

type ClaimStatus = 'loading' | 'idle' | 'success' | 'error';

export default function ClaimPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  
  // Hooks de Privy
  const { login, authenticated, user, ready, logout } = usePrivy();
  const { wallets } = useWallets(); // Mantenemos esto por si conectan wallet externa

  const [status, setStatus] = useState<ClaimStatus>('loading');
  const [message, setMessage] = useState('Verificando código...');
  const [childCodes, setChildCodes] = useState<string[]>([]);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  
  // Estado para la blockchain seleccionada
  const [blockchain, setBlockchain] = useState('solana');
  const [baseUrl, setBaseUrl] = useState('');

  const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '';

  // --- LÓGICA DE DETECCIÓN DE WALLET ROBUSTA ---

  // 1. Buscamos activamente una cuenta de Solana en las cuentas vinculadas
  // Usamos 'any' en el find porque el tipado de linkedAccounts a veces es estricto con los tipos de wallet
  const solanaAccount = user?.linkedAccounts?.find(
    (a: any) => a.type === 'wallet' && a.chainType === 'solana'
  );

  // 2. Buscamos cuenta EVM como respaldo
  const evmAccount = user?.linkedAccounts?.find(
    (a: any) => a.type === 'wallet' && a.chainType === 'ethereum'
  );

  // 3. DETERMINAMOS LA DIRECCIÓN ACTIVA CON PRIORIDAD
  // Si existe cuenta de Solana, úsala. Si no, usa EVM.
  // @ts-ignore (Ignoramos error de tipado en .address para simplificar)
  const activeAddress = solanaAccount?.address || evmAccount?.address || user?.wallet?.address;

  // 4. Detectamos qué tipo es la ganadora
  const isEVM = activeAddress?.startsWith('0x');
  const isSolana = activeAddress && !isEVM;

  useEffect(() => {
    setBaseUrl(window.location.origin);
  }, []);

  // 3. Efecto para autoseleccionar la red correcta en el dropdown
  useEffect(() => {
    if (authenticated && activeAddress) {
      if (isEVM) {
        setBlockchain('ethereum');
      } else {
        setBlockchain('solana');
      }
    }
  }, [authenticated, activeAddress, isEVM]);

  // Validar Token al inicio
  useEffect(() => {
    const checkToken = async () => {
      try {
        await axios.get(`/c/${token}`);
        setStatus('idle');
        setMessage('');
      } catch (error: any) {
        setStatus('error');
        setMessage(error.response?.data?.error || 'Código inválido o expirado.');
      }
    };
    checkToken();
  }, [token]);

  // Enviar Reclamo
  const handleClaim = async () => {
    if (!captchaToken) return alert('Por favor completa el captcha');
    if (!activeAddress) return alert('No se detectó una wallet válida');

    setStatus('loading');
    setMessage(`Enviando a la red ${blockchain.toUpperCase()}...`);

    try {
      const response = await axios.post('/api/claim', {
        token,
        walletAddress: activeAddress, // Usamos la dirección detectada
        blockchain,
        captchaToken
      });

      if (response.data.success) {
        setChildCodes(response.data.newCodes || []);
        setStatus('success');
      }
    } catch (error: any) {
      setStatus('error');
      setMessage(error.response?.data?.error || 'Error al reclamar.');
    }
  };

  // --- VISTAS ---

  if (!ready || status === 'loading') {
    return (
      <div className="min-h-screen bg-black text-green-500 flex flex-col items-center justify-center font-mono p-4 space-y-4">
        <div className="animate-spin w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full"></div>
        <div className="text-center animate-pulse">
            <p>{message || 'Cargando sistema...'}</p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-black text-red-500 flex flex-col items-center justify-center font-mono p-4 text-center">
        <h1 className="text-4xl font-bold mb-4">ACCESO DENEGADO</h1>
        <p className="border border-red-800 p-4 rounded bg-red-900/20 max-w-md">{message}</p>
        <a href="/scan" className="mt-8 text-white underline hover:text-red-300">Intentar otro código</a>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="bg-zinc-900 border border-green-900 rounded-xl p-6 mb-8">
        <h2 className="text-xl text-white mb-4 font-bold animate-pulse text-green-400">ARSENAL DE DISTRIBUCIÓN</h2>
        <p className="text-sm text-zinc-500 mb-8">
          Descarga estas tarjetas y compártelas en tus redes. Son de un solo uso.
        </p>

        {/* GRID DE TARJETAS VISUALES */}
        <div className="flex flex-wrap justify-center gap-8">
          {childCodes.map((code, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.3 }}
            >
              <ReferralCard 
                code={code} 
                index={index} 
                baseUrl={baseUrl} 
              />
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  // --- VISTA: LOGIN & CLAIM (IDLE) ---
  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6 font-mono flex flex-col items-center">
      <div className="w-full max-w-md mt-10">
        <h1 className="text-2xl font-bold text-green-500 mb-2">PASS-IT-(AE)ON</h1>
        <div className="h-1 w-full bg-gradient-to-r from-green-500 to-transparent mb-8"></div>

        {!authenticated ? (
          <div className="flex flex-col items-center gap-6 text-center py-10 border border-zinc-800 rounded-xl bg-zinc-900/50">
            <p className="text-gray-400 px-4">Para reclamar tu recompensa, necesitas identificarte.</p>
            <button 
              onClick={login}
              className="bg-white text-black font-bold py-3 px-8 rounded hover:bg-gray-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)]"
            >
              CONECTAR / LOGIN
            </button>
            <p className="text-xs text-zinc-600">Soporta: Email, Google, MetaMask, Phantom</p>
          </div>
        ) : (
          <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            <div className="bg-zinc-900 p-4 rounded border border-zinc-700 flex justify-between items-center">
              <div>
                <p className="text-xs text-gray-500">WALLET ({isEVM ? 'EVM' : 'SOLANA'})</p>
                <p className="text-sm font-mono text-green-400 truncate w-48">
                  {activeAddress || 'Detectando...'}
                </p>
              </div>
              <button onClick={logout} className="text-xs bg-zinc-800 px-2 py-1 rounded hover:bg-zinc-700">
                Salir
              </button>
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-2">RED DE DESTINO</label>
              <select 
                value={blockchain}
                onChange={(e) => setBlockchain(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 p-3 rounded text-white focus:border-green-500 outline-none"
              >
                {/* Lógica Simplificada: Mostramos las opciones según el tipo de dirección detectada */}
                {isSolana && <option value="solana">Solana (Devnet)</option>}
                  
                {isEVM && (
                  <>
                    <option value="base">Base</option>
                    <option value="ethereum">Ethereum</option>
                    <option value="bnb">BNB Chain</option>
                  </>
                )}
                
                {/* Fallback por si acaso falla la detección */}
                {!isSolana && !isEVM && <option disabled>Detectando redes...</option>}
              </select>
              <p className="text-xs text-zinc-600 mt-1">
                {isEVM ? 'Redes compatibles con EVM detectadas.' : isSolana ? 'Red Solana detectada.' : ''}
              </p>
            </div>

            <div className="flex justify-center py-2">
              <Turnstile
                sitekey={SITE_KEY}
                onVerify={(token) => setCaptchaToken(token)}
                theme="dark"
              />
            </div>

            <button 
              onClick={handleClaim}
              disabled={!captchaToken}
              className={`w-full py-4 rounded font-bold text-lg transition-all
                ${captchaToken 
                  ? 'bg-green-600 hover:bg-green-500 text-black shadow-[0_0_15px_rgba(34,197,94,0.5)]' 
                  : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                }`}
            >
              RECLAMAR TOKEN
            </button>
          </div>
        )}
      </div>
    </div>
  );
}