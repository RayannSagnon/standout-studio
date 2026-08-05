import * as en from "@/content/en";
import * as fr from "@/content/fr";

export type Locale = "en" | "fr";

export const locales: Locale[] = ["en", "fr"];

export const dictionaries = {
  en,
  fr,
} as const;

export type Dictionary = (typeof dictionaries)[Locale];

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}
