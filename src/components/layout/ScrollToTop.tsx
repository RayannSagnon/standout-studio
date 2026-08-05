"use client";

import { useEffect } from "react";

const HEADER_OFFSET = 72;

function scrollToId(id: string, behavior: ScrollBehavior = "smooth") {
  const el = document.getElementById(id);
  if (!el) return false;
  const top = window.scrollY + el.getBoundingClientRect().top - HEADER_OFFSET;
  window.scrollTo({ top: Math.max(0, top), behavior });
  return true;
}

export function ScrollToTop() {
  useEffect(() => {
    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }

    const hash = window.location.hash.slice(1);
    if (hash) {
      // Wait for layout / page loader, then land on the deep link.
      const go = () => scrollToId(hash, "instant");
      requestAnimationFrame(() => {
        go();
        window.setTimeout(go, 450);
        window.setTimeout(go, 1100);
      });
    } else {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }

    // CSS scroll-behavior:smooth fights the hero scrub — handle anchors in JS.
    const onClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const link = target.closest("a[href^='#']");
      if (!(link instanceof HTMLAnchorElement)) return;
      const id = link.getAttribute("href")?.slice(1);
      if (!id) return;
      if (!document.getElementById(id)) return;
      event.preventDefault();
      scrollToId(id, "smooth");
      history.pushState(null, "", `#${id}`);
    };

    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return null;
}
