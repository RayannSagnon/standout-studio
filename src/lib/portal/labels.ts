// Labels shared by the client area, the admin area and the emails.

import type { InvoiceStatus, Lang, PackageId, Stage, SubscriptionStatus, VersionStatus } from "./types.ts";

export const STAGE_LABEL: Record<Lang, Record<Stage, string>> = {
  fr: { call: "Appel", brief: "Brief", build: "Création", launch: "Lancement", live: "En ligne" },
  en: { call: "Call", brief: "Brief", build: "Build", launch: "Launch", live: "Live" },
};

export const PACKAGE_LABEL: Record<Lang, Record<PackageId, string>> = {
  fr: { essential: "Essentiel", growth: "Croissance", signature: "Signature" },
  en: { essential: "Essential", growth: "Growth", signature: "Signature" },
};

export const VERSION_LABEL: Record<Lang, Record<VersionStatus, string>> = {
  fr: { pending: "En attente de votre avis", approved: "Approuvée", changes_requested: "Modifications demandées" },
  en: { pending: "Waiting for your feedback", approved: "Approved", changes_requested: "Changes requested" },
};

export const INVOICE_LABEL: Record<Lang, Record<InvoiceStatus, string>> = {
  fr: { draft: "Brouillon", sent: "À payer", paid: "Payée", overdue: "En retard", void: "Annulée" },
  en: { draft: "Draft", sent: "Due", paid: "Paid", overdue: "Overdue", void: "Void" },
};

export const CARE_LABEL: Record<Lang, Record<SubscriptionStatus, string>> = {
  fr: { none: "Pas encore activé", active: "Actif", past_due: "Paiement en échec", canceled: "Arrêté" },
  en: { none: "Not active yet", active: "Active", past_due: "Payment failed", canceled: "Stopped" },
};

/** "il y a 2 h", "hier", "il y a 3 jours"; older than a week falls back to the date. */
export function ago(iso: string, now: Date, lang: Lang = "fr"): string {
  const t = new Date(iso.length === 10 ? `${iso}T12:00:00` : iso).getTime();
  const min = Math.round((now.getTime() - t) / 60_000);
  const days = Math.round((Date.parse(dayOf(now)) - Date.parse(dayOf(new Date(t)))) / 86_400_000);
  const fr = lang === "fr";
  if (min < 2) return fr ? "à l'instant" : "just now";
  if (min < 60) return fr ? `il y a ${min} min` : `${min} min ago`;
  if (days === 0) return fr ? `il y a ${Math.round(min / 60)} h` : `${Math.round(min / 60)} h ago`;
  if (days === 1) return fr ? "hier" : "yesterday";
  if (days < 7) return fr ? `il y a ${days} jours` : `${days} days ago`;
  return fmtDate(iso, lang, true);
}

/** Whole days between a past day and today (0 when today or in the future). */
export const daysSince = (iso: string, now: Date) => Math.max(0, Math.round((Date.parse(dayOf(now)) - Date.parse(iso.slice(0, 10))) / 86_400_000));

/** Calendar day in Ottawa, as YYYY-MM-DD. */
export const dayOf = (d: Date) => d.toLocaleDateString("en-CA", { timeZone: "America/Toronto" });

export function fmtDate(iso: string | null | undefined, lang: Lang, short = false): string {
  if (!iso) return "";
  const d = new Date(iso.length === 10 ? `${iso}T12:00:00` : iso);
  return d.toLocaleDateString(lang === "fr" ? "fr-CA" : "en-CA", { day: "numeric", month: short ? "short" : "long", year: "numeric", timeZone: "America/Toronto" });
}
