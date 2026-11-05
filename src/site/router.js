// Router for the real site. English lives at the root, French under /fr:
//   /, /work, /work/:slug, /services, /about, /contact, /card, /login, /account
//   /fr, /fr/work, /fr/work/:slug, ...
// Navigation stays inside the app (history.pushState) so the page transitions can run.

export const PAGES = ['home', 'work', 'case', 'services', 'about', 'contact', 'card', 'login', 'account', 'notfound'];
const PATHS = { home: '/', work: '/work', services: '/services', about: '/about', contact: '/contact', card: '/card', login: '/login', account: '/account' };

// Old anchors from the prototype keep working
const ALIASES = { accueil: 'home', realisations: 'work', approche: 'about', carte: 'card', connexion: 'login', compte: 'account', travaux: 'work' };

export const keyOf = r => (r.name === 'case' ? `case:${r.slug}` : r.name);
export const same = (a, b) => keyOf(a) === keyOf(b);

// The current language is set once by LangProvider and read here, so `href()` stays a plain function.
let currentLang = 'en';
export const setRouterLang = lang => {
  currentLang = lang === 'fr' ? 'fr' : 'en';
};

const prefix = lang => (lang === 'fr' ? '/fr' : '');

export function pathFor(route, lang = currentLang) {
  const base = route.name === 'case' ? `/work/${route.slug}` : PATHS[route.name] || '/';
  const p = prefix(lang);
  if (!p) return base;
  return base === '/' ? p : `${p}${base}`;
}

export function href(name, slug, lang = currentLang) {
  return pathFor({ name, slug }, lang);
}

// Splits "/fr/work/x" into { lang: 'fr', rest: '/work/x' }
export function splitPath(pathname) {
  const p = (pathname || '/').replace(/\/+$/, '') || '/';
  if (p === '/fr') return { lang: 'fr', rest: '/' };
  if (p.startsWith('/fr/')) return { lang: 'fr', rest: p.slice(3) };
  return { lang: 'en', rest: p };
}

// Path (without language) to a route; unknown paths show the not-found page
export function routeFromPath(rest, slugs = []) {
  const m = rest.match(/^\/work\/([a-z0-9-]+)$/);
  if (m && slugs.includes(m[1])) return { name: 'case', slug: m[1] };
  const name = Object.keys(PATHS).find(k => PATHS[k] === rest);
  return { name: name || 'notfound' };
}

export function parse(slugs = []) {
  const { rest } = splitPath(window.location.pathname);
  const h = decodeURIComponent(window.location.hash.replace(/^#/, ''));
  if (rest === '/' && h) {
    if (h.startsWith('work-') && slugs.includes(h.slice(5))) return { name: 'case', slug: h.slice(5) };
    const name = ALIASES[h] || h;
    if (PAGES.includes(name) && name !== 'case') return { name };
  }
  return routeFromPath(rest, slugs);
}

// Resolve an <a href> to a route (or null for external / non-route links)
export function fromHref(value, slugs = []) {
  if (!value || !value.startsWith('/') || value.startsWith('//')) return null;
  const { rest } = splitPath(value.split(/[?#]/)[0]);
  const m = rest.match(/^\/work\/([a-z0-9-]+)$/);
  if (m) return slugs.includes(m[1]) ? { name: 'case', slug: m[1] } : null;
  const name = Object.keys(PATHS).find(k => PATHS[k] === rest);
  return name ? { name } : null;
}

export function commit(route, lang = currentLang, replace = false) {
  const url = pathFor(route, lang);
  if (window.location.pathname === url && !window.location.hash) return;
  if (replace) window.history.replaceState(window.history.state, '', url);
  else window.history.pushState(window.history.state, '', url);
}

export function listen(cb) {
  window.addEventListener('popstate', cb);
  return () => window.removeEventListener('popstate', cb);
}
