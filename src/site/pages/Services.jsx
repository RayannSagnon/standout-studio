import Footer from './Footer';
import { useLang } from '../i18n';
import { href } from '../router';
import ProcessLine from './ProcessLine';
import DotEnd from './DotEnd';

// STAND is the structure, OUT is the expression. The OUT column literally drops out of line.
export default function Services() {
  const { c } = useLang();
  const k = c.servicesPage;
  return (
    <>
      <section className="svc" data-tone="light">
        <h1 className="svc-intro" data-reveal="wipe" tabIndex={-1}>
          {k.intro}
        </h1>
        <div className="svc-cols">
          <div className="svc-col svc-stand">
            <h2 className="svc-word" data-reveal="wipe">
              Stand
            </h2>
            <p className="svc-lead" data-reveal="focus">
              {k.stand.lead}
            </p>
            <ul className="svc-list">
              {k.stand.items.map(([t, d], i) => (
                <li key={t} data-reveal="rule" style={{ '--i': i }}>
                  <h3 className="service-title">{t}</h3>
                  <p>{d}</p>
                </li>
              ))}
            </ul>
          </div>
          <div className="svc-col svc-out">
            <h2 className="svc-word" data-reveal="wipe">
              <DotEnd text="out" />
            </h2>
            <p className="svc-lead" data-reveal="focus">
              {k.out.lead}
            </p>
            <ul className="svc-list">
              {k.out.items.map(([t, d], i) => (
                <li key={t} data-reveal="rule" style={{ '--i': i + 1 }}>
                  <h3 className="service-title">{t}</h3>
                  <p>{d}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="plans" data-tone="light" aria-labelledby="plans-title">
        <div className="plans-head">
          <h2 className="h2" id="plans-title" data-reveal="wipe">
            {k.packagesTitle}
          </h2>
          <p className="plans-lead" data-reveal="focus">
            {k.packagesLead}
          </p>
        </div>
        <ol className="plans-list">
          {k.plans.map((p, i) => (
            <li key={p.id} className="plan" data-featured={p.featured ? 'true' : undefined} data-reveal="rule" style={{ '--i': i }}>
              <div className="plan-top">
                <h3 className="plan-name">{p.name}</h3>
                {p.featured && <span className="plan-badge">{k.popular}</span>}
              </div>
              <p className="plan-price">
                <span className="plan-from">{k.from}</span>
                <span className="plan-amount">{p.price}</span>
              </p>
              <ul className="plan-features">
                {p.features.map(f => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
              <a className={p.featured ? 'btn btn-primary plan-cta' : 'link plan-cta'} href={href('contact')}>
                <span>{k.planCta}</span>
              </a>
            </li>
          ))}
        </ol>
        <p className="plans-note muted" data-reveal="focus">
          {k.careNote}
        </p>
      </section>

      <section className="svc-after" data-tone="light">
        <h2 className="h2" data-reveal="wipe">
          {k.afterTitle}
        </h2>
        <ul className="svc-after-list">
          {k.after.map(([t, d], i) => (
            <li key={t} data-reveal="rule" style={{ '--i': i }}>
              <h3 className="service-title">{t}</h3>
              <p>{d}</p>
            </li>
          ))}
        </ul>
        <p className="svc-card-link" data-reveal="focus">
          <a className="link" href={href('card')}>
            {c.nav.card}
          </a>
        </p>
      </section>

      <ProcessLine />

      <section className="page-end" data-tone="dark">
        <a className="page-end-link" href={href('contact')}>
          <span>{c.home.start}</span>
          <span className="brand-dot" aria-hidden="true" />
        </a>
      </section>
      <Footer />
    </>
  );
}
