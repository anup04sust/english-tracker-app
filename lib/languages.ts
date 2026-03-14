export interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  enabled: boolean;
}

export const SUPPORTED_LANGUAGES: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧', enabled: true },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸', enabled: true },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪', enabled: true },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺', enabled: true },
  { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳', enabled: true },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵', enabled: true },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷', enabled: true },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹', enabled: true },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇧🇷', enabled: true },
  { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷', enabled: true },
];

export function getLanguage(code: string): Language | undefined {
  return SUPPORTED_LANGUAGES.find(lang => lang.code === code);
}

export function getLanguageName(code: string): string {
  const lang = getLanguage(code);
  return lang ? lang.name : code;
}
