// Live client sites listed on standoutstudio.ca.
// `screenshot`: real full-page captures (1200 px wide) served from /public/work.
// Without one, a drawn placeholder is generated in the browser.

export const PROJECTS = [
  {
    id: 'caramello',
    slug: 'caramello-cafe',
    headline: { fr: 'Ça sent le café jusque sur l’écran.', en: 'You can almost smell the coffee.' },
    name: 'Caramello Café',
    kind: { fr: 'Café et boulangerie', en: 'Café & bakery' },
    field: { fr: 'Restauration', en: 'Hospitality' },
    domain: 'caramellocafe.ca',
    url: 'https://www.caramellocafe.ca/',
    screenshot: '/work/caramello-cafe.webp',
    mock: { bg: '#F5EFE8', ink: '#3A2418', accent: '#9A6440', soft: '#E6D8C9', layout: 'split' }
  },
  {
    id: 'sharp',
    slug: 'relentless-ritchie',
    headline: { fr: 'Aucune excuse, même pas dans la mise en page.', en: 'No excuses. Not even in the layout.' },
    name: 'Relentless Ritchie',
    kind: { fr: 'Marque personnelle', en: 'Personal brand' },
    field: { fr: 'Coaching et mise en forme', en: 'Coaching & fitness' },
    domain: 'Relentless Ritchie',
    url: 'https://cozy-hotteok-6aa630.netlify.app/',
    screenshot: '/work/relentless-ritchie.webp',
    mock: { bg: '#121314', ink: '#F2F2F0', accent: '#D8F04A', soft: '#26282A', layout: 'full' }
  },
  {
    id: 'rayann',
    slug: 'rayann-sagnon',
    headline: { fr: 'Un ingénieur qu’on comprend du premier coup.', en: 'An engineer you get on the first read.' },
    name: 'Rayann Sagnon',
    kind: { fr: 'Marque personnelle', en: 'Personal brand' },
    field: { fr: 'Portfolio d’ingénierie', en: 'Engineering portfolio' },
    domain: 'rayannsagnon.com',
    url: 'https://rayannsagnon.com',
    screenshot: '/work/rayann-sagnon.webp',
    mock: { bg: '#F3F5F9', ink: '#141B2D', accent: '#3554E8', soft: '#DFE4EF', layout: 'center' }
  },
  {
    id: 'steven',
    slug: 'steven-atchall',
    headline: { fr: 'Le cordonnier est enfin bien chaussé.', en: 'The cobbler’s children finally have shoes.' },
    name: 'Steven Atchall',
    kind: { fr: 'Marque personnelle', en: 'Personal brand' },
    field: { fr: 'Design et direction', en: 'Design & direction' },
    domain: 'stevenatchall.com',
    url: 'https://stevenatchall.com',
    screenshot: '/work/steven-atchall.webp',
    mock: { bg: '#0F0F13', ink: '#EDEDF2', accent: '#8B6CFF', soft: '#1E1E26', layout: 'split' }
  }
];

// next/font renames the family, so read the real stack from the page
const FONT_FALLBACK = '"Helvetica Neue", Arial, sans-serif';
const fontStack = () => getComputedStyle(document.documentElement).getPropertyValue('--font').trim() || FONT_FALLBACK;
const setFont = (ctx, weight, size, stretch = 'normal') => {
  ctx.font = `${weight} ${size}px ${fontStack()}`;
  try {
    ctx.fontStretch = stretch;
  } catch {
    /* ignore */
  }
};
const rr = (ctx, x, y, w, h, r) => {
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(x, y, w, h, r);
  else ctx.rect(x, y, w, h);
  ctx.fill();
};
const bars = (ctx, x, y, w, lines, color, gap = 22, h = 10) => {
  ctx.fillStyle = color;
  for (let i = 0; i < lines; i++) rr(ctx, x, y + i * gap, i === lines - 1 ? w * 0.6 : w, h, 5);
};

// Abstract stand-in for a full-page capture: real name, no invented copy.
export function drawSiteMock(p, W = 1200, H = 3000) {
  const m = p.mock;
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const ctx = c.getContext('2d');
  ctx.fillStyle = m.bg;
  ctx.fillRect(0, 0, W, H);

  // nav
  setFont(ctx, 700, 26, 'expanded');
  ctx.fillStyle = m.ink;
  ctx.fillText(p.name, 64, 70);
  for (let i = 0; i < 4; i++) {
    ctx.fillStyle = m.soft;
    rr(ctx, 660 + i * 92, 54, 72, 14, 7);
  }
  ctx.fillStyle = m.accent;
  rr(ctx, 1040, 40, 104, 42, 21);

  // hero
  const grad = ctx.createLinearGradient(0, 0, W, 900);
  grad.addColorStop(0, m.accent);
  grad.addColorStop(1, m.soft);
  if (m.layout === 'full') {
    ctx.fillStyle = grad;
    ctx.fillRect(0, 120, W, 780);
    setFont(ctx, 800, 112, 'expanded');
    ctx.fillStyle = m.bg;
    const words = p.name.split(' ');
    words.forEach((w, i) => ctx.fillText(w, 64, 560 + i * 110));
  } else if (m.layout === 'center') {
    setFont(ctx, 800, 110, 'expanded');
    ctx.fillStyle = m.ink;
    const tw = ctx.measureText(p.name).width;
    const size = tw > W - 120 ? Math.floor((110 * (W - 120)) / tw) : 110;
    setFont(ctx, 800, size, 'expanded');
    ctx.fillText(p.name, (W - ctx.measureText(p.name).width) / 2, 360);
    bars(ctx, 300, 420, 600, 2, m.soft, 26, 12);
    ctx.fillStyle = grad;
    rr(ctx, 64, 540, W - 128, 420, 20);
  } else {
    setFont(ctx, 800, 92, 'expanded');
    ctx.fillStyle = m.ink;
    p.name.split(' ').forEach((w, i) => ctx.fillText(w, 64, 330 + i * 96));
    bars(ctx, 64, 470, 440, 3, m.soft, 26, 12);
    ctx.fillStyle = m.accent;
    rr(ctx, 64, 590, 200, 56, 28);
    ctx.fillStyle = grad;
    rr(ctx, 620, 170, 516, 640, 20);
  }

  // three columns
  let y = 1040;
  for (let i = 0; i < 3; i++) {
    const x = 64 + i * 368;
    ctx.fillStyle = m.soft;
    rr(ctx, x, y, 336, 220, 16);
    bars(ctx, x, y + 252, 300, 3, m.soft, 22, 10);
  }
  // image strip
  y = 1460;
  ctx.fillStyle = grad;
  rr(ctx, 64, y, W - 128, 460, 20);
  // split text block
  y = 2010;
  bars(ctx, 64, y, 480, 5, m.soft, 26, 12);
  ctx.fillStyle = m.soft;
  rr(ctx, 640, y - 20, 496, 300, 16);
  // CTA band
  y = 2420;
  ctx.fillStyle = m.accent;
  rr(ctx, 64, y, W - 128, 260, 20);
  ctx.fillStyle = m.bg;
  rr(ctx, 120, y + 96, 420, 20, 10);
  rr(ctx, 120, y + 136, 280, 20, 10);
  // footer
  ctx.fillStyle = m.ink;
  ctx.globalAlpha = 0.08;
  ctx.fillRect(0, 2760, W, 240);
  ctx.globalAlpha = 1;
  setFont(ctx, 700, 22, 'expanded');
  ctx.fillStyle = m.ink;
  ctx.fillText(p.name, 64, 2850);
  return c.toDataURL('image/jpeg', 0.88);
}

// Portrait business card (Wallet-pass proportions) for the card page
function qr(ctx, x, y, size, seed, fg, bg) {
  const N = 25;
  const m = size / (N + 4);
  ctx.fillStyle = bg;
  ctx.fillRect(x, y, size, size);
  let s = seed || 7;
  const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  const inFinder = (i, j) => (i < 8 && j < 8) || (i >= N - 8 && j < 8) || (i < 8 && j >= N - 8);
  const ox = x + 2 * m, oy = y + 2 * m;
  ctx.fillStyle = fg;
  for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) if (!inFinder(i, j) && r() < 0.47) ctx.fillRect(ox + i * m, oy + j * m, m + 0.5, m + 0.5);
  const f = (fx, fy) => {
    ctx.fillStyle = fg;
    ctx.fillRect(ox + fx * m, oy + fy * m, 7 * m, 7 * m);
    ctx.fillStyle = bg;
    ctx.fillRect(ox + (fx + 1) * m, oy + (fy + 1) * m, 5 * m, 5 * m);
    ctx.fillStyle = fg;
    ctx.fillRect(ox + (fx + 2) * m, oy + (fy + 2) * m, 3 * m, 3 * m);
  };
  f(0, 0);
  f(N - 7, 0);
  f(0, N - 7);
}

export function drawCard(name, role, labels = { name: 'Votre nom', role: 'Votre métier', scan: ['Scannez pour', 'm’ajouter.'] }, W = 720, H = 1006) {
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const ctx = c.getContext('2d');
  const g = ctx.createLinearGradient(0, 0, W, H);
  g.addColorStop(0, '#11736D');
  g.addColorStop(1, '#0A3633');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  setFont(ctx, 500, 24, 'expanded');
  ctx.fillStyle = 'rgba(243,245,244,0.8)';
  ctx.fillText('Standout Studio', 56, 84);

  const clean = (name || '').trim() || labels.name;
  const parts = clean.split(/\s+/);
  const lines = parts.length > 1 ? [parts.slice(0, -1).join(' '), parts[parts.length - 1]] : [clean];
  let size = 104;
  for (; size > 40; size -= 4) {
    setFont(ctx, 400, size, 'expanded');
    if (Math.max(...lines.map(l => ctx.measureText(l).width)) <= W - 112) break;
  }
  setFont(ctx, 400, size, 'expanded');
  ctx.fillStyle = '#F3F5F4';
  let y = 330;
  lines.forEach(l => {
    ctx.fillText(l, 52, y);
    y += size * 1.0;
  });
  setFont(ctx, 400, 30);
  ctx.fillStyle = 'rgba(243,245,244,0.82)';
  ctx.fillText((role || '').trim() || labels.role, 56, y + 24);

  let seed = 0;
  for (const ch of clean) seed = (seed * 31 + ch.charCodeAt(0)) % 2147483646;
  qr(ctx, 56, H - 316, 250, seed + 1, '#0A3633', '#F3F5F4');
  setFont(ctx, 400, 24);
  ctx.fillStyle = 'rgba(243,245,244,0.82)';
  ctx.fillText(labels.scan[0], 336, H - 112);
  ctx.fillText(labels.scan[1], 336, H - 78);
  return c.toDataURL('image/png');
}

export async function loadFonts() {
  if (!document.fonts?.load) return;
  try {
    await Promise.race([
      document.fonts.ready,
      new Promise(r => setTimeout(r, 2500))
    ]);
  } catch {
    /* system fallback */
  }
}

// Case studies. Only what is known goes here: no invented metrics, no invented quotes.
// Sections that are not written yet are simply absent, so each case study has its own length.
// Text marked DRAFT is a first version to validate with the client before going live.
export const CASES = {
  caramello: {
    scope: { fr: 'Site vitrine, menu, réservations, paiement d’acompte', en: 'Showcase site, menu, bookings, deposit payments' },
    year: '2026',
    variant: 'split',
    sections: [
      {
        key: 'context',
        title: { fr: 'Le lieu', en: 'The place' },
        // DRAFT
        text: {
          fr: 'Un café et une boulangerie où les gens viennent autant pour l’ambiance que pour ce qu’il y a dans l’assiette. Le site devait donner la même envie de pousser la porte.',
          en: 'A café and bakery people visit as much for the room as for what’s on the plate. The site had to make you want to walk in, the same way.'
        }
      },
      {
        key: 'build',
        title: { fr: 'Ce qu’on a construit', en: 'What we built' },
        text: {
          fr: 'Un menu complet et facile à tenir à jour, une carte Google intégrée, un carrousel de photos, des formulaires de réservation qui envoient une confirmation au client et un avis au propriétaire, les réservations de tables via Cal.com, et un acompte de 20 $ payé par Stripe pour les événements.',
          en: 'A full menu that’s easy to keep current, an embedded Google map, a photo carousel, booking forms that email both the guest and the owner, table reservations through Cal.com, and a $20 Stripe deposit for event bookings.'
        }
      },
      {
        key: 'detail',
        title: { fr: 'Le détail qui compte', en: 'The detail that matters' },
        // DRAFT
        text: {
          fr: 'L’acompte. Une petite friction au bon endroit, qui transforme une réservation d’événement en engagement.',
          en: 'The deposit. A small bit of friction in the right place, turning an event booking into a commitment.'
        }
      }
    ]
  },
  sharp: {
    scope: { fr: 'Site de marque personnelle', en: 'Personal brand website' },
    year: '2026',
    variant: 'full',
    sections: [
      {
        key: 'context',
        title: { fr: 'La personne', en: 'The person' },
        // DRAFT
        text: {
          fr: 'Un coach qui ne laisse rien passer. Le site devait avoir la même énergie : direct, sans détour, avec un seul chemin vers le premier contact.',
          en: 'A coach who lets nothing slide. The site needed the same energy: direct, no detours, one clear path to getting in touch.'
        }
      }
    ]
  },
  rayann: {
    scope: { fr: 'Portfolio d’ingénierie', en: 'Engineering portfolio' },
    year: '2026',
    variant: 'center',
    sections: [
      {
        key: 'context',
        title: { fr: 'L’enjeu', en: 'The point' },
        // DRAFT
        text: {
          fr: 'Rendre des projets techniques lisibles pour quelqu’un qui recrute, en quelques secondes, sans rien simplifier à l’excès.',
          en: 'Make technical work readable for a recruiter in a few seconds, without dumbing anything down.'
        }
      }
    ]
  },
  steven: {
    scope: { fr: 'Portfolio personnel, deux pages', en: 'Personal portfolio, two pages' },
    year: '2026',
    variant: 'split',
    sections: [
      {
        key: 'context',
        title: { fr: 'Le parti pris', en: 'The stance' },
        text: {
          fr: 'Un site sombre et cinématographique en deux pages, pensé comme une salle de projection plutôt qu’un CV.',
          en: 'A dark, cinematic two-page site, built like a screening room rather than a résumé.'
        }
      },
      {
        key: 'build',
        title: { fr: 'Ce qu’on a construit', en: 'What we built' },
        text: {
          fr: 'Une scène en Three.js, des projets synchronisés automatiquement depuis GitHub, une galerie photo en maçonnerie avec visionneuse, trois langues (français, anglais, espagnol) et un travail poussé sur le mobile.',
          en: 'A Three.js scene, projects synced automatically from GitHub, a masonry photo gallery with a lightbox, three languages (English, French, Spanish) and serious work on mobile.'
        }
      }
    ]
  }
};

export function buildProjects() {
  return PROJECTS.map(p => ({ ...p, ...CASES[p.id], image: p.screenshot || (typeof document !== 'undefined' ? drawSiteMock(p) : '') }));
}
