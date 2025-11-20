import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-black text-white relative overflow-hidden">
      
      {/* Decoración de fondo */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
      <div className="w-64 h-64 bg-green-600 rounded-full blur-[128px] opacity-20 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>

      <div className="z-10 text-center space-y-8">
        <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-500">
          PASS IT <br/>
          <span className="text-green-500">(AE)ON</span>
        </h1>
        
        <p className="text-zinc-400 max-w-md mx-auto font-mono text-sm">
          Escanea el código. Reclama la recompensa. Pásalo al siguiente.
        </p>

        <Link href="/scan">
          <button className="group relative px-8 py-4 bg-zinc-900 border border-green-900 rounded-lg hover:border-green-500 transition-all duration-300 overflow-hidden">
            <div className="absolute inset-0 bg-green-600/10 group-hover:bg-green-600/20 transition-all"></div>
            <span className="relative font-mono font-bold text-green-400 group-hover:text-green-300 flex items-center gap-2">
              [ ESCANEAR CÓDIGO ]
            </span>
          </button>
        </Link>
      </div>
      
      <footer className="absolute bottom-6 text-xs text-zinc-700 font-mono">
        v0.3 // SYSTEM READY
      </footer>
    </main>
  );
}