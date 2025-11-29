'use client';

import { useState, useEffect } from 'react';
import { login, logout, getDashboardData, updateSetting } from './actions';
import { useLanguage } from '@/context/LanguageContext';
import axios from 'axios';

export default function AdminPage() {
  const { language, t } = useLanguage();

  const [isAuth, setIsAuth] = useState(false);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Datos del Dashboard
  const [data, setData] = useState<any>(null);
  const [editValues, setEditValues] = useState<Record<string, string>>({});

  const [genesisCount, setGenesisCount] = useState(5);
  const [genesisDays, setGenesisDays] = useState(90);
  const [genesisResult, setGenesisResult] = useState<string[]>([]);
  const [genesisLoading, setGenesisLoading] = useState(false);


  // Cargar datos al iniciar
  useEffect(() => {
    loadData();
  }, []);

async function loadData() {
    setLoading(true);
    setErrorMsg('');
    
    try {
      // Intentamos obtener los datos del servidor
      const dashboardData = await getDashboardData();
      
      if (dashboardData) {
        setIsAuth(true);
        setData(dashboardData);
        
        const initialEdits: Record<string, string> = {};
        // Validación de seguridad por si config viene vacío
        if (dashboardData.config) {
            Object.keys(dashboardData.config).forEach(key => {
                let val = dashboardData.config[key];
                initialEdits[key] = String(val); 
            });
        }
        setEditValues(initialEdits);
      } else {
        // Si no devuelve datos (null), es que no estamos autenticados
        setIsAuth(false);
      }
    } catch (err: any) {
      console.error("Error connecting to backend:", err);
      // Detectamos si es un error de conexión
      if (err.message.includes('ECONNREFUSED') || err.message.includes('fetch failed')) {
        setErrorMsg('⚠️ ERROR: BACKEND OFFLINE. Asegúrate de correr "node index.js"');
      } else {
        setErrorMsg(`⚠️ Error: ${err.message}`);
      }
    } finally {
      // Siempre quitamos el loading, pase lo que pase
      setLoading(false);
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    try {
      const success = await login(password);
      if (success) {
        loadData();
      } else {
        alert(t.acceso_denegado || 'Access Denied');
      }
    } catch (err) {
      alert("Error de conexión al intentar loguearse.");
    }
  }

async function handleSave(key: string) {
    const val = editValues[key];

    console.log(t.intentando_guardar, key, val);

    if (!confirm(`¿Cambiar ${key} a ${val}?`)) return;
    
    try {
      // 2. Llamada al servidor
      await updateSetting(key, val);
      
      // 3. Éxito
      alert('✅ '+t.guardada);
      loadData(); 

    } catch (error: any) {
      // 4. Captura de error
      console.error(t.error_guardar, error);
      alert(`❌ Error: ${error.message || t.fallo_actualizar}`);
    }
  }

  async function handleGenerateGenesis() {
    setGenesisLoading(true);
    try {
      // Usamos la variable 'password' del estado (la que usaste para loguearte) 
      // como el 'secret' para la API del backend.
      const res = await axios.post(`/api/admin/genesis`, {
        secret: password, 
        count: genesisCount,
        days: genesisDays
      });
      
      setGenesisResult(res.data.codes);
      alert(`✅ ${res.data.codes.length} Códigos Generados`);
    } catch (error: any) {
      console.error(error);
      alert(`❌ Error: ${error.response?.data?.error || error.message}`);
    } finally {
      setGenesisLoading(false);
    }
  }

  if (loading) return <div className="min-h-screen bg-black text-green-500 flex items-center justify-center font-mono">{t.cargando}</div>;

  // --- VISTA: LOGIN ---
  if (!isAuth) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center font-mono p-4">
        <h1 className="text-red-500 text-3xl mb-8 font-bold tracking-widest">{t.area_restringida}</h1>
        <form onSubmit={handleLogin} className="flex flex-col gap-4 w-full max-w-xs">
          <input 
            type="password" 
            placeholder="ENTER PASSCODE"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-zinc-900 border border-red-900 text-red-500 p-3 text-center outline-none focus:border-red-500"
          />
          <button className="bg-red-900/20 text-red-500 border border-red-900 py-2 hover:bg-red-900/40 transition-all">
            AUTHENTICATE
          </button>
        </form>
      </div>
    );
  }

  // --- VISTA: DASHBOARD ---
   return (
    <div className="min-h-screen bg-zinc-950 text-green-500 font-mono p-8 pb-20">
      
      {/* HEADER */}
      <div className="flex justify-between items-end mb-12 border-b border-green-900 pb-4">
        <div>
          <h1 className="text-3xl font-bold">ADMIN CONSOLE // v0.4</h1>
          <p className="text-zinc-500 text-xs mt-1">SYSTEM STATUS: ONLINE</p>
        </div>
        <button onClick={() => { logout(); setIsAuth(false); }} className="text-red-500 text-sm underline hover:text-red-400">
          [ DISCONNECT ]
        </button>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <KpiCard label="TOTAL USERS" value={data?.stats.users} />
        <KpiCard label="SUCCESSFUL CLAIMS" value={data?.stats.claims} />
        <KpiCard label="ACTIVE QR CODES" value={data?.stats.codes} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* COLUMNA IZQUIERDA: GAME SETTINGS */}
        <div className="bg-black border border-green-900 p-6 rounded-xl h-fit">
          <h2 className="text-xl text-white mb-6 font-bold flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            LIVE GAME CONFIGURATION
          </h2>
          
          <div className="grid gap-4">
            {Object.keys(editValues).map((key) => (
              <div key={key} className="flex flex-col gap-2 p-4 bg-zinc-900/30 rounded border border-zinc-800 hover:border-green-900 transition-colors">
                <div className="flex justify-between items-center">
                  <label className="text-xs text-zinc-500 uppercase tracking-wider">{key.replace(/_/g, ' ')}</label>
                  <button 
                    onClick={() => handleSave(key)}
                    className="text-[10px] bg-zinc-800 text-green-500 px-2 py-1 rounded border border-zinc-700 hover:border-green-500 transition-all"
                  >
                    SAVE
                  </button>
                </div>
                <input 
                  type="text" 
                  value={editValues[key]}
                  onChange={(e) => setEditValues({...editValues, [key]: e.target.value})}
                  className="bg-transparent text-white font-bold text-lg w-full outline-none border-b border-zinc-800 focus:border-green-500 transition-colors py-1"
                />
              </div>
            ))}
          </div>
        </div>

        {/* COLUMNA DERECHA: GENESIS CODES (NUEVO) */}
        <div className="bg-zinc-900/20 border border-yellow-900/50 p-6 rounded-xl h-fit">
          <h2 className="text-xl text-yellow-500 mb-6 font-bold flex items-center gap-2">
            <span className="text-2xl">⚡</span>
            GOD MODE: GENESIS CODES
          </h2>

          <div className="space-y-6">
            <div className="bg-black p-4 rounded border border-zinc-800">
              <p className="text-zinc-400 text-xs mb-4 leading-relaxed">
                Generate master codes that don't require a referrer. Ideal for influencers, testing, or special events.
                These codes use the current backend secret.
              </p>
              
              <div className="flex gap-4 mb-4">
                <div className="flex-1">
                  <label className="text-xs text-zinc-600 block mb-1">QUANTITY</label>
                  <input 
                    type="number" 
                    value={genesisCount}
                    onChange={(e) => setGenesisCount(Number(e.target.value))}
                    className="w-full bg-zinc-900 border border-zinc-700 p-2 text-white outline-none focus:border-yellow-500"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-zinc-600 block mb-1">VALIDITY (DAYS)</label>
                  <input 
                    type="number" 
                    value={genesisDays}
                    onChange={(e) => setGenesisDays(Number(e.target.value))}
                    className="w-full bg-zinc-900 border border-zinc-700 p-2 text-white outline-none focus:border-yellow-500"
                  />
                </div>
              </div>

              <button 
                onClick={handleGenerateGenesis}
                disabled={genesisLoading}
                className="w-full bg-yellow-900/20 hover:bg-yellow-900/40 text-yellow-500 border border-yellow-900 py-3 font-bold transition-all disabled:opacity-50"
              >
                {genesisLoading ? 'GENERATING...' : 'GENERATE CODES'}
              </button>
            </div>

            {/* RESULTADOS */}
            {genesisResult.length > 0 && (
              <div className="bg-black border border-green-900 p-4 rounded animate-in fade-in slide-in-from-top-2">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-white text-xs font-bold">GENERATED CODES:</span>
                  <button 
                    onClick={() => {
                      const text = genesisResult.map(c => `https://passitaeon.com/claim/${c}`).join('\n');
                      navigator.clipboard.writeText(text);
                      alert('Copied to clipboard!');
                    }}
                    className="text-[10px] text-green-500 underline"
                  >
                    COPY ALL LINKS
                  </button>
                </div>
                <pre className="bg-zinc-900/50 p-2 rounded text-[10px] text-green-400 overflow-x-auto h-40 overflow-y-auto select-all whitespace-pre">
                  {genesisResult.map(c => `https://passitaeon.com/claim/${c}`).join('\n')}
                </pre>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}

// Componente auxiliar visual
function KpiCard({ label, value }: { label: string, value: number }) {
  return (
    <div className="bg-zinc-900/30 border border-zinc-800 p-6 rounded-lg">
      <h3 className="text-zinc-500 text-xs mb-2 tracking-widest">{label}</h3>
      <p className="text-4xl text-white font-bold">{value}</p>
    </div>
  );
}