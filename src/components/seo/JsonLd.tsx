import { siteConfig } from "@/lib/site";

type JsonLdProps = {
  locale: "en" | "fr";
  description: string;
  faqItems?: Array<{ question: string; answer: string }>;
};

export function JsonLd({ locale, description, faqItems = [] }: JsonLdProps) {
  const graph: Record<string, unknown>[] = [
    {
      "@type": ["Organization", "ProfessionalService", "LocalBusiness"],
      "@id": `${siteConfig.url}/#organization`,
      name: siteConfig.name,
      url: siteConfig.url,
      email: siteConfig.email,
      description,
      areaServed: {
        "@type": "City",
        name: siteConfig.geo.locality,
        containedInPlace: {
          "@type": "AdministrativeArea",
          name: "Ontario",
        },
      },
      address: {
        "@type": "PostalAddress",
        addressLocality: siteConfig.geo.locality,
        addressRegion: siteConfig.geo.region,
        addressCountry: siteConfig.geo.country,
      },
      geo: {
        "@type": "GeoCoordinates",
        latitude: siteConfig.geo.latitude,
        longitude: siteConfig.geo.longitude,
      },
      knowsLanguage: ["en", "fr"],
      priceRange: "$$",
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "sales",
        email: siteConfig.email,
        availableLanguage: ["English", "French"],
      },
    },
    {
      "@type": "WebSite",
      "@id": `${siteConfig.url}/#website`,
      url: locale === "fr" ? `${siteConfig.url}/fr` : siteConfig.url,
      name: siteConfig.name,
      inLanguage: locale === "fr" ? "fr-CA" : "en-CA",
      publisher: { "@id": `${siteConfig.url}/#organization` },
    },
  ];

  if (faqItems.length) {
    graph.push({
      "@type": "FAQPage",
      "@id": `${siteConfig.url}/#faq`,
      mainEntity: faqItems.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.answer,
        },
      })),
    });
  }

  const payload = {
    "@context": "https://schema.org",
    "@graph": graph,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(payload) }}
    />
  );
}
