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

function writeCookie(locale: Locale) {
  document.cookie = `${STORAGE}=${locale}; path=/; max-age=31536000; samesite=lax`;
}

export function LocaleProvider({ children, initialLocale = "en" }: { children: React.ReactNode; initialLocale?: Locale }) {
  // The server already picked the language (cookie, then Accept-Language), so
  // the first paint is right. localStorage is only consulted for people who
  // chose a language before the cookie existed; it then becomes the cookie.
  const [locale, setLocaleState] = useState<Locale>(initialLocale);
  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE);
    const hasCookie = document.cookie.split(";").some((part) => part.trim().startsWith(`${STORAGE}=`));
    const hl = new URLSearchParams(window.location.search).get("hl");
    if (hl === "en" || hl === "es") {
      setLocaleState(hl);
      window.localStorage.setItem(STORAGE, hl);
      writeCookie(hl);
      return;
    }
    if (!hasCookie && (saved === "en" || saved === "es")) {
      setLocaleState(saved);
      writeCookie(saved);
    }
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
        writeCookie(next);
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
