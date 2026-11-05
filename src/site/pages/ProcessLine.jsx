import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { useLang } from '../i18n';

// The one perfectly ordered section: a line runs through the steps and switches each one on.
export default function ProcessLine() {
  const { c } = useLang();
  const h = c.home;
  const root = useRef(null);

  useEffect(() => {
    const mm = gsap.matchMedia();
    const steps = gsap.utils.toArray('.steps li', root.current);
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.fromTo(
        root.current.querySelector('.steps-line span'),
        { scaleX: 0 },
        {
          scaleX: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: root.current.querySelector('.steps'),
            start: 'top 78%',
            end: 'bottom 45%',
            scrub: 0.5,
            onUpdate: self => steps.forEach((li, i) => li.classList.toggle('is-on', self.progress >= i / steps.length + 0.02))
          }
        }
      );
    });
    mm.add('(prefers-reduced-motion: reduce)', () => steps.forEach(li => li.classList.add('is-on')));
    return () => mm.revert();
  }, []);

  return (
    <section className="process" data-tone="light" ref={root}>
      <h2 className="h2" data-reveal="wipe">
        {h.processTitle}
      </h2>
      <div className="steps-line" aria-hidden="true">
        <span />
      </div>
      <ol className="steps">
        {h.steps.map(([t, d], i) => (
          <li key={t}>
            <span className="step-n">{i + 1}</span>
            <h3>{t}</h3>
            <p>{d}</p>
          </li>
        ))}
      </ol>
      <p className="muted process-note" data-reveal="focus">
        {h.processNote}
      </p>
    </section>
  );
}
