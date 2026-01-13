'use client';
// client-pass-it/app/faq/page.tsx

import { useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import DonateCard from '@/components/DonateCard';

interface FAQItem {
  question: string;
  answer: string | JSX.Element;
  category: 'general' | 'game' | 'tokens' | 'tech';
}

export default function FAQPage() {
  const { t } = useLanguage();
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [openItems, setOpenItems] = useState<number[]>([]);

  // FAQ Data - You can move this to locales later
  const faqData: FAQItem[] = [
    {
      category: 'general',
      question: t.q1,
      answer: t.r1
    },
    {
      category: 'game',
      question: t.q2,
      answer: <>1. {t.r2_1}<br />2. {t.r2_2}<br />3. {t.r2_3}<br />4. {t.r2_4}</>
    },
    {
      category: 'tokens',
      question: t.q3,
      answer: t.r3
    },
    {
      category: 'tech',
      question: t.q4,
      answer: t.r4
    },
    {
      category: 'game',
      question: t.q5,
      answer: t.r5
    },
    {
      category: 'tokens',
      question: t.q6,
      answer: t.r6
    },
    {
      category: 'tech',
      question: t.q7,
      answer: t.r7
    },
    {
      category: 'game',
      question: t.q8,
      answer: t.r8
    },
    {
      category: 'tech',
      question: t.q9,
      answer: t.r9
    },
    {
      category: 'general',
      question: t.q10,
      answer: t.r10
    }
  ];

  const categories = [
    { id: 'all', label: t.faq_todas },
    { id: 'general', label: t.faq_general },
    { id: 'game', label: t.faq_game },
    { id: 'tokens', label: t.faq_tokens },
    { id: 'tech', label: t.faq_tech }
  ];

  const filteredFAQs = activeCategory === 'all' 
    ? faqData 
    : faqData.filter(item => item.category === activeCategory);

  const toggleItem = (index: number) => {
    setOpenItems(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  return (
    <main className="min-h-screen bg-black text-white font-mono relative overflow-hidden flex flex-col">
      {/* Fondo Animado (Mismo que el Home) */}
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
        {/* <div className="text-xs text-zinc-600">ENCRYPTED CONNECTION // SECURE</div> */}
      </nav>

      <div className="relative z-10 max-w-6xl mx-auto w-full p-6 space-y-12 pb-20">
        {/* Header */}
        <header className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-green-500 to-emerald-400 bg-clip-text text-transparent">
            {t.faq_titulo}
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            {t.faq_subtitulo}
          </p>
        </header>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeCategory === category.id
                  ? 'bg-green-600 text-black'
                  : 'bg-zinc-900 text-gray-300 hover:bg-zinc-800'
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>

        {/* FAQ List */}
        <div className="space-y-4">
          {filteredFAQs.map((faq, index) => (
            <div
              key={index}
              className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden hover:border-zinc-700 transition-colors"
            >
              <button
                onClick={() => toggleItem(index)}
                className="w-full p-6 text-left flex justify-between items-center hover:bg-zinc-800/30 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <span className="text-green-500 text-lg mt-1">Q</span>
                  <div className="text-lg font-semibold">{faq.question}</div>
                </div>
                <span className="text-green-500 text-2xl">
                  {openItems.includes(index) ? '−' : '+'}
                </span>
              </button>
              
              {openItems.includes(index) && (
                <div className="px-6 pb-6 pt-2 border-t border-zinc-800">
                  <div className="flex items-start gap-4">
                    <span className="text-blue-500 text-lg mt-1">A</span>
                    <div className="text-gray-300 leading-relaxed">
                      {faq.answer}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Additional Help Section */}
        <div className="mt-16 p-8 bg-gradient-to-r from-green-900/20 to-emerald-900/20 border border-green-900/50 rounded-2xl">
          <h2 className="text-2xl font-bold mb-4">{t.faq_cartas_titulos}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-black/50 p-6 rounded-xl border border-zinc-800">
              <div className="text-green-500 text-3xl mb-4">📖</div>
              <h3 className="font-bold mb-2">{t.faq_c1_titulo}</h3>
              <p className="text-gray-400 text-sm mb-4">
                {t.faq_c1_subtitulo}
              </p>  
              <Link href="#" className="text-green-500 hover:text-green-400 text-sm font-medium">
                {t.faq_c1_accion} →
              </Link>
            </div>
            
            <div className="bg-black/50 p-6 rounded-xl border border-zinc-800">
              <div className="text-blue-500 text-3xl mb-4">💬</div>
              <h3 className="font-bold mb-2">{t.faq_c2_titulo}</h3>
              <p className="text-gray-400 text-sm mb-4">
                {t.faq_c2_subtitulo}
              </p>
              <a 
                href="https://t.me/SPX6900Portal" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-500 hover:text-blue-400 text-sm font-medium"
              >
                {t.faq_c2_accion} →
              </a>
            </div>
            
            <div className="bg-black/50 p-6 rounded-xl border border-zinc-800">
              <div className="text-purple-500 text-3xl mb-4">🛠️</div>
              <h3 className="font-bold mb-2">{t.faq_c3_titulo}</h3>
              <p className="text-gray-400 text-sm mb-4">
                {t.faq_c3_subtitulo}
              </p>
              <a 
                href="mailto:passitaeon@gmail.com" 
                className="text-purple-500 hover:text-purple-400 text-sm font-medium"
              >
                {t.faq_c3_accion} →
              </a>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* The Donate Widget */}
          <DonateCard className="shadow-xl shadow-amber-900/5" /> 
        </div>

        {/* Footer */}
        <footer className="mt-12 pt-8 border-t border-zinc-800 text-center text-gray-500 text-sm">
          <p>PASS-IT-AEON FAQ • Last updated: {new Date().toLocaleDateString()}</p>
          <p className="mt-2">
            {t.faq_footer}?{' '}
            <a href="mailto:passitaeon@gmail.com" className="text-green-500 hover:text-green-400">
              Contact us
            </a>
          </p>
        </footer>
      </div>
    </main>
  );
}