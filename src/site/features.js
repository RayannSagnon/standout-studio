// The client area lives outside this app, at /client and /fr/client (real server pages).
// The header, menu and footer link to it once NEXT_PUBLIC_CLIENT_AREA=1 is set, that is
// when the real backend (Supabase) is connected.
export const ACCOUNTS_ENABLED = process.env.NEXT_PUBLIC_CLIENT_AREA === '1';

export const clientAreaHref = lang => (lang === 'fr' ? '/fr/client' : '/client');
