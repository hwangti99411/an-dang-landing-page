import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { Locale } from '@/types';

interface LanguageContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: <T extends { vi: string; en: string }>(value: T) => string;
}

const defaultValue: LanguageContextValue = {
  locale: 'vi',
  setLocale: () => {},
  t: <T extends { vi: string; en: string }>(value: T) => value.vi,
};

const LanguageContext = createContext<LanguageContextValue>(defaultValue);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('vi');

  useEffect(() => {
    const stored = window.localStorage.getItem('an-dang-locale');
    if (stored === 'en' || stored === 'vi') {
      setLocaleState(stored);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem('an-dang-locale', locale);
    document.documentElement.lang = locale;
  }, [locale]);

  const value = useMemo<LanguageContextValue>(
    () => ({
      locale,
      setLocale: setLocaleState,
      t: <T extends { vi: string; en: string }>(value: T) => value[locale],
    }),
    [locale],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  return useContext(LanguageContext);
}
