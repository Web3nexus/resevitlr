import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, ChevronDown } from 'lucide-react';

const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
];

export default function LanguageSwitcher({ className = '' }) {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const currentLang = LANGUAGES.find(l => l.code === i18n.language?.slice(0, 2)) || LANGUAGES[0];

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectLanguage = (code) => {
    i18n.changeLanguage(code);
    localStorage.setItem('i18nextLng', code);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-sm font-medium text-slate-300 hover:text-white transition-colors bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700 px-3 py-1.5 rounded-xl"
      >
        <Globe className="w-4 h-4 text-blue-400" />
        <span className="text-xl mb-0.5">{currentLang.flag}</span>
        <span className="uppercase text-[10px] tracking-widest font-bold">{currentLang.code}</span>
        <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          <div className="px-3 py-2 bg-slate-950/50 border-b border-slate-800">
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Select Language</span>
          </div>
          <div className="p-1">
            {LANGUAGES.map(lang => (
              <button
                key={lang.code}
                onClick={() => selectLanguage(lang.code)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-left ${
                  currentLang.code === lang.code 
                    ? 'bg-blue-600/10 text-blue-400 font-bold' 
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <span className="text-2xl">{lang.flag}</span>
                <span className="text-sm font-medium">{lang.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
