import Footer from './Footer';
import StepTitle from './StepTitle';
import { useLang } from '../i18n';
import { href } from '../router';

export default function About() {
  const { c } = useLang();
  const k = c.about;
  return (
    <>
      <section className="about" data-tone="light">
        <StepTitle lines={k.title} className="about-title" trail={60} />
        <p className="about-lead" data-reveal="focus">
          {k.lead}
        </p>
      </section>

      <section className="about-why" data-tone="dark">
        <h2 className="about-label" data-reveal="wipe">
          {k.whyTitle}
        </h2>
        <p className="about-why-text" data-reveal="focus">
          {k.why}
        </p>
      </section>

      <section className="about-block" data-tone="light">
        <h2 className="about-label" data-reveal="wipe">
          {k.believeTitle}
        </h2>
        <ul className="principles">
          {c.home.principles.map(([t, d], i) => (
            <li key={t} data-reveal="rule" style={{ '--i': i }}>
              <h3 className="service-title">{t}</h3>
              <p>{d}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="about-block" data-tone="light">
        <h2 className="about-label" data-reveal="wipe">
          {k.refuseTitle}
        </h2>
        <ul className="refuse">
          {k.refuse.map((t, i) => (
            <li key={t} data-reveal="strike" style={{ '--i': i }}>
              <span>{t}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="about-block" data-tone="light">
        <h2 className="about-label" data-reveal="wipe">
          {k.howTitle}
        </h2>
        <ul className="how">
          {k.how.map(([t, d], i) => (
            <li key={t} data-reveal="rule" style={{ '--i': i }}>
              <h3 className="service-title">{t}</h3>
              <p>{d}</p>
            </li>
          ))}
        </ul>
      </section>

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
