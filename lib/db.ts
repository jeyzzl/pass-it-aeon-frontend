// client-pass-it/lib/db.ts
import { Pool } from 'pg';

// Definimos un tipo global para evitar que TypeScript se queje
declare global {
  var postgresPool: Pool | undefined;
}

if (!process.env.DATABASE_URL) {
  throw new Error('❌ DATABASE_URL no está definida en .env.local');
}

const isProductionOrRailway = 
  process.env.NODE_ENV === 'production' || 
  process.env.DATABASE_URL.includes('railway.app') || 
  process.env.DATABASE_URL.includes('rlwy.net');

const config = {
  connectionString: process.env.DATABASE_URL,
  ssl: isProductionOrRailway ? { rejectUnauthorized: false } : undefined,
  max: 10, // Límite de conexiones
};

let pool: Pool;

if (process.env.NODE_ENV === 'production') {
  pool = new Pool(config);
} else {
  // En desarrollo, usamos una variable global para no crear múltiples pools
  if (!global.postgresPool) {
    console.log('🔌 Estableciendo nueva conexión a Base de Datos (Dev)...');
    global.postgresPool = new Pool(config);
  }
  
  pool = global.postgresPool;
}

export default pool;