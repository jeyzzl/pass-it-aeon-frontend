'use client';
// client-pass-it/app/leaderboard/page.tsx

import { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import DonateCard from '@/components/DonateCard';

interface LeaderboardEntry {
  wallet_address: string;
  points: number;
}

export default function LeaderboardPage() {
  const { t } = useLanguage();
  const [data, setData] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/leaderboard`)
      .then(res => setData(res.data.leaderboard))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-mono p-4">
      
      {/* Header con botón de idioma */}
      <div className="flex justify-between items-center max-w-4xl mx-auto mb-8">
        <Link href="/" className="text-green-500 font-bold text-xl hover:underline">
          &larr; {t.volver}
        </Link>
      </div>

      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl text-center font-bold text-green-400 mb-6 uppercase tracking-widest">
          {t.leaderboard_title}
        </h1>

        {loading ? (
          <div className="text-center text-green-800 animate-pulse">Scanning network...</div>
        ) : (
          <div className="border border-zinc-800 rounded-lg overflow-hidden bg-zinc-900/50">
            <table className="w-full text-left">
              <thead className="bg-zinc-900 text-green-600 uppercase text-xs">
                <tr>
                  <th className="px-6 py-3">#</th>
                  <th className="px-6 py-3">{t.user}</th>
                  <th className="px-6 py-3 text-right">{t.points}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {data.map((entry, idx) => (
                  <tr key={idx} className="hover:bg-zinc-800/50 transition">
                    <td className="px-6 py-4 text-zinc-500">
                      {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : idx + 1}
                    </td>
                    <td className="px-6 py-4 font-mono text-sm">
                      {entry.wallet_address}
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-green-400">
                      {entry.points.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-10 space-y-6">
          {/* The Donate Widget */}
          <DonateCard className="shadow-xl shadow-amber-900/5" /> 
        </div>
      </div>
      
    </div>
  );
}