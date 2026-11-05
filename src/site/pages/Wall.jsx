import { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { useLang } from '../i18n';

// Signature interaction: a perfect grid of identical template websites.
// One of them separates, leaves its cell, takes on its own colours and grows
// until it becomes the dark room of the showcase. Order first, then the exception.
export default function Wall({ image }) {
  const root = useRef(null);
  const { c } = useLang();

  useLayoutEffect(() => {
    const mm = gsap.matchMedia();
    const build = ({ cols, rows, pick }) => () => {
      const section = root.current;
      const tiles = gsap.utils.toArray('.wall-tile', section).slice(0, cols * rows);
      const hero = tiles[pick];
      const others = tiles.filter((_, i) => i !== pick);
      const grey = hero.querySelector('.wt-grey');
      const night = hero.querySelector('.wt-night');
      const ring = hero.querySelector('.wt-ring');

      // How far the chosen tile must travel and grow to cover the screen
      const toCenter = () => {
        const r = hero.getBoundingClientRect();
        const s = section.getBoundingClientRect();
        return { x: s.left + s.width / 2 - (r.left + r.width / 2), y: s.top + s.height / 2 - (r.top + r.height / 2) };
      };
      const cover = () => {
        const r = hero.getBoundingClientRect();
        return Math.max(window.innerWidth / r.width, window.innerHeight / r.height) * 1.08;
      };

      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: () => `+=${window.innerHeight * 1.7}`,
          pin: true,
          scrub: 0.8,
          invalidateOnRefresh: true
        }
      });
      tl.to(ring, { opacity: 1, duration: 0.1 }, 0.05)
        .to(hero, { y: -10, scale: 1.08, duration: 0.15, ease: 'power2.out' }, 0.05)
        .to(others, { opacity: 0.28, scale: 0.94, duration: 0.3, stagger: { each: 0.004, from: pick } }, 0.15)
        .to('.wall-lead', { opacity: 0.35, duration: 0.15 }, 0.2)
        .fromTo('.wall-twist', { clipPath: 'inset(-20% 100% -20% -2%)' }, { clipPath: 'inset(-20% 0% -20% -2%)', duration: 0.2, ease: 'power2.out' }, 0.25)
        .to(grey, { opacity: 0, duration: 0.2 }, 0.22)
        .to(hero, { x: () => toCenter().x, y: () => toCenter().y, scale: 3, duration: 0.35, ease: 'power2.inOut' }, 0.3)
        .to(ring, { opacity: 0, duration: 0.1 }, 0.62)
        .to(hero, { scale: () => cover(), borderRadius: 0, duration: 0.3, ease: 'power2.in' }, 0.65)
        .to(night, { opacity: 1, duration: 0.18 }, 0.8)
        .to(['.wall-copy', others], { opacity: 0, duration: 0.15 }, 0.75);
    };
    mm.add('(min-width: 900px) and (prefers-reduced-motion: no-preference)', build({ cols: 8, rows: 4, pick: 13 }));
    mm.add('(max-width: 899px) and (prefers-reduced-motion: no-preference)', build({ cols: 4, rows: 5, pick: 9 }));
    return () => mm.revert();
  }, []);

  const tiles = Array.from({ length: 32 }, (_, i) => i);

  return (
    <section className="wall" data-tone="light" ref={root} aria-label={c.home.wallLead}>
      <div className="wall-copy">
        <p className="wall-lead">{c.home.wallLead}</p>
        <p className="wall-twist">{c.home.wallTwist}</p>
      </div>
      <div className="wall-grid" aria-hidden="true">
        {tiles.map(i => (
          <div className={`wall-tile${i === 13 ? ' is-pick-lg' : ''}${i === 9 ? ' is-pick-sm' : ''}`} key={i}>
            {(i === 13 || i === 9) && (
              <>
                <img className="wt-site" src={image} alt="" />
                <span className="wt-grey" />
                <span className="wt-night" />
                <span className="wt-ring" />
              </>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
