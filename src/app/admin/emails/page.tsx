// Demo only: the emails clients and admins would have received.

import { notFound } from "next/navigation";
import AdminShell, { adminPage } from "@/components/portal/AdminShell";
import { Title } from "@/components/portal/ui";
import { demoState } from "@/lib/portal/demo";
import { fmtDate } from "@/lib/portal/labels";

export const dynamic = "force-dynamic";

export default async function DemoEmails({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { mode } = await adminPage();
  if (mode !== "demo") notFound();
  const outbox = demoState().outbox;
  return (
    <AdminShell mode={mode} current="emails" search={await searchParams}>
      <div className="pt-head">
        <Title>Courriels</Title>
        <p className="pt-sub">En démo, rien ne part. Voici ce que chacun aurait reçu, du plus récent au plus ancien.</p>
      </div>
      <div>
        {outbox.length === 0 && <p className="pt-empty">Aucun courriel pour l&apos;instant. Partagez une version ou envoyez une facture pour en voir un.</p>}
        {outbox.map((m) => (
          <details key={m.id} className="pt-more pt-mail">
            <summary>
              <span>
                <b>{m.subject}</b>
                <span className="pt-small pt-muted"> · à {m.to.join(", ")} · {fmtDate(m.created_at, "fr")}</span>
              </span>
            </summary>
            <iframe title={m.subject} srcDoc={m.html} sandbox="" />
          </details>
        ))}
      </div>
    </AdminShell>
  );
}
