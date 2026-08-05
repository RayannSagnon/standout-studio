import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const en = siteConfig.url;
  const fr = `${siteConfig.url}/fr`;

  return [
    {
      url: en,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 1,
      alternates: { languages: { en, fr, "x-default": en } },
    },
    {
      url: fr,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.9,
      alternates: { languages: { en, fr, "x-default": en } },
    },
  ];
}
