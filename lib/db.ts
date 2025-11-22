import { Pool } from 'pg';

// Definimos un tipo global para evitar que TypeScript se queje
declare global {
  var postgresPool: Pool | undefined;
}

let pool: Pool;

if (process.env.NODE_ENV === 'production') {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });
} else {
  // En desarrollo, usamos una variable global para no crear múltiples pools
  if (!global.postgresPool) {
    global.postgresPool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
  }
  pool = global.postgresPool;
}

export default pool;