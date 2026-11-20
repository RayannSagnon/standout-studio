import ClientArea from "@/components/portal/ClientArea";

export const dynamic = "force-dynamic";

export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  return <ClientArea lang="fr" searchParams={await searchParams} />;
}
