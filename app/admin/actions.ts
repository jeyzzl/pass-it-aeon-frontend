'use server';

import { cookies } from 'next/headers';
import pool from '@/lib/db';
import { revalidatePath } from 'next/cache';

// --- AUTH SIMPLE ---
export async function checkAuth() {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get('admin_session');
  return authCookie?.value === process.env.ADMIN_PASSWORD;
}

export async function login(password: string) {
  if (password === process.env.ADMIN_PASSWORD) {
    const cookieStore = await cookies();
    // Guardamos la cookie por 24h
    cookieStore.set('admin_session', password, { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 
    });
    return true;
  }
  return false;
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete('admin_session');
}

// --- LÓGICA DE DATOS ---

export async function getDashboardData() {
  const isAuth = await checkAuth();
  if (!isAuth) return null;

  const client = await pool.connect();
  try {
    // 1. KPIs Principales
    const usersCount = await client.query('SELECT COUNT(*) FROM users');
    const claimsCount = await client.query("SELECT COUNT(*) FROM claims WHERE status = 'success'");
    const activeCodes = await client.query("SELECT COUNT(*) FROM qr_codes WHERE is_active = true");
    
    // 2. Configuración Actual
    const settings = await client.query('SELECT key, value FROM game_settings');
    
    // Convertimos el array de settings a un objeto simple { key: value }
    const configMap: Record<string, any> = {};
    settings.rows.forEach(row => {
      configMap[row.key] = row.value;
    });

    return {
      stats: {
        users: parseInt(usersCount.rows[0].count),
        claims: parseInt(claimsCount.rows[0].count),
        codes: parseInt(activeCodes.rows[0].count),
      },
      config: configMap
    };
  } finally {
    client.release();
  }
}

export async function updateSetting(key: string, newValue: string) {
  const isAuth = await checkAuth();
  if (!isAuth) throw new Error('No autorizado. Por favor recarga y logueate de nuevo.');

  // Aseguramos que sea string antes de trim()
  const stringValue = String(newValue);
  const trimmed = stringValue.trim();
  
  let valueToStore: any = trimmed;

  // Detección de números
  if (!isNaN(Number(trimmed)) && trimmed !== '') {
    valueToStore = Number(trimmed);
  }
  // Detección de booleanos
  else if (trimmed.toLowerCase() === 'true') valueToStore = true;
  else if (trimmed.toLowerCase() === 'false') valueToStore = false;
  
  const finalJson = JSON.stringify(valueToStore);

  console.log(`Server Update -> Key: ${key}, Value: ${finalJson}`); // Log de servidor

  await pool.query(
    'INSERT INTO game_settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = $2',
    [key, finalJson]
  );

  revalidatePath('/admin');
  return { success: true };
}