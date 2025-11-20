'use client';

import { useState, useEffect, use } from 'react';
import axios from 'axios';
import Turnstile from 'react-turnstile';
import { motion } from 'framer-motion';

// Definimos los tipos para typescript
type ClaimStatus = 'loading' | 'idle' | 'success' | 'error';

export default function ClaimPage({ params }: { params: Promise<{ token: string }> }) {
  // En Next.js 15+ params es una promesa, hay que desenrollarla con use()
  const { token } = use(params);

  const [status, setStatus] = useState<ClaimStatus>('loading');
  const [message, setMessage] = useState('Verificando código...');
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  
  // Datos del formulario
  const [wallet, setWallet] = useState('');
  const [blockchain, setBlockchain] = useState('ethereum'); // Default

  const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '';

  // 1. Validar el token apenas carga la página (Preflight)
  useEffect(() => {
    const checkToken = async () => {
      try {
        // Llamamos al endpoint /c/:token que creamos en el backend
        await axios.get(`/c/${token}`);
        setStatus('idle'); // El token es válido, mostramos el formulario
        setMessage('');
      } catch (error: any) {
        setStatus('error');
        setMessage(error.response?.data?.error || 'Código inválido o expirado.');
      }
    };
    checkToken();
  }, [token]);

  // 2. Función para enviar el reclamo
  const handleClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!captchaToken) {
      alert('Por favor completa el captcha');
      return;
    }

    setStatus('loading');
    setMessage('Procesando tu recompensa...');

    try {
      const response = await axios.post('/api/claim', {
        token,
        walletAddress: wallet,
        blockchain,
        captchaToken
      });

      if (response.data.success) {
        setStatus('success');
        setMessage('¡Éxito! Tus tokens llegarán pronto.');
      }
    } catch (error: any) {
      setStatus('error');
      setMessage(error.response?.data?.error || 'Error al reclamar.');
    }
  };

  // --- RENDERIZADO DE ESTADOS ---

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-black text-green-500 flex flex-col items-center justify-center font-mono p-4">
        <div className="animate-pulse text-xl">█ {message}</div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-black text-red-500 flex flex-col items-center justify-center font-mono p-4 text-center">
        <h1 className="text-4xl font-bold mb-4">ERROR FATAL</h1>
        <p className="border border-red-800 p-4 rounded bg-red-900/20">{message}</p>
        <a href="/scan" className="mt-8 text-white underline hover:text-red-300">Escanear otro código</a>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center font-mono p-4 text-center overflow-hidden">
        <motion.div 
          initial={{ scale: 0 }} 
          animate={{ scale: 1 }} 
          className="text-6xl mb-6"
        >
          🎉
        </motion.div>
        <h1 className="text-3xl font-bold text-green-400 mb-2">¡RECLAMO ENVIADO!</h1>
        <p className="text-gray-400 max-w-md mb-8">
          El Faucet está procesando tu transacción. Revisa tu billetera en unos instantes.
        </p>
        
        {/* Aquí iría el botón para generar SU propio código (Semana 3) */}
        <div className="p-4 border border-dashed border-green-600 rounded text-green-600 text-sm">
          Próximamente: Genera tu código y gana más.
        </div>
      </div>
    );
  }

  // Estado 'idle': Mostrar formulario
  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6 font-mono flex flex-col items-center">
      <div className="w-full max-w-md mt-10">
        <h1 className="text-2xl font-bold text-green-500 mb-2">PASS-IT-(AE)ON</h1>
        <div className="h-1 w-full bg-gradient-to-r from-green-500 to-transparent mb-8"></div>

        <form onSubmit={handleClaim} className="flex flex-col gap-6">
          
          {/* Selección de Cadena */}
          <div>
            <label className="block text-gray-400 text-sm mb-2">RED (BLOCKCHAIN)</label>
            <select 
              value={blockchain}
              onChange={(e) => setBlockchain(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 p-3 rounded text-white focus:border-green-500 outline-none"
            >
              <option value="ethereum">Ethereum (Testnet)</option>
              <option value="base">Base</option>
              <option value="solana">Solana</option>
              <option value="bnb">BNB Chain</option>
            </select>
          </div>

          {/* Input Wallet */}
          <div>
            <label className="block text-gray-400 text-sm mb-2">TU BILLETERA</label>
            <input 
              type="text" 
              placeholder="0x... o SolAddress..."
              value={wallet}
              onChange={(e) => setWallet(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 p-3 rounded text-white focus:border-green-500 outline-none"
              required
            />
          </div>

          {/* Captcha */}
          <div className="flex justify-center py-2">
            <Turnstile
              sitekey={SITE_KEY}
              onVerify={(token) => setCaptchaToken(token)}
              theme="dark"
            />
          </div>

          {/* Botón Submit */}
          <button 
            type="submit"
            disabled={!captchaToken || !wallet}
            className={`w-full py-4 rounded font-bold text-lg transition-all
              ${captchaToken && wallet 
                ? 'bg-green-600 hover:bg-green-500 text-black shadow-[0_0_15px_rgba(34,197,94,0.5)]' 
                : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
              }`}
          >
            RECLAMAR TOKEN
          </button>

        </form>
      </div>
    </div>
  );
}