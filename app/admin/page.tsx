'use client';

import { useState, useEffect } from 'react';
import { login, logout, getDashboardData, updateSetting } from './actions';

export default function AdminPage() {
  const [isAuth, setIsAuth] = useState(false);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Datos del Dashboard
  const [data, setData] = useState<any>(null);
  const [editValues, setEditValues] = useState<Record<string, string>>({});

  // Cargar datos al iniciar
  useEffect(() => {
    loadData();
  }, []);

async function loadData() {
    setLoading(true);
    const dashboardData = await getDashboardData();
    if (dashboardData) {
      setIsAuth(true);
      setData(dashboardData);
      
      const initialEdits: Record<string, string> = {};
      Object.keys(dashboardData.config).forEach(key => {
        let val = dashboardData.config[key];
        
        // Postgres ya nos devuelve el valor parseado del JSONB
        // Solo necesitamos convertirlo a string para mostrarlo en el input HTML
        initialEdits[key] = String(val); 
      });
      setEditValues(initialEdits);
      // -----------------------

    } else {
      setIsAuth(false);
    }
    setLoading(false);
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    const success = await login(password);
    if (success) {
      loadData();
    } else {
      alert('Acceso Denegado');
    }
  }

async function handleSave(key: string) {
    const val = editValues[key];
    
    // 1. Debug: Verificar que el botón reacciona
    console.log("Intentando guardar:", key, val);

    if (!confirm(`¿Cambiar ${key} a ${val}?`)) return;
    
    try {
      // 2. Llamada al servidor
      await updateSetting(key, val);
      
      // 3. Éxito
      alert('✅ Configuración actualizada con éxito');
      loadData(); 

    } catch (error: any) {
      // 4. Captura de error
      console.error("Error al guardar:", error);
      alert(`❌ Error: ${error.message || 'Falló la actualización'}`);
    }
  }

  if (loading) return <div className="min-h-screen bg-black text-green-500 flex items-center justify-center font-mono">CONNECTING...</div>;

  // --- VISTA: LOGIN ---
  if (!isAuth) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center font-mono p-4">
        <h1 className="text-red-500 text-3xl mb-8 font-bold tracking-widest">RESTRICTED AREA</h1>
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
    <div className="min-h-screen bg-zinc-950 text-green-500 font-mono p-8">
      
      {/* HEADER */}
      <div className="flex justify-between items-end mb-12 border-b border-green-900 pb-4">
        <div>
          <h1 className="text-3xl font-bold">ADMIN CONSOLE // v0.3</h1>
          <p className="text-zinc-500 text-xs mt-1">SYSTEM STATUS: ONLINE</p>
        </div>
        <button onClick={() => { logout(); setIsAuth(false); }} className="text-red-500 text-sm underline">
          [ DISCONNECT ]
        </button>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <KpiCard label="TOTAL USERS" value={data?.stats.users} />
        <KpiCard label="SUCCESSFUL CLAIMS" value={data?.stats.claims} />
        <KpiCard label="ACTIVE QR CODES" value={data?.stats.codes} />
      </div>

      {/* GAME SETTINGS EDITOR */}
      <div className="bg-black border border-green-900 p-6 rounded-xl">
        <h2 className="text-xl text-white mb-6 font-bold flex items-center gap-2">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          LIVE GAME CONFIGURATION
        </h2>
        
        <div className="grid gap-6">
          {Object.keys(editValues).map((key) => (
            <div key={key} className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-zinc-900/50 rounded border border-zinc-800">
              <div className="flex-1">
                <label className="text-xs text-zinc-500 uppercase tracking-wider block mb-1">{key.replace(/_/g, ' ')}</label>
                <input 
                  type="text" 
                  value={editValues[key]}
                  onChange={(e) => setEditValues({...editValues, [key]: e.target.value})}
                  className="bg-transparent text-white font-bold text-lg w-full outline-none border-b border-transparent focus:border-green-500 transition-colors"
                />
              </div>
              <button 
                onClick={() => handleSave(key)}
                className="bg-zinc-800 hover:bg-green-900 text-green-500 text-xs px-4 py-2 rounded border border-zinc-700 hover:border-green-500 transition-all"
              >
                UPDATE
              </button>
            </div>
          ))}
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