'use client';
// client-pass-it/components/ReferralCard.tsx

import { useRef, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { QRCodeSVG } from 'qrcode.react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { useLanguage } from '@/context/LanguageContext';
import { X, Printer, FileDown } from 'lucide-react';

interface ReferralCardProps {
  code: string;
  index: number;
  baseUrl: string;
}

export default function ReferralCard({ code, index, baseUrl }: ReferralCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  // Estados
  const [downloading, setDownloading] = useState(false);
  const [printing, setPrinting] = useState(false);
  const [processingPdf, setProcessingPdf] = useState(false);
  const [fallbackImage, setFallbackImage] = useState<string | null>(null);
  const [portalNode, setPortalNode] = useState<HTMLElement | null>(null);
  const [imagesLoaded, setImagesLoaded] = useState({ front: false, back: false });
  const [isMobile, setIsMobile] = useState(false);

  const { language, t } = useLanguage();

  // Lógica de selección de fondo
  const backgroundImage = language === 'es' 
    ? '/bg-card-es.png' 
    : '/bg-card-en.png';

  const backgroundImageBack = language === 'es' 
    ? '/bg-card-back-es.png' 
    : '/bg-card-back-en.png';

  const shareUrl = `${baseUrl}/claim/${code}`;

  // --- DETECTAR SI ES MOBIL ---
  useEffect(() => {
    const checkMobile = () => {
      const userAgent = typeof navigator === 'undefined' ? '' : navigator.userAgent;
      const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
      setIsMobile(mobile);
    };
    checkMobile();
  }, []);

  // --- PORTAL NODE ---
  useEffect(() => {
    if (!printing) return;

    const node = document.createElement('div');
    node.id = 'print-portal-root';

    Object.assign(node.style, {
      position: 'fixed',
      top: '0',
      left: '0',
      width: '100vw',
      height: '100vh',
      zIndex: '999999',
      backgroundColor: '#ffffff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden'
    });

    document.body.appendChild(node);
    setPortalNode(node);

    return () => {
      if (document.body.contains(node)) {
        document.body.removeChild(node);
      }
      setPortalNode(null);
    };
  }, [printing]);

  // --- HANDLER DESCARGA IMAGEN ---
  const downloadImage = async () => {
    if (!cardRef.current) return;
    setDownloading(true);

    try {
      // 1. Time Out para generar Canvas
      await new Promise(resolve => setTimeout(resolve, 200));

      // 2. Generar Canvas
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: null,
        scale: 2, 
        useCORS: true, 
        logging: false,
        onclone: (doc) => {
          const el = doc.getElementById(`card-capture-${index}`);
          if (el) el.style.colorScheme = 'light';
        }
      });

      const fileName = `pass-it-${code}.png`;
      const dataUrl = canvas.toDataURL('image/png');

      // 3. Intenta Share Nativo
      if (navigator.share && navigator.canShare) {
        const res = await fetch(dataUrl);
        const blob = await res.blob();
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
            return; 
          } catch (err) { 
            console.warn('Share failed or cancelled, attempting download fallback');
          }
        }
      }

      // 4. Descarga automatica
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // 5. Modal de descarga movil
      setFallbackImage(dataUrl);
      setDownloading(false);

    } catch (err) {
      console.error("Error descargando carta:", err);
      alert("Error al generar imagen. Revisa la consola.");
    } finally {
      setDownloading(false);
    }
  };

  // --- HANDLER IMPRESION O PDF ---
  const handlePrint = () => {
    setImagesLoaded({ front: false, back: false });
    setPrinting(true);
    if (isMobile) setProcessingPdf(true);
  };

  useEffect(() => {
    if (printing && imagesLoaded.front && imagesLoaded.back) {

      const execute = async () => {
        await new Promise(resolve => setTimeout(resolve, 500));

        if (!portalNode) return;

        if (isMobile) {
          // === MOBILE: GENERATE PDF ===
          try {
            const elementToCapture = portalNode.firstElementChild as HTMLElement;
            if (!elementToCapture) throw new Error("Portal empty");

            // 1. Capture the High-Res Canvas
            const canvas = await html2canvas(elementToCapture, {
              scale: 1.5,
              useCORS: true,
              logging: false,
              backgroundColor: '#ffffff',
            });

            // 2. Create PDF (A4 Landscape)
            const pdf = new jsPDF('l', 'mm', 'a4');
            const pageWidth = 297;
            const pageHeight = 210;

            // 3. Add Image to PDF
            const imgData = canvas.toDataURL('image/jpeg', 0.9);
            pdf.addImage(imgData, 'JPEG', 0, 0, pageWidth, pageHeight);

            // 4. Save
            pdf.save(`pass-it-gift-${code}.pdf`);

          } catch (error) {
            console.error("PDF Gen Error:", error);
            alert("Download blocked by browser. Please try opening in Chrome/Safari.");
          } finally {
            setProcessingPdf(false);
            setPrinting(false); // Close portal
          }

        } else {
          // === DESKTOP: NATIVE PRINT ===
          window.print();
          setTimeout(() => setPrinting(false), 500);
        }
      };

      execute();
    }
  }, [printing, portalNode, imagesLoaded, isMobile, code ]);

  /*
    ========================================================================
      CONTENIDO DE IMPRESION
    ========================================================================
  */
  const printContent = (
    <div 
      className="flex flex-row overflow-hidden bg-white"
      style={{ 
        transform: isMobile ? 'none' : 'scale(0.85)',
        transformOrigin: 'center center',
        minWidth: '1120px',
        width: '1120px',
        height: '800px'
      }}
    >
      {/* PANEL IZQUIERDO */}
      <div className="flex flex-col items-center justify-center border-r border-dashed border-gray-300 relative shrink-0">
        <div 
          className="relative w-[560px] h-[800px] rounded-xl overflow-hidden flex flex-col justify-center items-center shadow-none border border-gray-100"
        >
          {/* 1. IMAGEN DE FONDO */}
          <img 
            src={backgroundImage}
            alt="Card Background"
            className="absolute inset-0 w-full h-full object-cover z-0" 
            loading='eager'
            onLoad={() => setImagesLoaded(prev => ({ ...prev, front: true }))}
            onError={() => setImagesLoaded(prev => ({ ...prev, front: true }))}
          />
          
          {/* 2. QR Central */}
          <div 
            className="relative z-10 p-1 rounded-lg shadow-lg"
            style={{ backgroundColor: '#ffffff' }}
          >
            <QRCodeSVG 
              value={shareUrl} 
              size={160} 
              level="Q" 
              includeMargin={false}
            />
          </div>

          {/* 3. Footer / Stats */}
          <div className="relative z-10 w-full mt-3 px-4 text-center">
            <p 
              className="text-[14px] font-mono font-bold mb-1"
              style={{ color: '#126929' }}
            >
              {t.escanea_reclamo}
            </p>
            <p 
              className="text-[10px] uppercase tracking-wider"
              style={{ color: '#e4e4e7' }}
            >
              {code.substring(0, 8)}...{code.substring(code.length - 4)}
            </p>
          </div>
        </div>
      </div>

      {/* PANEL DERECHO */}
      <div className="flex flex-col items-center justify-center relative shrink-0">
        <div 
          className="relative w-[560px] h-[800px] rounded-xl overflow-hidden flex flex-col justify-center items-center shadow-none border border-gray-100"
        >
          {/* 1. Imagen de Instrucciones (back) */}
          <img 
            src={backgroundImageBack}
            alt="Card Back Background"
            className="absolute inset-0 w-full h-full object-cover z-0" 
            onLoad={() => setImagesLoaded(prev => ({ ...prev, back: true }))}
            onError={() => setImagesLoaded(prev => ({ ...prev, back: true }))}
          />
        </div>
      </div>

    </div>
  );

  return (
    <>
      {/* 
        ========================================================================
          CARTA REGULAR
        ========================================================================
      */}
      <div className="flex flex-col items-center gap-3 print:hidden">
        {/* --- ÁREA DE CAPTURA --- */}
        <div 
          ref={cardRef}
          id={`card-capture-${index}`}
          className="relative w-[280px] h-[400px] rounded-xl overflow-hidden flex flex-col justify-center items-center shadow-2xl"
        >
          {/* 1. IMAGEN DE FONDO */}
          <img 
            src={backgroundImage}
            alt="Card Background"
            className="absolute inset-0 w-full h-full object-cover z-0" 
          />

          {/* 2. CONTENIDO */}
          
          {/* QR Central */}
          <div 
            className="relative z-10 p-1 rounded-lg shadow-lg"
            style={{ backgroundColor: '#ffffff' }}
          >
            <QRCodeSVG 
              value={shareUrl} 
              size={80} 
              level="Q" 
              includeMargin={false}
            />
          </div>

          {/* Footer / Stats */}
          <div className="relative z-10 w-full mt-3 px-4 text-center">
            <p 
              className="text-[7px] font-mono font-bold mb-1"
              style={{ color: '#126929' }}
            >
              {t.escanea_reclamo}
            </p>
            <p 
              className="text-[5px] uppercase tracking-wider"
              style={{ color: '#e4e4e7' }}
            >
              {code.substring(0, 8)}...{code.substring(code.length - 4)}
            </p>
          </div>

        </div>

        {/* --- CONTROLES --- */}
        <div className="flex gap-2 w-full max-w-[280px]">
          {/* Boton de Copiar */}
          <button 
            onClick={() => { navigator.clipboard.writeText(shareUrl); alert('Link copiado'); }}
            className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white text-xs py-3 rounded transition-colors border border-zinc-700"
          >
            {t.copiar}
          </button>
          {/* Boton Descarga */}
          <button 
            onClick={downloadImage}
            disabled={downloading}
            className="flex-1 bg-green-900/20 hover:bg-green-900/40 text-green-400 text-xs py-3 rounded transition-colors border border-green-900 flex justify-center items-center gap-1"
          >
            {downloading ? '...' : '⬇ '+t.descargar}
          </button>
          {/* Boton de Impresion */}
          <button 
            onClick={handlePrint}
            className="w-10 bg-zinc-800 hover:bg-zinc-700 text-white flex items-center justify-center rounded border border-zinc-700 transition-colors"
            title="Print Gift Card"
          >
            <Printer size={16} />
          </button>
        </div>
      </div>

      {/*
        ========================================================================
          MODAL DE FALLBACK (Descarga mobil)
        ========================================================================
      */}
      {fallbackImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200 print:hidden">
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-4 max-w-sm w-full flex flex-col items-center shadow-2xl relative">
            
            <button 
              onClick={() => setFallbackImage(null)}
              className="absolute top-2 right-2 text-zinc-400 hover:text-white bg-zinc-800 rounded-full p-1"
            >
              <X size={20} />
            </button>

            <h3 className="text-white font-bold mb-2">{t.card_guardar}</h3>
            <p className="text-zinc-400 text-xs mb-4 text-center">
              {t.card_preciona}
            </p>

            <img 
              src={fallbackImage} 
              alt="Generated Card" 
              className="w-full h-auto rounded border border-zinc-800 shadow-lg"
            />

            <button
                onClick={() => setFallbackImage(null)}
                className="mt-4 w-full bg-green-600 hover:bg-green-500 text-black font-bold py-2 rounded text-sm"
            >
              {t.card_listo}
            </button>
          </div>
        </div>
      )}

      {/*
        ========================================================================
          PRINT VIEW (Gift Card)
        ========================================================================
      */}
      {printing && portalNode && createPortal (
        printContent,
        portalNode
      )}
    </>
  );
}