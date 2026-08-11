import type { Metadata } from "next";
import { headers } from "next/headers";
import { Fraunces, Outfit } from "next/font/google";
import { LocaleProvider } from "@/components/i18n/LocaleProvider";
import { PageLoader } from "@/components/layout/PageLoader";
import { ScrollToTop } from "@/components/layout/ScrollToTop";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SkipLink } from "@/components/layout/SkipLink";
import { SectionCursor } from "@/components/ui/SectionCursor";
import { getDictionary, type Locale } from "@/content";
import { siteConfig } from "@/lib/site";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["600", "700"],
  display: "swap",
  adjustFontFallback: true,
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
  adjustFontFallback: true,
});

const { seo } = getDictionary("en");

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: seo.title,
    template: "%s · Standout Studio",
  },
  description: seo.description,
  keywords: [...seo.keywords],
  applicationName: siteConfig.name,
  authors: [{ name: siteConfig.name }],
  creator: siteConfig.name,
  publisher: siteConfig.name,
  alternates: {
    canonical: siteConfig.url,
    languages: {
      en: siteConfig.url,
      fr: `${siteConfig.url}/fr`,
      "x-default": siteConfig.url,
    },
  },
  openGraph: {
    type: "website",
    locale: seo.ogLocale,
    alternateLocale: ["fr_CA"],
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: seo.title,
    description: seo.description,
  },
  twitter: {
    card: "summary_large_image",
    title: seo.title,
    description: seo.description,
  },
  robots: {
    index: true,
    follow: true,
  },
  category: "Web design",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const headerList = await headers();
  const lang: Locale = headerList.get("x-locale") === "fr" ? "fr" : "en";

  return (
    <html
      lang={lang}
      suppressHydrationWarning
      className={`${fraunces.variable} ${outfit.variable} h-full antialiased`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html:
              "if('scrollRestoration'in history)history.scrollRestoration='manual';try{var l=location.pathname.indexOf('/fr')===0?'fr':'en';document.documentElement.lang=l;document.documentElement.classList.add('is-booting');}catch(e){}",
          }}
        />
      </head>
      <body className="flex min-h-full flex-col bg-page text-ink">
        <LocaleProvider initialLocale={lang}>
          <SkipLink />
          <PageLoader />
          <ScrollToTop />
          <SectionCursor />
          <SiteHeader />
          <main id="main" className="flex-1">
            {children}
          </main>
          <SiteFooter />
        </LocaleProvider>
      </body>
    </html>
  );
}
