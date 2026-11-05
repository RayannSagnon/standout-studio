import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/seo/JsonLd";
import { HOME_SEO, isKnownPath, metadataFor, sitePaths } from "@/lib/seo";

export const dynamicParams = false;

export function generateStaticParams() {
  return sitePaths().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/fr/[[...slug]]">): Promise<Metadata> {
  const { slug = [] } = await params;
  return metadataFor("fr", slug);
}

export default async function FrenchPage({ params }: PageProps<"/fr/[[...slug]]">) {
  const { slug = [] } = await params;
  if (!isKnownPath(slug)) notFound();
  return slug.length === 0 ? <JsonLd locale="fr" description={HOME_SEO.fr.description} /> : null;
}
