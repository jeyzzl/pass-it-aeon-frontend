'use client';

import { useRef, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import html2canvas from 'html2canvas';

interface ReferralCardProps {
  code: string;
  index: number;
  baseUrl: string;
}

export default function ReferralCard({ code, index, baseUrl }: ReferralCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  const shareUrl = `${baseUrl}/claim/${code}`;

  const downloadImage = async () => {
    if (!cardRef.current) return;
    setDownloading(true);

    try {
      // Esperamos un poco para asegurar que todo esté renderizado
      await new Promise(resolve => setTimeout(resolve, 100));

      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: '#000000',
        scale: 2, // Mejor calidad (Retina)
        useCORS: true, // Permite cargar imágenes si tienen headers correctos
        allowTaint: true, // Permite pintar, aunque a veces bloquea la descarga
        logging: true, // Para ver errores en consola si falla
      });

      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = image;
      link.download = `PASS-IT-CARD-${index + 1}.png`;
      link.click();
    } catch (err) {
      console.error("Error detallado al generar imagen:", err);
      alert("No se pudo generar la imagen. Revisa la consola para más detalles.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-3">
      {/* --- EL DISEÑO DE LA CARTA --- */}
      <div 
        ref={cardRef}
        className="relative w-[280px] h-[400px] bg-black rounded-xl overflow-hidden border-4 border-zinc-800 flex flex-col items-center justify-between p-4 shadow-2xl"
        style={{ 
          // Fondo degradado CSS puro (sin imágenes externas para evitar CORS)
          background: `radial-gradient(circle at 50% 0%, #222 0%, #000 100%)`
        }}
      >
        {/* Decoración: Reemplazamos la imagen externa de ruido por puntos CSS */}
        <div 
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(#333 1px, transparent 1px)',
            backgroundSize: '10px 10px'
          }}
        ></div>

        {/* Header Holográfico */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-green-500 to-transparent opacity-50"></div>

        {/* Encabezado */}
        <div className="text-center z-10 mt-4">
          <h3 className="text-green-500 font-black text-lg tracking-widest shadow-black drop-shadow-md">
            PASS-IT-(AE)ON
          </h3>
          <p className="text-zinc-500 text-[10px] font-mono">SERIES v0.3 // NODE #{index + 1}</p>
        </div>

        {/* El QR Central */}
        <div className="relative z-10 bg-white p-3 rounded-lg">
          <QRCodeSVG 
            value={shareUrl} 
            size={150} 
            level="Q" 
            includeMargin={false}
          />
        </div>

        {/* Footer Stats */}
        <div className="w-full z-10 mb-2">
          <div className="bg-zinc-900/90 border border-zinc-700 p-3 rounded text-center backdrop-blur-sm">
             <p className="text-green-400 text-xs font-mono mb-1 font-bold">REWARD: AUTO-CLAIM</p>
             <p className="text-zinc-500 text-[9px] uppercase tracking-tighter">Scan to initiate protocol</p>
          </div>
          <p className="text-zinc-700 text-[8px] text-center mt-2 font-mono">
            ID: {code.substring(0, 8)}...{code.substring(code.length - 4)}
          </p>
        </div>

        {/* Esquinas Cyberpunk */}
        <div className="absolute top-4 left-4 w-3 h-3 border-t-2 border-l-2 border-green-600"></div>
        <div className="absolute top-4 right-4 w-3 h-3 border-t-2 border-r-2 border-green-600"></div>
        <div className="absolute bottom-4 left-4 w-3 h-3 border-b-2 border-l-2 border-green-600"></div>
        <div className="absolute bottom-4 right-4 w-3 h-3 border-b-2 border-r-2 border-green-600"></div>
      </div>

      {/* --- CONTROLES --- */}
      <div className="flex gap-2 w-full max-w-[280px]">
        <button 
          onClick={() => { navigator.clipboard.writeText(shareUrl); alert('Link copiado'); }}
          className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white text-xs py-3 rounded transition-colors border border-zinc-700"
        >
          COPIAR LINK
        </button>
        <button 
          onClick={downloadImage}
          disabled={downloading}
          className="flex-1 bg-green-900/20 hover:bg-green-900/40 text-green-400 text-xs py-3 rounded transition-colors border border-green-900 flex justify-center items-center gap-1"
        >
          {downloading ? '...' : '⬇ DESCARGAR'}
        </button>
      </div>
    </div>
  );
}