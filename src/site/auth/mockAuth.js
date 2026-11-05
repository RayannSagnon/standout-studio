// Mock auth service. Every function returns a Promise with the same shape the real
// backend should return, so the UI won't change when you plug the API in.
//
// Suggested API contract (shared by standoutstudio.ca and cards.standoutstudio.ca):
//   POST /api/auth/login        { email, password }  -> { user }   + Set-Cookie: session (httpOnly, Secure, Domain=.standoutstudio.ca)
//   POST /api/auth/logout                            -> 204          (clears the cookie)
//   GET  /api/auth/me                                -> { user } | 401
//   POST /api/auth/password-reset { email }          -> 202          (always 202, never reveals whether the account exists)
//   GET  /api/client/dashboard                       -> { project, care, card, invoices, activity }
//   POST /api/client/requests   { message }          -> { request }
//
// The mock keeps a fake session in localStorage only for the demo. The real session
// should live in an httpOnly cookie, never in localStorage.

const KEY = 'standout.demo.session';
const wait = ms => new Promise(r => setTimeout(r, ms));

export const DEMO_CREDENTIALS = { email: 'client@demo.ca', password: 'demo1234' };

const DEMO_USER = {
  id: 'usr_demo',
  firstName: 'Camille',
  lastName: 'Roy',
  email: DEMO_CREDENTIALS.email,
  role: { fr: 'Coach en leadership', en: 'Leadership coach' },
  package: { fr: 'Croissance', en: 'Growth' },
  clientSince: '2026-10-02',
  isStandoutClient: true
};

export class AuthError extends Error {
  constructor(code) {
    super(code);
    this.code = code; // translated in the UI (login.errors[code])
  }
}

export function restoreSession() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export async function login(email, password) {
  await wait(700);
  const ok = email.trim().toLowerCase() === DEMO_CREDENTIALS.email && password === DEMO_CREDENTIALS.password;
  if (!ok) throw new AuthError('invalid_credentials');
  const session = { user: DEMO_USER, issuedAt: Date.now() };
  try {
    localStorage.setItem(KEY, JSON.stringify(session));
  } catch {
    /* private mode: session lasts for this tab only */
  }
  return session;
}

export async function logout() {
  await wait(250);
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}

export async function requestPasswordReset() {
  await wait(700);
  return true;
}

export async function getDashboard() {
  await wait(450);
  return {
    project: {
      name: { fr: 'Site de Camille Roy', en: 'Camille Roy’s website' },
      package: { fr: 'Croissance', en: 'Growth' },
      steps: [
        { key: 'call', label: { fr: 'Appel', en: 'Call' }, date: '2026-10-02', done: true },
        { key: 'brief', label: { fr: 'Brief', en: 'Brief' }, date: '2026-10-09', done: true },
        { key: 'build', label: { fr: 'Création', en: 'Build' }, date: null, current: true },
        { key: 'launch', label: { fr: 'Lancement', en: 'Launch' }, date: null }
      ],
      revision: { used: 2, total: 3 },
      nextAction: { fr: 'Vos commentaires sur la version 2, d’ici le 7 novembre.', en: 'Your feedback on version 2, by November 7.' }
    },
    care: { status: 'pending', price: 39, note: { fr: 'S’active au lancement de votre site.', en: 'Starts when your website launches.' } },
    card: { tier: 'premium', note: { fr: 'Premium inclus pour les clients Standout.', en: 'Premium included for Standout clients.' } },
    invoices: [
      { id: 'F-2026-014', label: { fr: 'Forfait Croissance, 1er versement', en: 'Growth package, first instalment' }, amount: 649.5, status: 'paid', date: '2026-10-09' },
      { id: 'F-2026-019', label: { fr: 'Forfait Croissance, solde', en: 'Growth package, balance' }, amount: 649.5, status: 'due', date: null }
    ],
    activity: [
      { id: 'a5', date: '2026-10-29', text: { fr: 'Version 2 partagée. Le lien de prévisualisation est à jour.', en: 'Version 2 shared. The preview link is up to date.' }, by: 'studio' },
      { id: 'a4', date: '2026-10-24', text: { fr: 'Vos commentaires sur la version 1 sont reçus.', en: 'Your feedback on version 1 is in.' }, by: 'client' },
      { id: 'a3', date: '2026-10-21', text: { fr: 'Version 1 partagée.', en: 'Version 1 shared.' }, by: 'studio' },
      { id: 'a2', date: '2026-10-09', text: { fr: 'Brief validé : 4 pages, bilingue, formulaire de réservation.', en: 'Brief agreed: 4 pages, bilingual, booking form.' }, by: 'studio' },
      { id: 'a1', date: '2026-10-02', text: { fr: 'Appel de démarrage.', en: 'Kickoff call.' }, by: 'studio' }
    ]
  };
}

export async function sendRequest(message) {
  await wait(600);
  return { id: `r${Date.now()}`, date: new Date().toISOString().slice(0, 10), text: message, by: 'client' };
}
