import Root from "@/components/portal/Root";
import { Bar, Title } from "@/components/portal/ui";

export default function ClientNotFound() {
  return (
    <Root>
      <Bar area="Standout Studio" home="/" />
      <main className="pt-main">
        <div className="pt-head">
          <Title>Page introuvable / Page not found</Title>
          <p className="pt-sub">
            <a className="link" href="/fr">Retour au site</a> · <a className="link" href="/">Back to the website</a>
          </p>
        </div>
      </main>
    </Root>
  );
}
