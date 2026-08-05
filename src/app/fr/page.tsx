import type { Metadata } from "next";
import { HomePage } from "@/components/home/HomePage";
import { JsonLd } from "@/components/seo/JsonLd";
import { getDictionary } from "@/content";
import { siteConfig } from "@/lib/site";

const { seo, faq } = getDictionary("fr");

export const metadata: Metadata = {
  title: seo.title,
  description: seo.description,
  keywords: [...seo.keywords],
  alternates: {
    canonical: `${siteConfig.url}/fr`,
    languages: {
      en: siteConfig.url,
      fr: `${siteConfig.url}/fr`,
      "x-default": siteConfig.url,
    },
  },
  openGraph: {
    type: "website",
    locale: seo.ogLocale,
    alternateLocale: ["en_CA"],
    url: `${siteConfig.url}/fr`,
    siteName: siteConfig.name,
    title: seo.title,
    description: seo.description,
  },
  twitter: {
    card: "summary_large_image",
    title: seo.title,
    description: seo.description,
  },
};

export default function FrenchHomePage() {
  return (
    <>
      <JsonLd
        locale="fr"
        description={seo.description}
        faqItems={faq.items.map((item) => ({
          question: item.question,
          answer: item.answer,
        }))}
      />
      <HomePage />
    </>
  );
}
