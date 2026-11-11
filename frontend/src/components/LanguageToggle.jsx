import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Globe, Sparkles } from 'lucide-react';

const LanguageToggle = ({ className = '' }) => {
  const [currentLang, setCurrentLang] = useState(() => {
    if (typeof document !== 'undefined') {
      return document.cookie.includes('googtrans=/en/mr') ? 'mr' : 'en';
    }
    return 'en';
  });

  const toggleLanguage = () => {
    const targetLang = currentLang === 'en' ? 'mr' : 'en';
    if (targetLang === 'en') {
      document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
    } else {
      document.cookie = `googtrans=/en/mr; path=/;`;
      document.cookie = `googtrans=/en/mr; path=/; domain=${window.location.hostname};`;
    }
    setCurrentLang(targetLang);
    window.location.reload();
  };

  const isMarathi = currentLang === 'mr';

  return (
    <button
      onClick={toggleLanguage}
      type="button"
      role="switch"
      aria-checked={isMarathi}
      aria-label="Switch language between Marathi and English"
      title={isMarathi ? "Switch to English / इंग्रजी निवडा" : "मराठीत बदला / Switch to Marathi"}
      className={`notranslate group relative inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-earth-100/95 via-white/80 to-earth-100/95 hover:from-amber-100/80 hover:to-emerald-100/80 border border-earth-300/70 hover:border-primary/50 shadow-xs hover:shadow-md transition-all duration-300 select-none cursor-pointer active:scale-95 ${className}`}
      translate="no"
    >
      {/* Animated Globe Icon */}
      <div className="relative flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-300">
        <Globe className={`w-4 h-4 transition-colors duration-300 ${isMarathi ? 'text-amber-700' : 'text-emerald-700'}`} />
        <Sparkles className="w-2.5 h-2.5 text-amber-500 absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Marathi Label */}
      <span
        className={`notranslate text-xs font-bold transition-all duration-300 flex items-center gap-1 ${
          isMarathi
            ? 'text-amber-900 font-extrabold scale-105'
            : 'text-earth-600 group-hover:text-earth-900'
        }`}
        translate="no"
      >
        मराठी
        {isMarathi && (
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping inline-block" />
        )}
      </span>

      {/* Custom Switch Track */}
      <div
        className={`notranslate relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full p-0.5 transition-colors duration-300 ease-in-out shadow-inner ${
          isMarathi
            ? 'bg-gradient-to-r from-amber-500 to-orange-500 ring-2 ring-amber-400/30'
            : 'bg-gradient-to-r from-emerald-600 to-teal-500 ring-2 ring-emerald-500/30'
        }`}
        translate="no"
      >
        {/* Animated Sliding Thumb / Knob */}
        <motion.span
          layout
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className={`pointer-events-none flex items-center justify-center h-5 w-5 rounded-full shadow-md text-[10px] font-black transition-all duration-300 transform ${
            isMarathi
              ? 'translate-x-0 bg-gradient-to-br from-amber-50 to-amber-100 text-amber-900 ring-1 ring-amber-300'
              : 'translate-x-5 bg-gradient-to-br from-emerald-50 to-teal-100 text-emerald-900 ring-1 ring-teal-300'
          }`}
        >
          {isMarathi ? 'म' : 'EN'}
        </motion.span>
      </div>

      {/* English Label */}
      <span
        className={`notranslate text-xs font-bold transition-all duration-300 flex items-center gap-1 ${
          !isMarathi
            ? 'text-emerald-900 font-extrabold scale-105'
            : 'text-earth-600 group-hover:text-earth-900'
        }`}
        translate="no"
      >
        English
        {!isMarathi && (
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping inline-block" />
        )}
      </span>
    </button>
  );
};

export default LanguageToggle;
