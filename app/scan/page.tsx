'use client';
// client-pass-it/app/scan/page.tsx

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Scanner } from '@yudiel/react-qr-scanner';
import { motion } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';

export default function ScanPage() {
  const router = useRouter();
  const [error, setError] = useState<string>('');
  const [scanned, setScanned] = useState(false);
  
  // --- CONTEXTO DE LENGUAJE ---
  const { t } = useLanguage();

  // --- MANEJO DE SCAN ---
  const handleScan = (detectedCodes: any[]) => {
    if (scanned) return; // Evitar lecturas múltiples muy rápidas
    
    if (detectedCodes && detectedCodes.length > 0) {
      const rawValue = detectedCodes[0].rawValue;
      
      // --- LÓGICA DE PARSEO ---
      // Extraer la última parte si es una URL
      let token = rawValue;
      
      if (rawValue.includes('/claim/')) {
        const parts = rawValue.split('/claim/');
        token = parts[1];
      } else if (rawValue.includes('/c/')) {
        // Por si usas la URL corta en el futuro
        const parts = rawValue.split('/c/');
        token = parts[1];
      }

      // Limpieza básica (quitar espacios o slashes finales)
      token = token.replace(/\/$/, '').trim();

      if (token) {
        setScanned(true);
        // Feedback táctil
        if (navigator.vibrate) navigator.vibrate(200);
        
        // Redirigir a la página de reclamo
        router.push(`/claim/${token}`);
      }
    }
  };

  // --- MANEJO DE ERRORES ---
  const handleError = (err: any) => {
    console.error(err);
    setError('No pudimos acceder a la cámara. Asegúrate de dar permisos.');
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center relative overflow-hidden">
      
      {/* Título flotante */}
      <div className="absolute top-10 z-10 text-green-500 font-mono text-xl tracking-widest bg-black/50 px-4 py-1 rounded border border-green-900">
        {t.escaneando_codigo}
      </div>

      {/* Contenedor de la cámara */}
      <div className="w-full max-w-md aspect-square relative border-2 border-zinc-800 rounded-xl overflow-hidden shadow-[0_0_30px_rgba(34,197,94,0.1)]">
        
        {!scanned ? (
          <Scanner 
            onScan={handleScan} 
            onError={handleError}
            // Opciones visuales de la librería
            components={{
              onOff: false, 
              torch: true, // Permite encender la linterna si existe
              zoom: true, 
              finder: false // Desactivamos el finder por defecto para poner el nuestro custom
            }}
            styles={{
              container: { width: '100%', height: '100%' }
            }}
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-black text-green-500 animate-pulse">
            {t.procesando}
          </div>
        )}

        {/* Nuestro "Finder" Custom */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Esquinas verdes */}
          <div className="absolute top-0 left-0 w-16 h-16 border-t-4 border-l-4 border-green-500 rounded-tl-lg"></div>
          <div className="absolute top-0 right-0 w-16 h-16 border-t-4 border-r-4 border-green-500 rounded-tr-lg"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 border-b-4 border-l-4 border-green-500 rounded-bl-lg"></div>
          <div className="absolute bottom-0 right-0 w-16 h-16 border-b-4 border-r-4 border-green-500 rounded-br-lg"></div>
          
          {/* Línea de escaneo animada */}
          {!scanned && (
            <motion.div 
              className="absolute top-0 left-0 w-full h-1 bg-green-500/50 shadow-[0_0_15px_#22c55e]"
              animate={{ top: ["0%", "100%", "0%"] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            />
          )}
        </div>
      </div>

      {/* Mensaje de error si falla */}
      {error && (
        <div className="mt-4 text-red-500 bg-red-900/20 p-3 rounded text-center max-w-xs">
          {error}
        </div>
      )}

      {/* Botón de regreso */}
      <button 
        onClick={() => router.push('/')}
        className="mt-8 text-zinc-500 hover:text-white underline font-mono text-sm z-10"
      >
        {t.volver_inicio}
      </button>
    </div>
  );
}