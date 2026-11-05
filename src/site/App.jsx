import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { buildProjects, loadFonts, PROJECTS } from './projects';
import Home from './pages/Home';
import Work from './pages/Work';
import CaseStudy from './pages/CaseStudy';
import Services from './pages/Services';
import About from './pages/About';
import CardPage from './pages/CardPage';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Account from './pages/Account';
import NotFound from './pages/NotFound';
import { ACCOUNTS_ENABLED } from './features';
import { useAuth } from './auth/AuthContext';
import { fmt, useLang } from './i18n';
import { EASE, EASE_IO, observeReveals, reduceMotion, splitChars } from './motion';
import { commit, fromHref, href, keyOf, listen, parse, same } from './router';

gsap.registerPlugin(ScrollTrigger);

const SLUGS = PROJECTS.map(p => p.slug);
const PAGES = { home: Home, work: Work, case: CaseStudy, services: Services, about: About, contact: Contact, card: CardPage, login: Login, account: Account, notfound: NotFound };
const NAV = ['work', 'services', 'about', 'contact'];

function Loader({ ready, onDone, line }) {
  const root = useRef(null);
  const num = useRef(null);
  const [count, setCount] = useState(0);
  const doneRef = useRef(false);

  useEffect(() => {
    const quick = reduceMotion();
    const obj = { v: 0 };
    const t = gsap.to(obj, {
      v: ready ? 100 : 86,
      duration: quick ? 0.2 : ready ? 0.7 : 1.8,
      ease: 'power2.out',
      onUpdate: () => setCount(Math.round(obj.v))
    });
    return () => t.kill();
  }, [ready]);

  useEffect(() => {
    if (count < 100 || doneRef.current) return;
    doneRef.current = true;
    const quick = reduceMotion();
    if (quick) {
      gsap.to(root.current, { opacity: 0, duration: 0.25, onComplete: onDone });
      return;
    }
    // Signature: the whole screen collapses into the teal dot that ends the headline
    const target = document.querySelector('main .page-dot, main .brand-dot') || document.querySelector('.menu-btn-dot');
    const r = target?.getBoundingClientRect();
    const x = r ? r.left + r.width / 2 : window.innerWidth / 2;
    const y = r ? r.top + r.height / 2 : window.innerHeight / 2;
    const end = r ? r.width / 2 : 0;
    const start = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y)) + 20;
    const tl = gsap.timeline({ onComplete: onDone });
    tl.to([num.current, root.current.querySelectorAll('.loader-mark, .loader-line')], { yPercent: -110, opacity: 0, duration: 0.55, ease: 'power3.in', stagger: 0.04 })
      .fromTo(
        root.current,
        { clipPath: `circle(${start}px at ${x}px ${y}px)` },
        { clipPath: `circle(${end}px at ${x}px ${y}px)`, duration: 1.15, ease: EASE_IO },
        '-=0.2'
      );
  }, [count, onDone]);

  return (
    <div className="loader" ref={root} aria-hidden="true">
      <span className="loader-mark">Standout Studio</span>
      <p className="loader-line">{line}</p>
      <div className="loader-count-wrap">
        <span className="loader-count" ref={num}>
          {count}
        </span>
      </div>
    </div>
  );
}

function LangSwitch({ lang, setLang, label }) {
  return (
    <div className="lang-switch" role="group" aria-label={label}>
      {['fr', 'en'].map(l => (
        <button key={l} type="button" lang={l} aria-pressed={lang === l} onClick={() => setLang(l)}>
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

// Where an iris should start or end: the centre of a dot on screen
const dotCenter = el => {
  const r = el?.getBoundingClientRect();
  return r && r.width ? { x: r.left + r.width / 2, y: r.top + r.height / 2, r: r.width / 2 } : null;
};
const coverRadius = (x, y) => Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y)) + 24;

// Built once: real screenshots, so the same data renders on the server and in the browser
const ALL_PROJECTS = buildProjects();

export default function App({ initialRoute }) {
  const { user } = useAuth();
  const { c, lang, setLang } = useLang();
  const projects = ALL_PROJECTS;
  const [fontsReady, setFontsReady] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [route, setRoute] = useState(() => initialRoute || { name: 'home' });
  const [menuOpen, setMenuOpen] = useState(false);
  const [tone, setTone] = useState('light');
  const [compact, setCompact] = useState(false);
  const lenisRef = useRef(null);
  const irisRef = useRef(null);
  const irisLabelRef = useRef(null);
  const menuRef = useRef(null);
  const menuRingRef = useRef(null);
  const busy = useRef(false);
  const firstPage = useRef(true);

  // Private pages
  const guard = r => {
    if (!ACCOUNTS_ENABLED && (r.name === 'login' || r.name === 'account')) return { name: 'notfound' };
    return r.name === 'account' && !user ? { name: 'login' } : r.name === 'login' && user ? { name: 'account' } : r;
  };
  const current = guard(route);

  useEffect(() => {
    let alive = true;
    loadFonts().then(() => alive && setFontsReady(true));
    return () => {
      alive = false;
    };
  }, []);

  // Old prototype links (#realisations, #work-caramello-cafe…) land on the right page
  useEffect(() => {
    if (!window.location.hash) return;
    const r = parse(SLUGS);
    if (same(r, route)) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time upgrade of a legacy hash URL after hydration
    setRoute(r);
    commit(r, lang, true);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Tab title follows the page
  useEffect(() => {
    const name = current.name === 'case' ? PROJECTS.find(p => p.slug === current.slug)?.name : current.name === 'home' ? null : c.routes[current.name];
    const base = lang === 'fr' ? 'Standout Studio · Studio web à Ottawa' : 'Standout Studio · Web studio in Ottawa';
    document.title = name ? `${name} · Standout Studio` : base;
  }, [keyOf(current), lang]); // eslint-disable-line react-hooks/exhaustive-deps

  // Smooth scroll, driven by GSAP's ticker so ScrollTrigger stays in sync
  useEffect(() => {
    if (reduceMotion()) return undefined;
    const lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
    lenisRef.current = lenis;
    lenis.on('scroll', ScrollTrigger.update);
    const tick = time => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  // Header: colour follows the section underneath, compacts while reading down
  useEffect(() => {
    let frame = 0;
    let lastY = window.scrollY;
    const check = () => {
      frame = 0;
      const el = document.elementsFromPoint(window.innerWidth / 2, 36).find(n => n.closest?.('[data-tone]') && !n.closest('.hdr'));
      const t = el?.closest('[data-tone]')?.dataset.tone;
      if (t) setTone(t);
      const y = window.scrollY;
      if (Math.abs(y - lastY) > 6) {
        setCompact(y > 160 && y > lastY);
        lastY = y;
      }
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(check);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    const t = setTimeout(check, 60);
    return () => {
      window.removeEventListener('scroll', onScroll);
      clearTimeout(t);
      cancelAnimationFrame(frame);
    };
  }, [route, loaded]);

  // Reveals for the page on screen; focus moves to its title after a navigation
  useEffect(() => {
    if (!loaded || !projects) return undefined;
    if (!firstPage.current) document.querySelector('main h1')?.focus({ preventScroll: true });
    firstPage.current = false;
    return observeReveals(document.querySelector('main.page'));
  }, [keyOf(current), loaded, projects, lang]); // eslint-disable-line react-hooks/exhaustive-deps

  // force: Lenis is stopped while the menu is open and would otherwise ignore the jump
  const toTop = () => {
    lenisRef.current?.scrollTo(0, { immediate: true, force: true });
    window.scrollTo(0, 0);
    setCompact(false);
  };

  const labelFor = r => (r.name === 'case' ? PROJECTS.find(p => p.slug === r.slug)?.name : c.routes[r.name]) || '';

  const swapTo = useCallback(next => {
    setMenuOpen(false);
    setRoute(next);
    commit(next);
    toTop();
  }, []);

  // Page transition, signature: an iris opens from where you clicked, the page name
  // types itself, and the new page appears as the iris closes onto its dot.
  const irisTo = useCallback(
    (next, origin) => {
      const layer = irisRef.current;
      const label = irisLabelRef.current;
      const dot = layer.querySelector('.iris-dot');
      const o = origin || dotCenter(document.querySelector('.menu-btn-dot')) || { x: window.innerWidth / 2, y: window.innerHeight / 2 };
      const finish = () => {
        gsap.set(layer, { visibility: 'hidden' });
        busy.current = false;
        ScrollTrigger.refresh();
      };
      if (reduceMotion()) {
        label.textContent = labelFor(next);
        gsap.timeline({ onComplete: finish })
          .set(layer, { visibility: 'visible', clipPath: 'none', opacity: 0 })
          .to(layer, { opacity: 1, duration: 0.15 })
          .add(() => swapTo(next))
          .to(layer, { opacity: 0, duration: 0.2, delay: 0.1 });
        return;
      }
      const chars = splitChars(label, labelFor(next));
      gsap.set(layer, { visibility: 'visible', opacity: 1, clipPath: `circle(0px at ${o.x}px ${o.y}px)` });
      gsap.set(chars, { yPercent: 115, rotate: 7 });
      gsap.set(dot, { scale: 0 });
      gsap.timeline({ onComplete: finish })
        .to(layer, { clipPath: `circle(${coverRadius(o.x, o.y)}px at ${o.x}px ${o.y}px)`, duration: 0.85, ease: EASE_IO })
        .to(chars, { yPercent: 0, rotate: 0, duration: 0.7, ease: EASE, stagger: 0.022 }, '-=0.35')
        .to(dot, { scale: 1, duration: 0.5, ease: 'back.out(3)' }, '-=0.4')
        .add(() => swapTo(next))
        .to(chars, { yPercent: -115, duration: 0.4, ease: 'power3.in', stagger: 0.012 }, '+=0.12')
        .to(dot, { scale: 0, duration: 0.3, ease: 'power3.in' }, '<0.1')
        .to(
          layer,
          {
            // closes onto the new page's own dot, like the loader
            clipPath: () => {
              const t = dotCenter(document.querySelector('main .page-dot, main .brand-dot')) || dotCenter(document.querySelector('.wordmark-dot')) || { x: window.innerWidth / 2, y: window.innerHeight / 2, r: 0 };
              return `circle(${t.r}px at ${t.x}px ${t.y}px)`;
            },
            duration: 0.9,
            ease: EASE_IO
          },
          '-=0.1'
        );
    },
    [c, swapTo] // eslint-disable-line react-hooks/exhaustive-deps
  );

  // Work → case study: the picture you clicked becomes the case study's opening image
  const flipTo = useCallback(
    (next, img) => {
      const r = img.getBoundingClientRect();
      const clone = img.cloneNode();
      Object.assign(clone.style, {
        position: 'fixed', left: `${r.left}px`, top: `${r.top}px`, width: `${r.width}px`, height: `${r.height}px`,
        objectFit: 'cover', objectPosition: getComputedStyle(img).objectPosition || '50% 0%', zIndex: 65, margin: 0,
        borderRadius: getComputedStyle(img).borderRadius, transform: 'none', pointerEvents: 'none'
      });
      document.body.appendChild(clone);
      gsap.to('main.page', { opacity: 0, duration: 0.35, ease: 'power2.out' });
      setMenuOpen(false);
      gsap.to(clone, {
        left: 0, top: 76, width: window.innerWidth, height: Math.max(420, window.innerHeight * 0.78) - 76, borderRadius: 0,
        objectPosition: '50% 0%', duration: 0.95, ease: EASE_IO,
        onComplete: () => {
          swapTo(next);
          requestAnimationFrame(() =>
            requestAnimationFrame(() =>
              gsap.to(clone, { opacity: 0, duration: 0.45, delay: 0.1, onComplete: () => { clone.remove(); busy.current = false; ScrollTrigger.refresh(); } })
            )
          );
        }
      });
    },
    [swapTo]
  );

  const navigate = useCallback(
    (target, opts = {}) => {
      if (busy.current) return;
      const next = guard(target);
      if (same(next, current)) {
        setMenuOpen(false);
        if (lenisRef.current) lenisRef.current.scrollTo(0, { duration: 1.4 });
        else window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      busy.current = true;
      if (opts.flip && next.name === 'case' && !reduceMotion()) flipTo(next, opts.flip);
      else irisTo(next, opts.origin);
    },
    [current, user, irisTo, flipTo] // eslint-disable-line react-hooks/exhaustive-deps
  );

  // Right after signing in, leave the login page for the client area
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reacts to the auth change by starting a page transition
    if (user && route.name === 'login') navigate({ name: 'account' });
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  // Back / forward and typed URLs
  useEffect(
    () =>
      listen(() => {
        const r = parse(SLUGS);
        if (busy.current || same(r, route)) return;
        setMenuOpen(false);
        setRoute(r);
        toTop();
      }),
    [route]
  );

  // Every internal link goes through the router (and its transitions)
  useEffect(() => {
    const onClick = e => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = e.target.closest?.('a[href]');
      if (!a || a.target === '_blank') return;
      const r = fromHref(a.getAttribute('href'), SLUGS);
      if (!r) return;
      e.preventDefault();
      const box = a.getBoundingClientRect();
      const origin = e.clientX || e.clientY ? { x: e.clientX, y: e.clientY } : { x: box.left + box.width / 2, y: box.top + box.height / 2 };
      const img = a.dataset.flip ? a.querySelector('img') : null;
      navigate(r, { origin, flip: img });
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, [navigate]);

  // Menu, signature: the dot grows into a sarcelle iris and the studio opens through it.
  // Closing runs the same movement backwards, into the dot.
  useLayoutEffect(() => {
    const panel = menuRef.current;
    const ring = menuRingRef.current;
    if (!panel || !ring) return;
    const d = dotCenter(document.querySelector('.menu-btn-dot')) || { x: window.innerWidth - 64, y: 48, r: 4 };
    const R = coverRadius(d.x, d.y);
    const at = `${d.x}px ${d.y}px`;
    const quick = reduceMotion();
    gsap.killTweensOf([panel, ring]);
    if (menuOpen) {
      lenisRef.current?.stop();
      gsap.set([panel, ring], { visibility: 'visible' });
      if (quick) {
        gsap.set([panel, ring], { clipPath: 'none' });
        return;
      }
      gsap.fromTo(ring, { clipPath: `circle(${d.r}px at ${at})` }, { clipPath: `circle(${R}px at ${at})`, duration: 0.95, ease: EASE_IO });
      gsap.fromTo(panel, { clipPath: `circle(0px at ${at})` }, { clipPath: `circle(${R}px at ${at})`, duration: 0.95, ease: EASE_IO, delay: 0.14 });
      gsap.fromTo(
        panel.querySelectorAll('.menu-link-text'),
        { clipPath: 'inset(-10% 100% -10% 0%)', x: -28 },
        { clipPath: 'inset(-10% 0% -10% 0%)', x: 0, duration: 1.05, ease: EASE, stagger: 0.07, delay: 0.5 }
      );
    } else {
      lenisRef.current?.start();
      if (quick) {
        gsap.set([panel, ring], { visibility: 'hidden' });
        return;
      }
      gsap.to(panel, { clipPath: `circle(0px at ${at})`, duration: 0.7, ease: EASE_IO });
      gsap.to(ring, {
        clipPath: `circle(${d.r}px at ${at})`,
        duration: 0.75,
        ease: EASE_IO,
        delay: 0.12,
        onComplete: () => gsap.set([panel, ring], { visibility: 'hidden' })
      });
    }
  }, [menuOpen]);

  useEffect(() => {
    const onKey = e => e.key === 'Escape' && setMenuOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const accountName = user ? 'account' : 'login';
  const Page = PAGES[current.name] || Home;
  const headerTone = menuOpen ? 'dark' : tone;
  const activeNav = current.name === 'case' ? 'work' : current.name;

  return (
    <>
      <a
        className="skip"
        href="#main"
        onClick={e => {
          e.preventDefault();
          document.querySelector('main h1')?.focus();
        }}
      >
        {c.nav.skip}
      </a>

      {!loaded && <Loader ready={fontsReady} onDone={() => setLoaded(true)} line={c.loader} />}

      <header className="hdr" data-on={headerTone} data-compact={compact && !menuOpen ? 'true' : undefined}>
        <a href={href('home')} className="wordmark" aria-label={c.nav.homeAria}>
          Standout<span className="wordmark-studio">Studio</span>
          <span className="wordmark-dot" aria-hidden="true" />
        </a>
        <div className="hdr-right">
          <LangSwitch lang={lang} setLang={setLang} label={c.nav.lang} />
          {ACCOUNTS_ENABLED && (
            <a href={href(accountName)} className="hdr-account">
              {user ? (
                <>
                  <span className="avatar" aria-hidden="true">
                    {user.firstName[0]}
                    {user.lastName[0]}
                  </span>
                  {c.nav.myAccount}
                </>
              ) : (
                c.nav.account
              )}
            </a>
          )}
          <button
            type="button"
            className="menu-btn"
            aria-expanded={menuOpen}
            aria-controls="site-menu"
            aria-label={menuOpen ? c.nav.close : c.nav.menu}
            onClick={() => setMenuOpen(o => !o)}
          >
            <span className="menu-btn-label" aria-hidden="true">
              <span className="roll" data-open={menuOpen ? 'true' : undefined}>
                <span>{c.nav.menu}</span>
                <span>{c.nav.close}</span>
              </span>
            </span>
            <span className="menu-btn-dot" aria-hidden="true" />
          </button>
        </div>
      </header>

      <div className="menu-ring" ref={menuRingRef} aria-hidden="true" />
      <div className="menu" id="site-menu" ref={menuRef} aria-hidden={!menuOpen}>
        {menuOpen && (
          <nav className="menu-nav" aria-label={c.nav.menu}>
            <ul className="menu-list">
              {NAV.map(name => (
                <li key={name} data-current={activeNav === name ? 'true' : undefined}>
                  <a href={href(name)} className="menu-link" aria-current={activeNav === name ? 'page' : undefined}>
                    <span className="menu-link-dot" aria-hidden="true" />
                    <span className="menu-link-text">{c.nav[name]}</span>
                  </a>
                </li>
              ))}
            </ul>
            <div className="menu-utility">
              {ACCOUNTS_ENABLED && <a href={href(accountName)}>{user ? fmt(c.menu.hello, { name: user.firstName }) : c.nav.account}</a>}
              <a href={href('card')}>{c.nav.card}</a>
              <span>{c.where}</span>
            </div>
          </nav>
        )}
      </div>

      <main className="page" id="main" key={keyOf(current)}>
        <Page projects={projects} loaded={loaded} navigate={navigate} route={current} />
      </main>

      <div className="iris" ref={irisRef} aria-hidden="true">
        <div className="curtain-row">
          <span className="curtain-label" ref={irisLabelRef} />
          <span className="curtain-dot iris-dot" />
        </div>
      </div>
    </>
  );
}
