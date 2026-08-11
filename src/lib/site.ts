export const siteConfig = {
  name: "Standout Studio",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://standoutstudio.vercel.app",
  email: "standout.studio.ottawa@gmail.com",
  locales: ["en", "fr"] as const,
  defaultLocale: "en" as const,
  geo: {
    locality: "Ottawa",
    region: "ON",
    country: "CA",
    latitude: 45.4215,
    longitude: -75.6972,
  },
} as const;

export type SiteLocale = (typeof siteConfig.locales)[number];
