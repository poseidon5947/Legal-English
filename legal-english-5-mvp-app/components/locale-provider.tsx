"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { type Locale, type MessageKey, translate } from "@/lib/i18n";

const STORAGE = "le5_locale";

type Ctx = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: MessageKey, vars?: Record<string, string | number>) => string;
};

const Context = createContext<Ctx | null>(null);

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");
  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE);
    if (saved === "en" || saved === "es") setLocaleState(saved);
  }, []);
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);
  const value = useMemo<Ctx>(
    () => ({
      locale,
      setLocale: (next) => {
        setLocaleState(next);
        window.localStorage.setItem(STORAGE, next);
      },
      t: (key, vars) => translate(locale, key, vars),
    }),
    [locale]
  );
  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useLocale() {
  const value = useContext(Context);
  if (!value) throw new Error("LocaleProvider missing");
  return value;
}
