'use client';

import { SUPPORTED_LANGUAGES, Language } from '@/lib/languages';
import { useState } from 'react';

interface LanguageSelectorProps {
  selectedLanguage: string;
  onLanguageChange: (languageCode: string) => void;
}

export default function LanguageSelector({ selectedLanguage, onLanguageChange }: LanguageSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  const currentLang = SUPPORTED_LANGUAGES.find(lang => lang.code === selectedLanguage) || SUPPORTED_LANGUAGES[0];

  return (
    <div className="relative">
      <button
        className="btn flex items-center gap-2 px-4 py-2.5"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-2xl">{currentLang.flag}</span>
        <span className="text-white">{currentLang.name}</span>
        <span className="text-xs text-gray-400">▼</span>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute top-full right-0 mt-2 bg-slate-800 border border-slate-700 rounded-lg p-2 min-w-[220px] max-h-[400px] overflow-y-auto z-50 shadow-xl">
            <div className="px-3 py-2 mb-2 border-b border-slate-700">
              <strong className="text-sm text-white">Choose Language</strong>
            </div>
            
            {SUPPORTED_LANGUAGES.filter(lang => lang.enabled).map(lang => (
              <button
                key={lang.code}
                onClick={() => {
                  onLanguageChange(lang.code);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                  lang.code === selectedLanguage 
                    ? 'bg-blue-500/15 text-white' 
                    : 'text-gray-300 hover:bg-slate-700'
                }`}
              >
                <span className="text-3xl">{lang.flag}</span>
                <div className="flex-1">
                  <div className="font-semibold text-white">{lang.name}</div>
                  <div className="text-xs text-gray-400">{lang.nativeName}</div>
                </div>
                {lang.code === selectedLanguage && (
                  <span className="text-green-400 text-lg">✓</span>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
