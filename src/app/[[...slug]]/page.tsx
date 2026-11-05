import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/seo/JsonLd";
import { HOME_SEO, isKnownPath, metadataFor, sitePaths } from "@/lib/seo";

// The visible page is rendered by the persistent site app in the root layout.
// This route only declares which URLs exist and their metadata.
export const dynamicParams = false;

export function generateStaticParams() {
  return sitePaths().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/[[...slug]]">): Promise<Metadata> {
  const { slug = [] } = await params;
  return metadataFor("en", slug);
}

export default async function EnglishPage({ params }: PageProps<"/[[...slug]]">) {
  const { slug = [] } = await params;
  if (!isKnownPath(slug)) notFound();
  return slug.length === 0 ? <JsonLd locale="en" description={HOME_SEO.en.description} /> : null;
}
