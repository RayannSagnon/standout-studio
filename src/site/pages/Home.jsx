import { useEffect, useLayoutEffect, useRef, useSyncExternalStore } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Ballpit from '../rb/Ballpit';
import ScrollReveal from '../rb/ScrollReveal';
import Magnet from '../rb/Magnet';
import Showcase from './Showcase';
import Wall from './Wall';
import Footer from './Footer';
import { useLang } from '../i18n';
import { href } from '../router';
import { useStep } from './StepTitle';
import { EASE, EASE_IO } from '../motion';

const MOTION = '(prefers-reduced-motion: no-preference)';
// Safe while the page is unmounting (GSAP may re-evaluate function values on revert)
const stepOf = el => (el ? parseFloat(getComputedStyle(el).getPropertyValue('--step')) || 0 : 0);

const SMALL = '(max-width: 720px)';
const subscribeSmall = cb => {
  const mq = window.matchMedia(SMALL);
  mq.addEventListener('change', cb);
  return () => mq.removeEventListener('change', cb);
};
const useIsSmall = () =>
  useSyncExternalStore(subscribeSmall, () => window.matchMedia(SMALL).matches, () => false);

export default function Home({ projects, loaded }) {
  const small = useIsSmall();
  const { c, lang } = useLang();
  const h = c.home;
  const heroTitle = useRef(null);
  const ctaTitle = useRef(null);
  const ctaOrb = useRef(null);

  useStep(heroTitle, [lang]);
  useStep(ctaTitle, [lang]);

  // The CTA orb sits where the dot would end the closing line
  useLayoutEffect(() => {
    const title = ctaTitle.current;
    const orb = ctaOrb.current;
    if (!title || !orb) return undefined;
    const place = () => {
      const b = title.querySelector('.step-b');
      const tr = title.getBoundingClientRect();
      const br = b.getBoundingClientRect();
      orb.style.setProperty('--orb-x', `${br.right - tr.left}px`);
      orb.style.setProperty('--orb-y', `${br.top - tr.top + br.height * 0.5}px`);
    };
    place();
    document.fonts?.ready.then(place);
    const ro = new ResizeObserver(place);
    ro.observe(title);
    return () => ro.disconnect();
  }, [lang]);

  // Hidden start states exist only when motion is allowed
  useLayoutEffect(() => {
    const mm = gsap.matchMedia();
    mm.add(MOTION, () => {
      gsap.set('.hero .line', { clipPath: 'inset(-12% 100% -12% -2%)' });
      gsap.set('.hero .hl-2 .line', { x: () => -stepOf(heroTitle.current) });
      gsap.set('.hero-sub', { opacity: 0, filter: 'blur(10px)' });
      gsap.set('.hero-actions', { clipPath: 'inset(-20% 100% -20% -4%)' });
      gsap.set('.hero-hint', { opacity: 0 });
    });
    return () => mm.revert();
  }, []);

  // Signature sequence. The dot is already there (the loader collapsed into it).
  // "Stand" writes itself on the grid; "out" writes itself in line underneath it,
  // like everyone else... then steps out to meet the dot.
  useEffect(() => {
    if (!loaded) return undefined;
    const mm = gsap.matchMedia();
    mm.add(MOTION, () => {
      gsap
        .timeline({ delay: 0.05 })
        .to('.hero .hl-1 .line', { clipPath: 'inset(-12% 0% -12% -2%)', duration: 1.2, ease: EASE })
        .to('.hero .hl-2 .line', { clipPath: 'inset(-12% 0% -12% -2%)', duration: 1.2, ease: EASE }, 0.3)
        .to('.hero .hl-2 .line', { x: 0, duration: 1.05, ease: EASE_IO }, 1.35)
        .fromTo('.hero .brand-dot', { scale: 1 }, { scale: 1.45, duration: 0.2, yoyo: true, repeat: 1, ease: 'power2.out' }, 2.25)
        .to('.hero-sub', { opacity: 1, filter: 'blur(0px)', duration: 1.1, ease: 'power2.out' }, 1.7)
        .to('.hero-actions', { clipPath: 'inset(-20% 0% -20% -4%)', duration: 1.1, ease: EASE }, 1.95)
        .to('.hero-hint', { opacity: 1, duration: 0.8 }, 2.6);

      // Leaving the hero: "Stand" holds its place, "out" keeps going
      gsap
        .timeline({ scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 0.6 } })
        .to('.hero .hl-1', { yPercent: -25, ease: 'none' }, 0)
        .to('.hero .hl-2', { xPercent: 22, yPercent: -10, ease: 'none' }, 0)
        .to('.hero-foot', { opacity: 0, y: -40, ease: 'none' }, 0);

      // Philosophy: the line that refuses the measure enters from outside the grid
      gsap.fromTo(
        '.philo-break .pb-2',
        { xPercent: 28 },
        { xPercent: 0, ease: 'none', scrollTrigger: { trigger: '.philo-break', start: 'top bottom', end: 'top 35%', scrub: 0.6 } }
      );

      // Closing echo of the opening: the second line conforms, then steps out,
      // and the dot grows into the button
      const cta = gsap.timeline({ scrollTrigger: { trigger: '.cta', start: 'top 85%', end: 'top 20%', scrub: 0.6 } });
      cta.fromTo('.cta .hl-2', { x: () => -stepOf(ctaTitle.current) }, { x: 0, ease: 'power2.inOut' }, 0)
        .fromTo('.cta-orb-wrap', { scale: 0.12 }, { scale: 1, ease: 'power2.in' }, 0.35);
    });
    return () => mm.revert();
  }, [loaded]);

  useEffect(() => {
    const t = setTimeout(() => ScrollTrigger.refresh(), 80);
    return () => clearTimeout(t);
  }, [lang]);

  return (
    <div>
      <section className="hero" data-tone="light">
        <div className="hero-pit">
          {loaded && (
            <Ballpit
              count={small ? 46 : 84}
              colors={['#E4E9E7', '#D3DBD8', '#EEF1F0', '#C6D0CD']}
              cursorColor="#0F6B66"
              material="satin"
              minSize={0.4}
              maxSize={0.88}
              gravity={0.6}
              friction={0.997}
              wallBounce={0.9}
              followCursor
              cursorSize={small ? 0.9 : 1.15}
              lightIntensity={1}
              shadows={0.55}
              clickEffect="none"
            />
          )}
        </div>

        <div className="hero-copy">
          <h1 className="hero-title" ref={heroTitle} data-trail="60" aria-label="Stand out" tabIndex={-1}>
            <span className="hl hl-1" aria-hidden="true">
              <span className="line">
                <span className="line-inner step-a">{h.h1[0]}</span>
              </span>
            </span>
            <span className="hl hl-2" aria-hidden="true">
              <span className="line">
                <span className="line-inner step-b">{h.h1[1]}</span>
              </span>
              <span className="brand-dot" />
            </span>
          </h1>
          <div className="hero-foot">
            <p className="hero-sub">{h.sub}</p>
            <div className="hero-actions">
              <a className="btn btn-primary" href={href('contact')}>
                <span>{h.start}</span>
              </a>
              <a className="link" href={href('work')}>
                {h.seeWork}
              </a>
            </div>
          </div>
        </div>

        <p className="hero-hint" aria-hidden="true">
          {small ? h.hintSmall : h.hint}
        </p>
      </section>

      <section className="philo" data-tone="light">
        <ScrollReveal
          key={h.philoLead}
          baseOpacity={0.12}
          enableBlur={false}
          baseRotation={0}
          containerClassName="philo-lead"
          textClassName="philo-lead-text"
        >
          {h.philoLead}
        </ScrollReveal>
        <p className="philo-break">
          <span className="pb-1">{h.philoBreak[0]}</span>
          <span className="pb-2">
            {(() => {
              // The last word and the dot never separate
              const words = h.philoBreak[1].replace(/\.$/, '').split(' ');
              const last = words.pop();
              return (
                <>
                  {words.join(' ')}{' '}
                  <span className="nowrap">
                    {last}
                    <span className="brand-dot" aria-hidden="true" />
                  </span>
                </>
              );
            })()}
          </span>
        </p>
        <p className="philo-more" data-reveal="focus">
          <a className="link" href={href('about')}>
            {h.philoMore}
          </a>
        </p>
      </section>

      <Wall image={projects[0].image} />

      <Showcase projects={projects} />

      <section className="home-more" data-tone="dark">
        <a className="link" href={href('work')}>
          {h.workMore}
        </a>
      </section>

      <section className="cta" data-tone="dark">
        <div className="cta-stage">
          <h2 className="cta-title" ref={ctaTitle} data-trail="190">
            <span className="hl hl-1">
              <span className="step-a">{h.ctaTitle[0]}</span>
            </span>
            <span className="hl hl-2">
              <span className="step-b">{h.ctaTitle[1]}</span>
            </span>
          </h2>
          <div className="cta-orb-wrap" ref={ctaOrb}>
            <Magnet padding={110} magnetStrength={4}>
              <a className="btn-orb" href={href('contact')}>
                <span className="orb-label">
                  {h.ctaBtn[0]}
                  <br />
                  {h.ctaBtn[1]}
                </span>
              </a>
            </Magnet>
          </div>
        </div>
        <p className="cta-text" data-reveal="focus">
          {h.ctaText}
        </p>
      </section>

      <Footer />
    </div>
  );
}
