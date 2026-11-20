import { createClientAction } from "@/app/admin/actions";
import AdminShell, { adminPage } from "@/components/portal/AdminShell";
import { Primary, Title } from "@/components/portal/ui";

export const dynamic = "force-dynamic";

export default async function NewClient({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { mode } = await adminPage();
  return (
    <AdminShell mode={mode} current="new" search={await searchParams}>
      <div className="pt-head">
        <Title>Nouveau client</Title>
        <p className="pt-sub">Pour un client qui n&apos;est pas passé par le formulaire du site. Ceux du formulaire arrivent tout seuls en prospects.</p>
      </div>
      <section className="pt-card" style={{ maxWidth: 720 }}>
        <form action={createClientAction} className="pt-form">
          <div className="pt-fields">
            <label className="pt-field">
              <span>Nom</span>
              <input className="pt-input" name="name" required maxLength={120} />
            </label>
            <label className="pt-field">
              <span>Entreprise (facultatif)</span>
              <input className="pt-input" name="company" maxLength={120} />
            </label>
            <label className="pt-field">
              <span>Email</span>
              <input className="pt-input" name="email" type="email" required />
            </label>
            <label className="pt-field">
              <span>Téléphone (facultatif)</span>
              <input className="pt-input" name="phone" maxLength={40} />
            </label>
            <label className="pt-field">
              <span>Langue des emails</span>
              <select className="pt-input" name="lang" defaultValue="fr">
                <option value="fr">Français</option>
                <option value="en">Anglais</option>
              </select>
            </label>
          </div>
          <p className="pt-small pt-muted">Rien n&apos;est envoyé au client à cette étape. Vous l&apos;inviterez depuis sa fiche.</p>
          <div className="pt-actions">
            <Primary>Créer le client</Primary>
          </div>
        </form>
      </section>
    </AdminShell>
  );
}
