'use client';
// client-pass-it/components/LanguageSwitcher.tsx

import { useLanguage } from '@/context/LanguageContext';

export default function LanguageSwitcher() {
  const { language, toggleLanguage } = useLanguage();

  return (
    <button
      onClick={toggleLanguage}
      className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-black/50 backdrop-blur-md border border-zinc-700 text-white px-3 py-1.5 rounded-full hover:bg-zinc-800 transition-all shadow-lg text-xs font-mono"
    >
      <span>{language === 'es' ? '🇺🇸' : '🇪🇸'}</span>
      <span className="font-bold">{language === 'es' ? 'EN' : 'ES'}</span>
    </button>
  );
}