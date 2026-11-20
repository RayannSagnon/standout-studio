// Frame for every admin page: checks the admin session, bar, navigation, messages.

import type { ReactNode } from "react";
import { notFound, redirect } from "next/navigation";
import { signOutAction } from "@/app/client/actions";
import { STAGE_LABEL } from "@/lib/portal/labels";
import { portal } from "@/lib/portal/server";
import type { PortalMode } from "@/lib/portal/config";
import type { Ctx } from "@/lib/portal/service";
import type { PortalEvent, Stage } from "@/lib/portal/types";
import { Bar, Flash } from "./ui";

export async function adminPage(): Promise<{ ctx: Ctx; mode: PortalMode }> {
  const { mode, ctx } = await portal();
  if (mode === "off") notFound();
  if (!ctx.viewer) redirect("/fr/client/login");
  if (ctx.viewer.role !== "admin") redirect("/client");
  return { ctx, mode };
}

const OK: Record<string, string> = {
  client_created: "Client créé.",
  saved: "Enregistré.",
  invited: "Invitation envoyée.",
  project_created: "Projet créé.",
  stage: "Étape changée. Le client a reçu un courriel.",
  version_shared: "Version partagée. Le client a reçu un courriel.",
  invoice_created: "Brouillon créé. Le client ne le voit pas encore.",
  invoice_sent: "Facture envoyée au client.",
  invoice_paid: "Facture marquée payée.",
  invoice_void: "Facture annulée.",
  message: "Message envoyé.",
  reminders: "Relances envoyées.",
  demo_reset: "Démo remise à zéro.",
};

const ERR: Record<string, string> = {
  name: "Le nom est obligatoire (120 caractères au plus).",
  email: "Ce courriel n'est pas valide.",
  email_taken: "Cette adresse est déjà utilisée par un autre client.",
  preview_url: "Le lien de prévisualisation doit commencer par https://.",
  version_pending: "Une version attend déjà la réponse du client. Une seule à la fois.",
  amount: "Montant invalide.",
  tax_rate: "Taux de taxe invalide (entre 0 et 30).",
  label: "Le libellé est obligatoire.",
  invoice_not_draft: "Seule une facture en brouillon peut être envoyée.",
  invoice_paid: "Une facture payée ne peut pas être annulée.",
  invoice_not_payable: "Cette facture ne peut pas être marquée payée.",
  body: "Le message est vide.",
  stage: "Étape inconnue.",
  not_found: "Introuvable.",
  generic: "Ça n'a pas marché. Le détail est dans les journaux Vercel.",
};

export default function AdminShell({
  mode,
  current,
  search,
  children,
}: {
  mode: PortalMode;
  current: "home" | "new" | "emails" | "client";
  search: Record<string, string | string[] | undefined>;
  children: ReactNode;
}) {
  const ok = typeof search.ok === "string" ? search.ok : undefined;
  const error = typeof search.error === "string" ? search.error : undefined;
  const okText = ok === "reminders" ? `Relances envoyées : ${search.n ?? 0} courriel(s).` : ok ? OK[ok] : null;
  return (
    <div className="pt" lang="fr">
      {mode === "demo" && <p className="pt-demo">Démo : les données sont fictives. Les courriels apparaissent dans « Courriels » au lieu de partir.</p>}
      <Bar area="Admin" home="/admin">
        <nav className="pt-nav" aria-label="Admin">
          <a href="/admin" aria-current={current === "home" ? "page" : undefined}>
            Tableau de bord
          </a>
          <a href="/admin/clients/new" aria-current={current === "new" ? "page" : undefined}>
            Nouveau client
          </a>
          {mode === "demo" && (
            <a href="/admin/emails" aria-current={current === "emails" ? "page" : undefined}>
              Courriels
            </a>
          )}
        </nav>
        <form action={signOutAction} className="pt-inline">
          <input type="hidden" name="lang" value="fr" />
          <button className="pt-textbtn">Se déconnecter</button>
        </form>
      </Bar>
      <main className="pt-main" id="main">
        <Flash text={okText} />
        <Flash text={error ? (ERR[error] ?? ERR.generic) : null} tone="error" />
        {children}
      </main>
    </div>
  );
}

/** What each journal event means, for the studio. */
export function adminEventText(e: PortalEvent): string {
  const d = e.data as Record<string, string | number | boolean>;
  const stage = (s: unknown) => STAGE_LABEL.fr[s as Stage] ?? String(s);
  switch (e.type) {
    case "lead.created":
      return d.returning ? "A réécrit via le formulaire du site." : "Nouveau prospect via le formulaire du site.";
    case "client.created":
      return "Client créé dans l'admin.";
    case "client.invited":
      return `Invitation envoyée à ${d.email}.`;
    case "project.created":
      return "Projet ouvert.";
    case "project.stage":
      return `Étape : ${stage(d.stage)}.`;
    case "project.next_action":
      return "Prochaine étape modifiée.";
    case "version.shared":
      return `Version ${d.number} partagée.`;
    case "version.approved":
      return `Version ${d.number} approuvée par le client.`;
    case "version.changes_requested":
      return `Modifications demandées sur la version ${d.number}${d.over_limit ? " (au-delà des révisions incluses)" : ""}.`;
    case "invoice.sent":
      return `Facture ${d.number} envoyée.`;
    case "invoice.paid":
      return `Facture ${d.number} payée (${d.via === "stripe" ? "carte" : d.via === "admin" ? "marquée à la main" : "démo"}).`;
    case "invoice.void":
      return `Facture ${d.number} annulée.`;
    case "invoice.overdue":
      return `Facture ${d.number} en retard.`;
    case "care.active":
      return "Entretien activé.";
    case "care.past_due":
      return "Paiement de l'entretien en échec.";
    case "care.canceled":
      return "Entretien arrêté.";
    case "message.posted":
      return d.by === "client" ? "Message du client." : "Message du studio.";
    case "reminder.feedback":
      return "Relance envoyée : commentaires attendus.";
    case "reminder.invoice":
      return "Relance envoyée : facture en retard.";
    case "email.failed":
      return `Courriel non envoyé : ${d.subject} (${d.error}).`;
    default:
      return e.type;
  }
}
