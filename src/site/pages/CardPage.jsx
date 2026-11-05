import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { EASE } from '../motion';
import HoloCard from '../rb/HoloCard';
import { drawCard } from '../projects';
import Footer from './Footer';
import { useLang } from '../i18n';

export default function CardPage({ loaded }) {
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const { c } = useLang();
  const k = c.card;
  const labels = { name: k.name, role: k.role, scan: k.scan };
  const [image, setImage] = useState(() => drawCard('', '', labels));
  const stage = useRef(null);

  // The card is dealt onto the page once: it turns in from the side and settles
  useEffect(() => {
    if (!loaded || !stage.current) return undefined;
    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.fromTo(
        stage.current.querySelector('.deal'),
        { rotateY: -75, rotateZ: -8, x: 80, opacity: 0, transformPerspective: 1200 },
        { rotateY: 0, rotateZ: 0, x: 0, opacity: 1, duration: 1.6, ease: EASE, delay: 0.2 }
      );
    });
    return () => mm.revert();
  }, [loaded]);

  useEffect(() => {
    const id = setTimeout(() => setImage(drawCard(name, role, labels)), 220);
    return () => clearTimeout(id);
  }, [name, role, c]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <section className="cardpage" data-tone="light">
        <div className="card-copy">
          <h1 className="display display-m" data-reveal="wipe">
            {k.title}
          </h1>
          <p className="lead" data-reveal="focus">
            {k.lead}
          </p>
          <div className="fields">
            <label className="field">
              <span>{k.name}</span>
              <input value={name} onChange={e => setName(e.target.value)} placeholder={k.name} maxLength={32} autoComplete="name" />
            </label>
            <label className="field">
              <span>{k.role}</span>
              <input value={role} onChange={e => setRole(e.target.value)} placeholder={k.role} maxLength={36} />
            </label>
          </div>
          <p className="muted">{k.fine}</p>
          <a className="btn btn-primary" href="https://cards.standoutstudio.ca" target="_blank" rel="noreferrer">
            {k.cta}
          </a>
        </div>
        <div className="card-stage" ref={stage}>
          <div className="deal">{loaded && <HoloCard image={image} preset="stars" width={330} intensity={0.45} glare={0.35} edgeSparkle={0.3} tiltMax={12} radius={22} idle={false} />}</div>
          <p className="muted">{k.hint}</p>
        </div>
      </section>
      <Footer />
    </>
  );
}
