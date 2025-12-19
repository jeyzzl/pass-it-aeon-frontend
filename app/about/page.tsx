'use client';

import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';

export default function AboutPage() {
  const { t } = useLanguage();

  const MIRO_EMBED_URL = "https://miro.com/app/live-embed/uXjVJtzGTKw=/?embedMode=view_only_without_ui&moveToWidget=3458764647569694148"; 

  return (
    <main className="min-h-screen bg-black text-white font-mono relative overflow-hidden flex flex-col">
      
      {/* Fondo Animado */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none fixed"></div>
      <div className="w-96 h-96 bg-green-900/20 rounded-full blur-[128px] absolute top-0 left-1/2 transform -translate-x-1/2 pointer-events-none"></div>

      {/* HEADER DE NAVEGACIÓN */}
      <nav className="relative z-20 p-6 flex justify-between items-center border-b border-zinc-900 bg-black/50 backdrop-blur-sm">
        <Link href="/" className="group flex items-center gap-2 text-green-500 hover:text-green-400 transition-colors">
          <span className="text-xl">←</span>
          <span className="text-sm font-bold tracking-widest group-hover:underline">
            {t.volver_inicio || "RETURN"}
          </span>
        </Link>
      </nav>

      <div className="relative z-10 max-w-6xl mx-auto w-full p-6 space-y-12 pb-20">
        
        {/* SECCIÓN 1: TEXTO E INFO */}
        <section className="space-y-6 max-w-3xl animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div>
            <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-500 mb-2">
              SPX<span className="text-green-500">6900</span>
            </h1>
            <p className="text-green-500/80 text-sm tracking-[0.2em] uppercase">
              {t.about_subtitle}
            </p>
          </div>

          <div className="space-y-4 text-zinc-300 leading-relaxed md:text-lg border-l-2 border-green-900 pl-6">
            <p>{t.about_description_1}</p>
            <p className="text-white font-bold">{t.about_description_2}</p>
          </div>
          
          {/* Botones de Redes Sociales */}
          <div className="flex gap-4 pt-4">
            <a 
              href="https://twitter.com/spx6900" 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-4 py-2 bg-zinc-900 border border-zinc-700 rounded hover:border-blue-400 hover:text-blue-400 transition-all text-xs"
            >
              TWITTER / X
            </a>
            <a 
              href="https://coinmarketcap.com/currencies/spx6900/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-4 py-2 bg-zinc-900 border border-zinc-700 rounded hover:border-green-400 hover:text-green-400 transition-all text-xs"
            >
              COINMARKETCAP
            </a>
          </div>
        </section>

        {/* SECCIÓN 2: MIRO EMBED */}
        <section className="animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
          <div className="flex items-center gap-2 mb-4">
             <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></span>
             <h2 className="text-xl font-bold text-white tracking-tight">
               {t.miro_board_title || "VISUAL INTELLIGENCE"}
             </h2>
          </div>

          <div className="mb-4 w-full h-[600px] md:h-[700px] bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-2xl shadow-green-900/10 relative group">
            
            {/* Overlay de carga */}
            <div className="absolute inset-0 bg-zinc-900 flex items-center justify-center -z-10">
                <span className="text-green-500 animate-pulse">LOADING DATALINK...</span>
            </div>

            <iframe
              width="100%"
              height="100%"
              src={MIRO_EMBED_URL}
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
              className="w-full h-full filter grayscale hover:grayscale-0 transition-all duration-500 opacity-90 hover:opacity-100"
            ></iframe>

            {/* Decoración de esquina */}
            <div className="absolute bottom-0 right-0 p-4 pointer-events-none">
                <div className="border-r-2 border-b-2 border-green-500 w-8 h-8"></div>
            </div>
            <div className="absolute top-0 left-0 p-4 pointer-events-none">
                <div className="border-l-2 border-t-2 border-green-500 w-8 h-8"></div>
            </div>
          </div>

          <a 
            href="https://miro.com/app/board/uXjVJtzGTKw=/?moveToWidget=3458764647569694148&cot=14" 
            target="_blank" 
            rel="noopener noreferrer"
            className="px-4 py-2 bg-zinc-900 border border-zinc-700 rounded hover:border-blue-400 hover:text-blue-400 transition-all text-xs"
          >
            {t.about_miro}
          </a>
          
          <p className="text-center text-xs text-zinc-600 mt-4">
            {t.about_interactivo} // {t.about_navegacion} // {t.about_zoom}
          </p>
        </section>

      </div>
    </main>
  );
}