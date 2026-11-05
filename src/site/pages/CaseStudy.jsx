import Footer from './Footer';
import { pick, useLang } from '../i18n';
import { href } from '../router';
import DotEnd from './DotEnd';

const luminance = hex => {
  const n = parseInt(hex.slice(1), 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map(v => v / 255);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

// Each case study borrows the client's own palette and one of three compositions,
// so no two projects read like the same template. Standout keeps only its punctuation: the dot.
export default function CaseStudy({ projects, route }) {
  const { c, lang } = useLang();
  const k = c.caseStudy;
  const i = Math.max(0, projects.findIndex(p => p.slug === route.slug));
  const p = projects[i];
  const next = projects[(i + 1) % projects.length];
  const tone = luminance(p.mock.bg) < 0.4 ? 'dark' : 'light';
  const vars = { '--c-bg': p.mock.bg, '--c-ink': p.mock.ink, '--c-accent': p.mock.accent, '--c-soft': p.mock.soft };

  return (
    <>
      <article className={`case case--${p.variant}`} style={vars} data-tone={tone}>
        <figure className="case-hero">
          <img src={p.image} alt={pick(p.headline, lang)} />
        </figure>

        <header className="case-head">
          <h1 className="case-title" tabIndex={-1}>
            <DotEnd text={p.name} className="brand-dot page-dot" />
          </h1>
          <p className="case-line" data-reveal="focus">
            {pick(p.headline, lang)}
          </p>
          <dl className="case-meta" data-reveal="focus">
            <div>
              <dt>{k.sector}</dt>
              <dd>{pick(p.field, lang)}</dd>
            </div>
            <div>
              <dt>{k.scope}</dt>
              <dd>{pick(p.scope, lang)}</dd>
            </div>
            <div>
              <dt>{k.year}</dt>
              <dd>{p.year}</dd>
            </div>
            <div>
              <dt>{k.live}</dt>
              <dd>
                <a className="link" href={p.url} target="_blank" rel="noreferrer">
                  {p.domain}
                </a>
              </dd>
            </div>
          </dl>
        </header>

        {p.sections.map((s, n) => (
          <section className="case-section" key={s.key}>
            <h2 className="case-label" data-reveal="wipe">
              {pick(s.title, lang)}
            </h2>
            <p className="case-text" data-reveal="focus">
              {pick(s.text, lang)}
            </p>
            {n === 0 && (
              <div className="case-visuals">
                <figure className="cv cv-wide" data-reveal="frame">
                  <img src={p.image} alt="" loading="lazy" style={{ objectPosition: '50% 38%' }} />
                </figure>
                <figure className="cv cv-narrow" data-reveal="frame" style={{ '--i': 1 }}>
                  <img src={p.image} alt="" loading="lazy" style={{ objectPosition: '50% 82%' }} />
                </figure>
              </div>
            )}
          </section>
        ))}

        <section className="case-section case-outcome">
          <h2 className="case-label" data-reveal="wipe">
            {k.outcomeTitle}
          </h2>
          <p className="case-text" data-reveal="focus">
            {k.outcome}{' '}
            <a className="link" href={p.url} target="_blank" rel="noreferrer">
              {k.visit}
            </a>
          </p>
        </section>
      </article>

      <nav className="case-next" data-tone="dark" aria-label={k.next}>
        <a href={href('case', next.slug)} data-flip="true" className="case-next-link">
          <span className="case-next-label">{k.next}</span>
          <span className="case-next-name">
            <DotEnd text={next.name} />
          </span>
          <span className="case-next-media">
            <img src={next.image} alt="" loading="lazy" />
          </span>
        </a>
        <a className="link case-back" href={href('work')}>
          {k.back}
        </a>
      </nav>
      <Footer />
    </>
  );
}
