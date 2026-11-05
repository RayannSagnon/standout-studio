import type { MetadataRoute } from "next";
import { PRIVATE_PAGES, sitePaths } from "@/lib/seo";
import { siteConfig } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return sitePaths()
    .filter((slug) => !PRIVATE_PAGES.has(slug[0] ?? ""))
    .flatMap((slug) => {
      const rest = slug.length ? `/${slug.join("/")}` : "";
      const en = `${siteConfig.url}${rest || ""}` || siteConfig.url;
      const fr = `${siteConfig.url}/fr${rest}`;
      const alternates = { languages: { en, fr, "x-default": en } };
      const priority = slug.length === 0 ? 1 : slug.length === 1 ? 0.8 : 0.6;
      return [
        { url: en, lastModified: now, changeFrequency: "monthly" as const, priority, alternates },
        { url: fr, lastModified: now, changeFrequency: "monthly" as const, priority: priority - 0.1, alternates },
      ];
    });
}
