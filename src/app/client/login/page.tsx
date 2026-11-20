import SignIn from "@/components/portal/SignIn";

export const dynamic = "force-dynamic";

export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  return <SignIn lang="en" searchParams={await searchParams} />;
}
