import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import Footer from './Footer';
import { pick, useLang } from '../i18n';
import { href } from '../router';
import { EASE, reduceMotion } from '../motion';
import DotEnd from './DotEnd';

// Project index: big names, and a window on the live site that trails the cursor.
// The window opens like a shutter, leans with the cursor's speed, and the sites slide
// through it in the direction you move down or up the list.
function Index({ projects }) {
  const [hover, setHover] = useState(-1);
  const [last, setLast] = useState(0);
  // Remember the last project hovered, so the preview keeps it while it closes
  if (hover >= 0 && hover !== last) setLast(hover);
  const preview = useRef(null);
  const { c, lang } = useLang();

  useEffect(() => {
    const el = preview.current;
    if (!el) return undefined;
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (!fine) return undefined;
    gsap.set(el, { xPercent: 22, yPercent: -50 });
    const quick = reduceMotion();
    const xTo = gsap.quickTo(el, 'x', { duration: quick ? 0.01 : 0.65, ease: 'power3.out' });
    const yTo = gsap.quickTo(el, 'y', { duration: quick ? 0.01 : 0.65, ease: 'power3.out' });
    const rTo = gsap.quickTo(el, 'rotate', { duration: 0.8, ease: 'power3.out' });
    let px = 0;
    const onMove = e => {
      xTo(e.clientX);
      yTo(e.clientY);
      if (!quick) rTo(Math.max(-7, Math.min(7, (e.clientX - px) * 0.35)));
      px = e.clientX;
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, []);

  useEffect(() => {
    const el = preview.current;
    if (!el) return;
    const quick = reduceMotion();
    gsap.to(el, {
      clipPath: hover >= 0 ? 'inset(0% 0% 0% 0% round 12px)' : 'inset(50% 0% 50% 0% round 12px)',
      autoAlpha: 1,
      duration: quick ? 0.01 : hover >= 0 ? 0.75 : 0.45,
      ease: hover >= 0 ? EASE : 'power3.in'
    });
  }, [hover]);

  const shown = hover >= 0 ? hover : last;

  return (
    <>
      <section className="workpage" data-tone="light">
        <div className="workpage-head">
          <h2 className="h2" data-reveal="wipe">
            {c.work.indexTitle}
          </h2>
          <p className="muted" data-reveal="focus">
            {c.work.indexLead}
          </p>
        </div>

        <ul className={`work-index${hover >= 0 ? ' has-hover' : ''}`} onPointerLeave={() => setHover(-1)}>
          {projects.map((p, i) => (
            <li key={p.id} data-hover={hover === i ? 'true' : undefined} data-reveal="rule" style={{ '--i': i }}>
              <a
                href={href('case', p.slug)}
                onPointerEnter={() => setHover(i)}
                onFocus={() => setHover(i)}
                onBlur={() => setHover(-1)}
              >
                <span className="wi-name">
                  <span className="wi-dot" aria-hidden="true" />
                  <span className="wi-text">{p.name}</span>
                </span>
                <span className="wi-meta">
                  <span className="wi-head">{pick(p.headline, lang)}</span>
                  <span>{pick(p.field, lang)}</span>
                </span>
                <img className="wi-thumb" src={p.image} alt="" aria-hidden="true" />
              </a>
            </li>
          ))}
        </ul>

        <p className="muted work-more" data-reveal="focus">
          {c.work.more}
        </p>
      </section>

      <div className="wi-preview" ref={preview} aria-hidden="true">
        {projects.map((p, i) => (
          <div key={p.id} className="wi-preview-layer" data-pos={i === shown ? 'on' : i < shown ? 'above' : 'below'}>
            <div className="wi-preview-bar">{p.domain}</div>
            <img src={p.image} alt="" />
          </div>
        ))}
      </div>
    </>
  );
}

// The exhibition: four projects, four compositions. Image first, then the name,
// which is allowed to cross into the picture.
export default function Work({ projects }) {
  const { c, lang } = useLang();
  return (
    <>
      <section className="ex" data-tone="light">
        <header className="ex-head">
          <h1 className="ex-h1" tabIndex={-1} data-reveal="wipe">
            <DotEnd text={c.work.title} className="brand-dot page-dot" />
          </h1>
          <p className="lead" data-reveal="focus">
            {c.work.lead}
          </p>
        </header>
        {projects.map((p, i) => (
          <article className={`ex-item ex-n${i}`} key={p.id}>
            <a href={href('case', p.slug)} data-flip="true" className="ex-link">
              <span className="ex-media" data-reveal="frame">
                <img src={p.image} alt={pick(p.headline, lang)} loading={i > 0 ? 'lazy' : undefined} />
              </span>
              <span className="ex-text">
                <span className="ex-meta">
                  {pick(p.field, lang)}, {p.year}
                </span>
                <span className="ex-title" data-reveal="wipe">
                  <DotEnd text={p.name} className="brand-dot ex-dot" />
                </span>
                <span className="ex-line">{pick(p.headline, lang)}</span>
                <span className="ex-open">{c.work.open}</span>
              </span>
            </a>
          </article>
        ))}
      </section>
      <Index projects={projects} />
      <Footer />
    </>
  );
}
