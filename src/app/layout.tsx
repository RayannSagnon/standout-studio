import type { Metadata } from "next";
import { Fraunces, Outfit } from "next/font/google";
import { LocaleProvider } from "@/components/i18n/LocaleProvider";
import { PageLoader } from "@/components/layout/PageLoader";
import { ScrollToTop } from "@/components/layout/ScrollToTop";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SkipLink } from "@/components/layout/SkipLink";
import { SectionCursor } from "@/components/ui/SectionCursor";
import { getDictionary } from "@/content";
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

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${fraunces.variable} ${outfit.variable} h-full antialiased`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html:
              "if('scrollRestoration'in history)history.scrollRestoration='manual';try{var p=location.pathname;var l=p.indexOf('/fr')===0?'fr':(localStorage.getItem('standout-locale')||'en');if(l==='fr'||l==='en')document.documentElement.lang=l;if(sessionStorage.getItem('standout-loader-seen-v3')!=='1')document.documentElement.classList.add('is-booting');}catch(e){}",
          }}
        />
      </head>
      <body className="flex min-h-full flex-col bg-page text-ink">
        <LocaleProvider>
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
