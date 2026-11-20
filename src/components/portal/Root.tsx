// Wrapper of every client and admin page: applies the chosen theme.

import type { ReactNode } from "react";
import { themeAction } from "@/app/client/actions";
import { getTheme, themeAttr, type Theme } from "@/lib/portal/theme";

export default async function Root({ lang, children }: { lang?: string; children: ReactNode }) {
  const theme = await getTheme();
  return (
    <div className="pt" lang={lang} data-theme={themeAttr(theme)}>
      {children}
    </div>
  );
}

const LABELS: Record<string, Record<Theme, string>> = {
  fr: { light: "Clair", dark: "Sombre", auto: "Auto" },
  en: { light: "Light", dark: "Dark", auto: "Auto" },
};

/** Clair · Sombre · Auto, in the top bar. */
export async function ThemeSwitch({ lang = "fr" }: { lang?: string }) {
  const theme = await getTheme();
  const l = LABELS[lang === "en" ? "en" : "fr"];
  return (
    <form action={themeAction} className="pt-theme" aria-label={lang === "en" ? "Display" : "Affichage"}>
      {(["light", "dark", "auto"] as Theme[]).map((t) => (
        <button key={t} name="theme" value={t} className="pt-textbtn" aria-pressed={theme === t}>
          {l[t]}
        </button>
      ))}
    </form>
  );
}
