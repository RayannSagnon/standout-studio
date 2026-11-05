import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import { Archivo } from "next/font/google";
import SiteRoot from "@/site/SiteRoot";
import { HOME_SEO } from "@/lib/seo";
import { siteConfig } from "@/lib/site";
import "./globals.css";

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  axes: ["wdth"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: HOME_SEO.en.title,
    template: "%s · Standout Studio",
  },
  description: HOME_SEO.en.description,
  applicationName: siteConfig.name,
  authors: [{ name: siteConfig.name }],
  creator: siteConfig.name,
  publisher: siteConfig.name,
  robots: { index: true, follow: true },
  verification: {
    google: [
      "LwQq3RKaXAXeUxVuAzyYZ7aGuBxTfM8aaWgZTRu5H6k",
      "OdO8BdzixEcyAfQLSNj9em2Iu1GFT3S0GjBu8oEIyxo",
    ],
  },
  category: "Web design",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f3f5f4" },
    { media: "(prefers-color-scheme: dark)", color: "#102c2a" },
  ],
};

// Hidden start states for animations only exist under html.motion-ok, so nothing stays
// hidden when motion is reduced or JavaScript does not run.
const BOOT = `if('scrollRestoration'in history)history.scrollRestoration='manual';try{if(!matchMedia('(prefers-reduced-motion: reduce)').matches)document.documentElement.classList.add('motion-ok');document.documentElement.classList.add('js');}catch(e){}`;

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const lang = (await headers()).get("x-locale") === "fr" ? "fr" : "en";

  return (
    <html lang={lang} suppressHydrationWarning className={archivo.variable}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: BOOT }} />
      </head>
      <body>
        <SiteRoot />
        {children}
      </body>
    </html>
  );
}
