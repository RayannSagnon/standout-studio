"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import {
  getDictionary,
  type Dictionary,
  type Locale,
} from "@/content";

const STORAGE_KEY = "standout-locale";

type LocaleContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Dictionary;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

type LocaleProviderProps = {
  children: ReactNode;
  initialLocale?: Locale;
};

export function LocaleProvider({
  children,
  initialLocale,
}: LocaleProviderProps) {
  const pathname = usePathname();
  const pathLocale: Locale | null = pathname?.startsWith("/fr")
    ? "fr"
    : pathname === "/"
      ? "en"
      : null;

  const [chosenLocale, setLocaleState] = useState<Locale>(
    () => initialLocale ?? pathLocale ?? "en",
  );
  // The URL wins; other routes (404) keep the server-provided locale.
  const locale = pathLocale ?? chosenLocale;

  useEffect(() => {
    document.documentElement.lang = locale;
    if (pathLocale) window.localStorage.setItem(STORAGE_KEY, pathLocale);
  }, [locale, pathLocale]);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    window.localStorage.setItem(STORAGE_KEY, next);
    document.documentElement.lang = next;
  }, []);

  const value = useMemo<LocaleContextValue>(
    () => ({
      locale,
      setLocale,
      t: getDictionary(locale),
    }),
    [locale, setLocale],
  );

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    throw new Error("useLocale must be used within LocaleProvider");
  }
  return ctx;
}

export function useContent() {
  return useLocale().t;
}
