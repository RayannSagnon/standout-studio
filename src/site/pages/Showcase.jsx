import { useLayoutEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { fmt, pick, useLang } from '../i18n';
import { EASE_IO } from '../motion';

// The viewing room. It opens out of the wall's escaping tile; a browser window stays put,
// page scroll scrolls each live site inside it, and the next site is laid over the last
// while the previous one steps back.
export default function Showcase({ projects }) {
  const root = useRef(null);
  const listRef = useRef(null);
  const activeRef = useRef(0);
  const [active, setActive] = useState(0);
  const [dotY, setDotY] = useState(0);
  const { c, lang } = useLang();
  const n = projects.length;

  useLayoutEffect(() => {
    const mm = gsap.matchMedia();
    mm.add('(min-width: 900px) and (prefers-reduced-motion: no-preference)', () => {
      const pin = root.current.querySelector('.sc-pin');
      const frame = root.current.querySelector('.sc-frame');
      const layers = gsap.utils.toArray('.sc-layer', root.current);
      const shots = gsap.utils.toArray('.sc-shot', root.current);

      // The window itself arrives cropped and settles to full size while the room opens
      gsap.fromTo(
        frame,
        { clipPath: 'inset(9% 9% 9% 9% round 28px)', scale: 0.94 },
        {
          clipPath: 'inset(0% 0% 0% 0% round 14px)',
          scale: 1,
          ease: 'none',
          scrollTrigger: { trigger: root.current, start: 'top 70%', end: 'top top', scrub: 0.6 }
        }
      );

      gsap.set(layers.slice(1), { clipPath: 'inset(100% 0% 0% 0%)' });
      gsap.set(shots.slice(1), { scale: 1.08, transformOrigin: '50% 0%' });
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: pin,
          start: 'top top',
          end: () => `+=${n * window.innerHeight}`,
          pin: true,
          scrub: 0.9,
          invalidateOnRefresh: true,
          onUpdate: self => {
            const i = Math.min(n - 1, Math.floor(self.progress * n));
            if (i !== activeRef.current) {
              activeRef.current = i;
              setActive(i);
            }
          }
        }
      });
      shots.forEach((shot, i) => {
        tl.to(shot, { y: () => -(shot.offsetHeight - shot.parentElement.offsetHeight), duration: 0.85 }, i);
        if (i < n - 1) {
          // incoming site wipes up over the old one, uncropping as it lands; the old one steps back
          tl.to(layers[i + 1], { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.32, ease: EASE_IO }, i + 0.72)
            .to(shots[i + 1], { scale: 1, duration: 0.4, ease: 'power2.out' }, i + 0.72)
            .to(layers[i], { scale: 0.92, opacity: 0.35, duration: 0.32, ease: 'power2.in' }, i + 0.72);
        }
      });
      tl.to({}, { duration: 0.15 });
      return () => ScrollTrigger.refresh();
    });
    return () => mm.revert();
  }, [n]);

  // The dot travels down the list to the site on screen
  useLayoutEffect(() => {
    const li = listRef.current?.children[active];
    if (li) setDotY(li.offsetTop + li.offsetHeight / 2);
  }, [active, lang]);

  const current = projects[active];

  return (
    <section className="showcase" data-tone="dark" ref={root} id="travaux">
      <div className="sc-pin">
        <div className="sc-copy">
          <h2 className="sc-title">
            <span>{c.showcase.title[0]}</span>
            <span>{c.showcase.title[1]}</span>
          </h2>
          <p className="sc-intro">{c.showcase.intro}</p>
          <div className="sc-list-wrap">
            <span className="sc-marker" aria-hidden="true" style={{ transform: `translateY(${dotY}px)` }} />
            <ul className="sc-list" ref={listRef}>
              {projects.map((p, i) => (
                <li key={p.id} className={i === active ? 'is-active' : undefined}>
                  <a href={p.url} target="_blank" rel="noreferrer">
                    <span className="sc-name">{p.name}</span>
                    <span className="sc-kind">{pick(p.field, lang)}</span>
                    <span className="sc-headline">{pick(p.headline, lang)}</span>
                    <img className="sc-thumb" src={p.image} alt="" aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="sc-stage">
          <p className="sc-feature" key={`${current.id}-${lang}`}>
            {pick(current.headline, lang)}
          </p>
          <div className="sc-frame" style={{ '--accent': current.mock.accent }}>
            <div className="sc-bar">
              <span className="sc-url" key={current.id}>
                {current.domain}
              </span>
            </div>
            <div className="sc-view">
              {projects.map((p, i) => (
                <div className="sc-layer" key={p.id} style={{ zIndex: i + 1 }}>
                  <img className="sc-shot" src={p.image} alt={fmt(c.showcase.alt, { name: p.name })} draggable={false} />
                </div>
              ))}
            </div>
          </div>
          <a className="sc-visit link" href={current.url} target="_blank" rel="noreferrer">
            {fmt(c.showcase.visit, { name: current.name })}
          </a>
        </div>
      </div>
    </section>
  );
}
