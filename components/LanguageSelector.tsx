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
    <div style={{ position: 'relative' }}>
      <button
        className="btn"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '10px 16px',
        }}
      >
        <span style={{ fontSize: 24 }}>{currentLang.flag}</span>
        <span>{currentLang.name}</span>
        <span style={{ fontSize: 12 }}>▼</span>
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            marginTop: 8,
            background: 'rgba(17,24,39,0.98)',
            border: '1px solid var(--border)',
            borderRadius: 12,
            padding: 8,
            minWidth: 220,
            maxHeight: '400px',
            overflowY: 'auto',
            zIndex: 1000,
            boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
          }}
        >
          <div style={{ 
            padding: '8px 12px',
            marginBottom: 8,
            borderBottom: '1px solid var(--border)'
          }}>
            <strong style={{ fontSize: 14 }}>Choose Language</strong>
          </div>
          
          {SUPPORTED_LANGUAGES.filter(lang => lang.enabled).map(lang => (
            <button
              key={lang.code}
              onClick={() => {
                onLanguageChange(lang.code);
                setIsOpen(false);
              }}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '10px 12px',
                background: lang.code === selectedLanguage ? 'rgba(56,189,248,0.15)' : 'transparent',
                border: 'none',
                borderRadius: 8,
                color: 'var(--text)',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'background 0.2s',
              }}
              onMouseEnter={(e) => {
                if (lang.code !== selectedLanguage) {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                }
              }}
              onMouseLeave={(e) => {
                if (lang.code !== selectedLanguage) {
                  e.currentTarget.style.background = 'transparent';
                }
              }}
            >
              <span style={{ fontSize: 28 }}>{lang.flag}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600 }}>{lang.name}</div>
                <div style={{ fontSize: 12, color: 'var(--muted)' }}>{lang.nativeName}</div>
              </div>
              {lang.code === selectedLanguage && (
                <span style={{ color: '#22c55e' }}>✓</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
