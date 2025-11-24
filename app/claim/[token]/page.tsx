'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import Turnstile from 'react-turnstile';
import { motion } from 'framer-motion';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import ReferralCard from '@/components/ReferralCard';
import Link from 'next/link';

type ClaimStatus = 'loading' | 'idle' | 'success' | 'error';

export default function ClaimPage({ params }: { params: { token: string } }) {
  const { token } = params;
  
  // Hooks de Privy
  const { login, authenticated, user, ready, logout, linkWallet } = usePrivy();
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
  const solanaAccount = user?.linkedAccounts?.find(
    (a: any) => a.type === 'wallet' && a.chainType === 'solana'
  );

  // 2. Buscamos cuenta EVM como respaldo
  const evmAccount = user?.linkedAccounts?.find(
    (a: any) => a.type === 'wallet' && a.chainType === 'ethereum'
  );

  // 3. Determinamos la dirección activa con prioridad
  // @ts-ignore (Ignoramos error de tipado en .address para simplificar)
  const activeAddress = solanaAccount?.address || evmAccount?.address || user?.wallet?.address;

  // 4. Detectamos qué tipo es la ganadora
  const isEVM = activeAddress?.startsWith('0x');
  const isSolana = activeAddress && !isEVM;

  useEffect(() => {
    setBaseUrl(window.location.origin);
  }, []);

  // 3. Autoseleccionar la red correcta en el dropdown
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
        // Extraemos texto seguro
        const msg = error.response?.data?.error || 'Código inválido o expirado.';
        setMessage(typeof msg === 'object' ? JSON.stringify(msg) : String(msg));
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
        // Nos aseguramos de que lo que guardamos en el estado sean STRINGS puros
        const rawCodes = response.data.newCodes || [];
        const safeCodes = rawCodes.map((c: any) => {
          if (typeof c === 'object' && c !== null) {
             return c.token || JSON.stringify(c);
          }
          return String(c);
        });

        setChildCodes(safeCodes);
        setStatus('success');
      }
    } catch (err: any) {
      console.error("Error completo:", err);
      // 1. Extraemos SOLO el mensaje de texto
      let errorMessage = 'Error desconocido al procesar la solicitud.';

      if (err.response && err.response.data && err.response.data.error) {
        errorMessage = err.response.data.error;
      } else if (err.message) {
        errorMessage = err.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      }

      // 2. Si por alguna razón sigue siendo objeto, lo convertimos
      if (typeof errorMessage === 'object') {
        errorMessage = JSON.stringify(errorMessage);
      }

      // 3. Usamos setMessage (que es el estado real), NO setError
      setMessage(errorMessage);
      setStatus('error');
    }
  };

  // --- VISTAS ---

  if (!ready || status === 'loading') {
    return (
      <div className="min-h-screen bg-black text-green-500 flex flex-col items-center justify-center font-mono p-4 space-y-4">
        <div className="animate-spin w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full"></div>
        <div className="text-center animate-pulse">
            <p>{typeof message === 'string' ? message : 'Cargando...'}</p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-black text-red-500 flex flex-col items-center justify-center font-mono p-4 text-center">
        <h1 className="text-4xl font-bold mb-4">ACCESO DENEGADO</h1>
        <div className="border border-red-800 p-4 rounded bg-red-900/20 max-w-md break-words">
          {/* Protección contra objetos en el renderizado */}
          {typeof message === 'object' ? JSON.stringify(message) : message}
        </div>
        <a href="/scan" className="mt-8 text-white underline hover:text-red-300">Intentar otro código</a>
      </div>
    );
  }

if (status === 'success') {
    return (
      <div className="min-h-screen bg-zinc-950 text-white p-4 font-mono overflow-y-auto">
        <div className="max-w-3xl mx-auto py-10 text-center">
          
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-6xl mb-4">🎉</motion.div>
          <h1 className="text-3xl font-bold text-green-400 mb-2">¡RECLAMO EXITOSO!</h1>
          
          <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-lg mb-8 inline-block">
             <p className="text-gray-400 text-sm mb-1">Tokens enviados a:</p>
             <span className="text-white font-mono bg-black px-2 py-1 rounded border border-zinc-700 text-xs md:text-sm">
               {activeAddress}
             </span>
             <p className="text-green-500 text-xs mt-2">
                ✅ Transacción confirmada en Solana
             </p>
          </div>

          <div className="bg-zinc-900 border border-green-900 rounded-xl p-6 mb-8">
            <h2 className="text-xl text-white mb-4 font-bold animate-pulse text-green-400"> 
              MISIÓN: EXPANDIR LA COGNISFERA 
            </h2>
            <p className="text-sm text-zinc-500 mb-6">
              Descarga estas tarjetas y compártelas. Ganas puntos por cada Aeon nuevo.
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
                VER MI RANGO Y PUNTOS
              </button>
            </Link>

            {/* Botón Secundario: Ir al Inicio */}
            <Link href="/" className="w-full md:w-auto">
              <button className="w-full md:w-auto bg-zinc-800 hover:bg-zinc-700 text-zinc-300 py-4 px-8 rounded transition-all border border-zinc-700">
                VOLVER AL INICIO
              </button>
            </Link>
          </div>

          <div className="mt-4">
             <button onClick={logout} className="text-xs text-zinc-600 underline hover:text-zinc-400">
               Cerrar Sesión Actual
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
                {/* Mostramos las opciones según el tipo de dirección detectada */}
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

            {/* LÓGICA DE VALIDACIÓN VISUAL */}
            {(() => {
              const isSolanaAddress = activeAddress && !activeAddress.startsWith('0x');
              const readyToClaim = captchaToken && isSolanaAddress;

              return (
                <>
                  <button 
                    onClick={handleClaim}
                    disabled={!readyToClaim}
                    className={`w-full py-4 rounded font-bold text-lg transition-all
                      ${readyToClaim
                        ? 'bg-green-600 hover:bg-green-500 text-black shadow-[0_0_15px_rgba(34,197,94,0.5)]' 
                        : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                      }`}
                  >
                    {isSolanaAddress ? 'RECLAMAR TOKENS SPX' : 'DETECTANDO WALLET SOLANA...'}
                  </button>

                  {/* Mensaje de ayuda si está conectado con EVM pero falla la detección de Solana */}
                  {activeAddress && activeAddress.startsWith('0x') && !isSolanaAddress && (
                    <div className="bg-yellow-900/20 border border-yellow-900 p-3 rounded text-center">
                      <p className="text-yellow-500 text-xs">
                        ⚠️ Tienes una billetera de Ethereum, pero actualmente PASS-IT-AEON solo es compatible con billeteras Solana.
                      </p>
                      <button
                        onClick={async () => {
                          try {
                            // Forzamos la creación de una wallet de Solana para este usuario
                            linkWallet();
                            // Al terminar, el hook usePrivy se actualizará solo y detectará la nueva wallet
                          } catch (e) {
                            console.error(e);
                            alert('Error al vincular wallet: Intenta cerrar sesión y volver a entrar.');
                          }
                        }}
                        className="bg-yellow-600 hover:bg-yellow-500 text-black font-bold py-2 px-4 rounded text-xs shadow-lg"
                      >
                        🔗 CONECTAR BILLETERA SOLANA
                      </button>
                      <p className="text-[10px] text-yellow-500/60 mt-2">
                        O cierra sesión y entra con un correo nuevo para generar una wallet automática.
                      </p>
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
}
