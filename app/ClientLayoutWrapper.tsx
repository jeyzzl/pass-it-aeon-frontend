'use client';
// client-pass-it/ClientLayoutWrapper.tsx

import { useState, useEffect } from 'react';
import { LanguageProvider } from '@/context/LanguageContext';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import InstructionsModal from '@/components/InstructionsModal';

export default function ClientLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const [showInstructions, setShowInstructions] = useState(false);

  useEffect(() => {
    // Check if user has seen instructions before
    const hasSeenInstructions = localStorage.getItem('hasSeenInstructions');
    if (!hasSeenInstructions) {
      // Show instructions after a short delay on first visit
      const timer = setTimeout(() => {
        setShowInstructions(true);
        localStorage.setItem('hasSeenInstructions', 'true');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <>
      {/* Help Button */}
      <button
        onClick={() => setShowInstructions(true)}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-gradient-to-r from-green-600 to-emerald-500 text-black font-bold text-xl shadow-2xl hover:scale-110 transition-all flex items-center justify-center"
        aria-label="Show Instructions"
      >
        ?
      </button>

      {/* 1. Wrapper de Idioma */}
      <LanguageProvider>

        {/* 2. Botón de Idioma */}
        <LanguageSwitcher />

        {/* 3. Aplicación */}
        {children}

        {/* 4. Botón de Instrucciones */}
        <InstructionsModal
            isOpen={showInstructions}
            onClose={() => setShowInstructions(false)}
        />
      </LanguageProvider>
    </>
  );
}