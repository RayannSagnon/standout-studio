'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import App from './App';
import { AuthProvider } from './auth/AuthContext';
import { LangProvider } from './i18n';
import { PROJECTS } from './projects';
import { routeFromPath, splitPath } from './router';

if (typeof window !== 'undefined') gsap.registerPlugin(ScrollTrigger);

const SLUGS = PROJECTS.map(p => p.slug);

// The whole site is one persistent client app (it owns the page transitions).
// It is rendered on the server too, from the URL, so every page has real HTML.
export default function SiteRoot() {
  const pathname = usePathname();
  // Only the first URL matters: after that the app navigates on its own.
  const [initial] = useState(() => {
    const { lang, rest } = splitPath(pathname);
    return { lang, route: routeFromPath(rest, SLUGS) };
  });

  return (
    <LangProvider initialLang={initial.lang}>
      <AuthProvider>
        <App initialRoute={initial.route} />
      </AuthProvider>
    </LangProvider>
  );
}
