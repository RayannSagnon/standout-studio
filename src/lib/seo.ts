import type { Metadata } from "next";
import { PROJECTS } from "@/site/projects";
import { siteConfig } from "@/lib/site";

export type Lang = "en" | "fr";

type Copy = { title: string; description: string };

const HOME: Record<Lang, Copy> = {
  en: {
    title: "Standout Studio · Web studio in Ottawa",
    description:
      "Bilingual web studio in Ottawa. Custom websites for independents and small businesses that refuse to blend in. Clear packages from $399.",
  },
  fr: {
    title: "Standout Studio · Studio web à Ottawa",
    description:
      "Studio web bilingue à Ottawa. Des sites sur mesure pour les indépendants et les petites entreprises qui refusent de se fondre dans le décor. Forfaits clairs dès 399 $.",
  },
};

const PAGES: Record<string, Record<Lang, Copy>> = {
  work: {
    en: { title: "Work", description: "Four live sites, four personalities. Open them, click around, judge for yourself." },
    fr: { title: "Réalisations", description: "Quatre sites en ligne, quatre personnalités. Ouvrez-les, cliquez partout, jugez par vous-même." },
  },
  services: {
    en: { title: "Services and pricing", description: "Positioning, identity, design and development, plus clear packages: Essential $399, Growth $999, Signature $1,299." },
    fr: { title: "Services et forfaits", description: "Positionnement, identité, design et développement, avec des forfaits clairs : Essentiel 399 $, Croissance 999 $, Signature 1 299 $." },
  },
  about: {
    en: { title: "About", description: "A small bilingual studio in Ottawa. We work one-on-one with independents and small businesses." },
    fr: { title: "À propos", description: "Un petit studio bilingue à Ottawa. On travaille en tête-à-tête avec des indépendants et des petites entreprises." },
  },
  contact: {
    en: { title: "Contact", description: "One short message is enough. We reply within 1 to 2 business days with a suggested package, a timeline and a price range." },
    fr: { title: "Contact", description: "Un court message suffit. On répond en 1 à 2 jours ouvrables avec un forfait suggéré, un échéancier et une fourchette de prix." },
  },
  card: {
    en: { title: "Digital business card", description: "Your business card fits in a phone: a scan to add you, Apple Wallet and Google Wallet included." },
    fr: { title: "Carte de visite numérique", description: "Votre carte de visite tient dans un téléphone : un scan pour vous ajouter, Apple Wallet et Google Wallet inclus." },
  },
  login: {
    en: { title: "Client area", description: "Follow your site's progress, leave feedback and manage your hosting and digital card." },
    fr: { title: "Espace client", description: "Suivez l'avancement de votre site, donnez vos commentaires, gérez votre hébergement et votre carte numérique." },
  },
  account: {
    en: { title: "Client area", description: "Your Standout Studio client area." },
    fr: { title: "Espace client", description: "Votre espace client Standout Studio." },
  },
};

const PRIVATE = new Set(["login", "account"]);

/** Every path (without language prefix) the site serves. */
export function sitePaths(): string[][] {
  return [
    [],
    ...Object.keys(PAGES).map((p) => [p]),
    ...PROJECTS.map((p) => ["work", p.slug]),
  ];
}

export function isKnownPath(slug: string[] = []): boolean {
  return sitePaths().some((p) => p.join("/") === slug.join("/"));
}

const urlFor = (lang: Lang, slug: string[]) => {
  const rest = slug.length ? `/${slug.join("/")}` : "";
  return lang === "fr" ? `${siteConfig.url}/fr${rest}` : `${siteConfig.url}${rest || "/"}`;
};

export function metadataFor(lang: Lang, slug: string[] = []): Metadata {
  const key = slug[0];
  let copy: Copy = HOME[lang];
  let title: Metadata["title"] = { absolute: HOME[lang].title };

  if (key === "work" && slug[1]) {
    const project = PROJECTS.find((p) => p.slug === slug[1]);
    if (project) {
      copy = { title: project.name, description: project.headline[lang] };
      title = project.name;
    }
  } else if (key && PAGES[key]) {
    copy = PAGES[key][lang];
    title = copy.title;
  }

  const en = urlFor("en", slug);
  const fr = urlFor("fr", slug);
  const url = lang === "fr" ? fr : en;

  return {
    title,
    description: copy.description,
    alternates: { canonical: url, languages: { en, fr, "x-default": en } },
    openGraph: {
      type: "website",
      locale: lang === "fr" ? "fr_CA" : "en_CA",
      alternateLocale: [lang === "fr" ? "en_CA" : "fr_CA"],
      url,
      siteName: siteConfig.name,
      title: typeof title === "string" ? `${title} · Standout Studio` : copy.title,
      description: copy.description,
    },
    twitter: { card: "summary_large_image", title: copy.title, description: copy.description },
    robots: PRIVATE.has(key ?? "") ? { index: false, follow: true } : undefined,
  };
}

export { HOME as HOME_SEO, PRIVATE as PRIVATE_PAGES };
