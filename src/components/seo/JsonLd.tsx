import { siteConfig } from "@/lib/site";

type JsonLdProps = {
  locale: "en" | "fr";
  description: string;
  faqItems?: Array<{ question: string; answer: string }>;
};

export function JsonLd({ locale, description, faqItems = [] }: JsonLdProps) {
  const pageUrl = locale === "fr" ? `${siteConfig.url}/fr` : siteConfig.url;
  const logoUrl = `${siteConfig.url}/icon`;

  const graph: Record<string, unknown>[] = [
    {
      "@type": ["Organization", "ProfessionalService", "LocalBusiness"],
      "@id": `${siteConfig.url}/#organization`,
      name: siteConfig.name,
      url: siteConfig.url,
      email: siteConfig.email,
      logo: logoUrl,
      image: logoUrl,
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
      "@id": `${pageUrl}/#website`,
      url: pageUrl,
      name: siteConfig.name,
      inLanguage: locale === "fr" ? "fr-CA" : "en-CA",
      publisher: { "@id": `${siteConfig.url}/#organization` },
    },
  ];

  if (faqItems.length) {
    graph.push({
      "@type": "FAQPage",
      "@id": `${pageUrl}/#faq`,
      inLanguage: locale === "fr" ? "fr-CA" : "en-CA",
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
