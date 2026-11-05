// Shared motion helpers. Rule of the house:
//   signature (hero sequence, menu iris, page curtain, viewing room)
//   > section transitions (dot iris, rule + wipe reveals, scroll-linked type)
//   > micro-interactions (dot buttons, underline draw, hover offsets).
// Everything is transform / opacity / clip-path; nothing loops in JS unless it is visible and moving.

export const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Brand easing: a long, confident deceleration
export const EASE = 'expo.out';
export const EASE_IO = 'expo.inOut';

// One IntersectionObserver for every [data-reveal] element on the current page.
// CSS owns the actual transitions (see "Reveal system" in styles.css).
export function observeReveals(root = document) {
  const els = root.querySelectorAll('[data-reveal]:not(.is-in)');
  if (reduceMotion() || !('IntersectionObserver' in window)) {
    els.forEach(el => el.classList.add('is-in'));
    return () => {};
  }
  // A fully clipped element has no visible area, so IntersectionObserver would never report it.
  // Watch each element's parent instead and reveal its children from there.
  const groups = new Map();
  els.forEach(el => {
    const target = el.parentElement || el;
    if (!groups.has(target)) groups.set(target, []);
    groups.get(target).push(el);
  });
  const io = new IntersectionObserver(
    entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          (groups.get(e.target) || []).forEach(el => el.classList.add('is-in'));
          io.unobserve(e.target);
        }
      });
    },
    { rootMargin: '0px 0px -12% 0px', threshold: 0 }
  );
  groups.forEach((_, target) => io.observe(target));
  return () => io.disconnect();
}

// Splits a label into per-character spans (keeps spaces), for typographic transitions
export function splitChars(el, text) {
  el.textContent = '';
  const spans = [];
  [...text].forEach(ch => {
    const s = document.createElement('span');
    s.className = 'ch';
    s.textContent = ch === ' ' ? '\u00A0' : ch;
    el.appendChild(s);
    spans.push(s);
  });
  return spans;
}

