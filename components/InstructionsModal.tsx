'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';

interface InstructionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function InstructionsModal({ isOpen, onClose }: InstructionsModalProps) {
  const { language, t } = useLanguage();
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  // Close on ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const steps = [
    {
      title: t.inst_c1_titulo,
      description: t.inst_c1_subtitulo,
      icon: '📱',
      details: [t.inst_c1_detalles_a, t.inst_c1_detalles_b]
    },
    {
      title: t.inst_c2_titulo,
      description: t.inst_c2_subtitulo,
      icon: '🔗',
      details: [t.inst_c2_detalles_a, t.inst_c2_detalles_b, t.inst_c2_detalles_c]
    },
    {
      title: t.inst_c3_titulo,
      description: t.inst_c3_subtitulo,
      icon: '🔄',
      details: [t.inst_c3_detalles_a, t.inst_c3_detalles_b, t.inst_c3_detalles_c]
    },
    {
      title: t.inst_c4_titulo,
      description: t.inst_c4_subtitulo,
      icon: '🏆',
      details: [t.inst_c4_detalles_a, t.inst_c4_detalles_b, t.inst_c4_detalles_c]
    }
  ];

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        />
        
        {/* Modal - Mobile optimized */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-2xl max-h-[90vh] sm:max-h-[85vh] flex flex-col bg-gradient-to-b from-zinc-900 to-black border border-green-900/50 rounded-2xl overflow-hidden shadow-2xl"
        >
          {/* Header - Fixed height */}
          <div className="p-4 sm:p-6 border-b border-zinc-800 shrink-0">
            <div className="flex justify-between items-start gap-2">
              <div className="flex-1 min-w-0">
                <h2 className="text-lg sm:text-2xl font-bold text-white flex items-center gap-2 sm:gap-3 truncate">
                  <span className="text-green-500 text-xl sm:text-2xl">🎮</span>
                  <span className="truncate">{t.inst_titulo}</span>
                </h2>
                <p className="text-gray-400 text-xs sm:text-sm mt-1">
                  {t.inst_paso} {currentStep} {t.inst_de} {totalSteps}
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-white text-xl sm:text-2xl transition-colors shrink-0 ml-2"
              >
                ✕
              </button>
            </div>
            
            {/* Progress Bar */}
            <div className="mt-4 sm:mt-6 h-1.5 sm:h-2 bg-zinc-800 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(currentStep / totalSteps) * 100}%` }}
                className="h-full bg-gradient-to-r from-green-500 to-emerald-400"
              />
            </div>
          </div>
          
          {/* Content - Scrollable area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Left: Step Icon & Navigation - Stack vertically on mobile */}
              <div className="md:w-1/3">
                <div className="text-center mb-6">
                  <div className="text-4xl sm:text-5xl md:text-6xl mb-3 sm:mb-4">{steps[currentStep - 1].icon}</div>
                  <div className="inline-flex items-center gap-2 text-green-500 font-bold text-sm sm:text-base">
                    <span>{t.inst_paso} {currentStep}</span>
                    <span className="text-gray-500">/</span>
                    <span>{totalSteps}</span>
                  </div>
                </div>
                
                {/* Step Indicators - Horizontal scroll on mobile */}
                <div className="flex md:flex-col gap-2 overflow-x-auto pb-2 md:pb-0 md:space-y-3">
                  {steps.map((step, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentStep(index + 1)}
                      className={`shrink-0 md:w-full p-2 sm:p-3 rounded-lg text-left transition-all ${
                        currentStep === index + 1
                          ? 'bg-green-900/30 border border-green-800'
                          : 'hover:bg-zinc-800/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs sm:text-sm ${
                          currentStep === index + 1
                            ? 'bg-green-600 text-black'
                            : index + 1 < currentStep
                            ? 'bg-green-900/50 text-green-400'
                            : 'bg-zinc-800 text-gray-400'
                        }`}>
                          {index + 1}
                        </div>
                        <span className={`font-medium text-sm sm:text-base whitespace-nowrap ${
                          currentStep === index + 1 ? 'text-white' : 'text-gray-400'
                        }`}>
                          {step.title}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Right: Step Content */}
              <div className="md:w-2/3">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="h-full"
                >
                  <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">
                    {steps[currentStep - 1].title}
                  </h3>
                  
                  <p className="text-gray-300 text-base sm:text-lg mb-4 sm:mb-6">
                    {steps[currentStep - 1].description}
                  </p>
                  
                  <div className="space-y-2 sm:space-y-3 mb-6 sm:mb-8">
                    {steps[currentStep - 1].details.map((detail, index) => (
                      <div key={index} className="flex items-start gap-2 sm:gap-3">
                        <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-green-900/30 border border-green-800 flex items-center justify-center text-green-500 text-xs mt-0.5 shrink-0">
                          ✓
                        </div>
                        <span className="text-gray-300 text-sm sm:text-base">{detail}</span>
                      </div>
                    ))}
                  </div>
                  
                  {/* Visual Guide */}
                  {currentStep === 1 && (
                    <div className="bg-black/50 p-3 sm:p-4 rounded-xl border border-zinc-800 mb-4 sm:mb-6">
                      <div className="grid grid-cols-2 gap-3 sm:gap-4 text-center">
                        <div>
                          <div className="text-xl sm:text-2xl mb-1 sm:mb-2">🤝</div>
                          <div className="text-xs text-gray-400">{t.inst_c1_visual_1}</div>
                        </div>
                        <div>
                          <div className="text-xl sm:text-2xl mb-1 sm:mb-2">🎯</div>
                          <div className="text-xs text-gray-400">{t.inst_c1_visual_2}</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {currentStep === 2 && (
                    <div className="bg-black/50 p-3 sm:p-4 rounded-xl border border-zinc-800 mb-4 sm:mb-6">
                      <div className="flex items-center justify-center gap-2 sm:gap-4">
                        <div className="text-center">
                          <div className="text-2xl sm:text-3xl mb-1 sm:mb-2">🥷🏻</div>
                          <div className="text-xs text-gray-400">{t.inst_c2_visual_1}</div>
                        </div>
                        <div className="text-gray-500 text-sm">→</div>
                        <div className="text-center">
                          <div className="text-2xl sm:text-3xl mb-1 sm:mb-2">🌐</div>
                          <div className="text-xs text-gray-400">{t.inst_c2_visual_2}</div>
                        </div>
                        <div className="text-gray-500 text-sm">→</div>
                        <div className="text-center">
                          <div className="text-2xl sm:text-3xl mb-1 sm:mb-2">🎉</div>
                          <div className="text-xs text-gray-400">{t.inst_c2_visual_3}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              </div>
            </div>
          </div>
          
          {/* Footer - Fixed height */}
          <div className="p-3 sm:p-4 md:p-6 border-t border-zinc-800 bg-black/30 shrink-0">
            <div className="flex justify-between items-center gap-2 sm:gap-4">
              <button
                onClick={prevStep}
                disabled={currentStep === 1}
                className={`px-4 py-2 sm:px-6 sm:py-3 rounded-lg font-medium transition-all text-sm sm:text-base ${
                  currentStep === 1
                    ? 'opacity-50 cursor-not-allowed bg-zinc-800 text-gray-500'
                    : 'bg-zinc-800 hover:bg-zinc-700 text-white'
                }`}
              >
                ← {t.inst_salir}
              </button>
              
              <div className="text-center">
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-white text-xs sm:text-sm underline"
                >
                  {t.inst_saltar}
                </button>
              </div>
              
              <button
                onClick={nextStep}
                className="px-4 py-2 sm:px-6 sm:py-3 rounded-lg font-medium bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-500 hover:to-emerald-400 text-black transition-all text-sm sm:text-base"
              >
                {currentStep === totalSteps ? t.inst_empezar : t.inst_siguiente+' →'}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}