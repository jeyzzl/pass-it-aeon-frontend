'use client';
// client-pass-it/components/ReferralCard.tsx

import { useRef, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import html2canvas from 'html2canvas';
import { useLanguage } from '@/context/LanguageContext';
import { Download, Copy, Share2 } from 'lucide-react';

interface ReferralCardProps {
  code: string;
  index: number;
  baseUrl: string;
}

export default function ReferralCard({ code, index, baseUrl }: ReferralCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  const { language, t } = useLanguage();

  // Lógica de selección de fondo
  const backgroundImage = language === 'es' 
    ? '/bg-card-es.png' 
    : '/bg-card-en.png';

  const shareUrl = `${baseUrl}/claim/${code}`;

  const downloadImage = async () => {
    if (!cardRef.current) return;
    setDownloading(true);

    try {
      // 1. Generar Canvas
      await new Promise(resolve => setTimeout(resolve, 100));

      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: null, // Transparente
        scale: 2, 
        useCORS: true, 
        logging: false,
        onclone: (doc) => {
          const el = doc.getElementById(`card-capture-${index}`);
          if (el) el.style.colorScheme = 'light';
        }
      });

      const fileName = `pass-it-${code}.png`;

      // 2. Convert Canvas to Blob
      canvas.toBlob(async (blob) => {
        if (!blob) {
          setDownloading(false);
          return;
        }

        // 3. TRY NATIVE SHARE
        if (navigator.share && navigator.canShare) {
          const file = new File([blob], fileName, { type: 'image/png' });
          const shareData = {
            files: [file],
            title: 'PASS IT [AE]ON',
            text: `Join me on Pass It! Code: ${code}`
          };

          if (navigator.canShare(shareData)) {
            try {
              await navigator.share(shareData);
              setDownloading(false);
              return; // Stop here if share worked
            } catch (err) {
              // User cancelled share or it failed. 
              console.warn('Share failed or cancelled, attempting download fallback');
            }
          }
        }

        // 4. LEGACY DOWNLOAD (Desktop / Fallback)
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        setDownloading(false);

      }, 'image/png');

      // const image = canvas.toDataURL('image/png');
      // const link = document.createElement('a');
      // link.href = image;
      // link.download = `PASS-IT-CARD-${index + 1}.png`;
      // link.click();

    } catch (err) {
      console.error("Error descargando carta:", err);
      alert("Error al generar imagen. Revisa la consola.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-3">
      
      {/* --- ÁREA DE CAPTURA --- */}
      <div 
        ref={cardRef}
        id={`card-capture-${index}`}
        // Usamos justify-center items-center para centrar todo el bloque
        className="relative w-[280px] h-[400px] rounded-xl overflow-hidden flex flex-col justify-center items-center shadow-2xl"
      >
        {/* 1. IMAGEN DE FONDO */}
        <img 
          src={backgroundImage}
          alt="Card Background"
          className="absolute inset-0 w-full h-full object-cover z-0" 
        />

        {/* 2. CONTENIDO (Agrupado en el centro) */}
        
        {/* QR Central */}
        <div 
          className="relative z-10 p-1 rounded-lg shadow-lg"
          style={{ backgroundColor: '#ffffff' }} // HEX puro para el fondo blanco del QR
        >
          <QRCodeSVG 
            value={shareUrl} 
            size={80} 
            level="Q" 
            includeMargin={false}
          />
        </div>

        {/* Footer / Stats (Justo debajo, transparente) */}
        <div className="relative z-10 w-full mt-3 px-4 text-center">
           {/* Usamos estilos inline para los colores de texto */}
           <p 
             className="text-[7px] font-mono font-bold mb-1"
             style={{ color: '#126929' }} // HEX para green-400
           >
             {t.escanea_reclamo}
           </p>
           <p 
             className="text-[5px] uppercase tracking-wider"
             style={{ color: '#e4e4e7' }} // HEX para zinc-200 (casi blanco)
           >
             {code.substring(0, 8)}...{code.substring(code.length - 4)}
           </p>
        </div>

      </div>

      {/* --- CONTROLES --- */}
      <div className="flex gap-2 w-full max-w-[280px]">
        <button 
          onClick={() => { navigator.clipboard.writeText(shareUrl); alert('Link copiado'); }}
          className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white text-xs py-3 rounded transition-colors border border-zinc-700"
        >
          {t.copiar}
        </button>
        <button 
          onClick={downloadImage}
          disabled={downloading}
          className="flex-1 bg-green-900/20 hover:bg-green-900/40 text-green-400 text-xs py-3 rounded transition-colors border border-green-900 flex justify-center items-center gap-1"
        >
          {downloading ? '...' : '⬇ '+t.descargar}
        </button>
      </div>
    </div>
  );
}
