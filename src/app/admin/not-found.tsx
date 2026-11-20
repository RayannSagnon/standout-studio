import { Bar, Title } from "@/components/portal/ui";

export default function AdminNotFound() {
  return (
    <div className="pt" lang="fr">
      <Bar area="Admin" home="/admin" />
      <main className="pt-main">
        <div className="pt-head">
          <Title>Introuvable</Title>
          <p className="pt-sub">
            Ce client ou cette page n&apos;existe pas. <a className="link" href="/admin">Retour au tableau de bord</a>
          </p>
        </div>
      </main>
    </div>
  );
}
