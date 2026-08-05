import type { Metadata } from "next";
import { Fraunces, Outfit } from "next/font/google";
import { LocaleProvider } from "@/components/i18n/LocaleProvider";
import { PageLoader } from "@/components/layout/PageLoader";
import { ScrollToTop } from "@/components/layout/ScrollToTop";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SectionCursor } from "@/components/ui/SectionCursor";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Standout Studio",
    template: "%s · Standout Studio",
  },
  description:
    "Clear, fast websites for individuals and small businesses in Ottawa and beyond.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${outfit.variable} h-full antialiased`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html:
              "if('scrollRestoration'in history)history.scrollRestoration='manual';window.scrollTo(0,0);try{var l=localStorage.getItem('standout-locale');if(l==='fr'||l==='en')document.documentElement.lang=l;}catch(e){}",
          }}
        />
      </head>
      <body className="flex min-h-full flex-col bg-page text-ink">
        <LocaleProvider>
          <PageLoader />
          <ScrollToTop />
          <SectionCursor />
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </LocaleProvider>
      </body>
    </html>
  );
}
