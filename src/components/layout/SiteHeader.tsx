"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { nav, site } from "@/content/en";

const HERO_PROGRESS_EVENT = "standout:hero-progress";

export function SiteHeader() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const apply = (progress: number) => {
      // Stay hidden through the resting ScrollExpand frame and the open-up scrub.
      // Only show once the hero is fully expanded into the live stage.
      setVisible(progress >= 0.98);
    };

    const onHeroProgress = (event: Event) => {
      const progress = (event as CustomEvent<{ progress: number }>).detail
        ?.progress;
      if (typeof progress === "number") apply(progress);
    };

    window.addEventListener(HERO_PROGRESS_EVENT, onHeroProgress);

    const existing = Number(
      document.documentElement.dataset.heroProgress ?? "0",
    );
    if (!Number.isNaN(existing)) apply(existing);

    return () => {
      window.removeEventListener(HERO_PROGRESS_EVENT, onHeroProgress);
    };
  }, []);

  return (
    <header
      className={[
        "fixed inset-x-0 top-0 z-50 border-b border-border/70 bg-page/95 backdrop-blur-sm transition-[transform,opacity] duration-500 ease-out",
        visible
          ? "translate-y-0 opacity-100"
          : "pointer-events-none -translate-y-full opacity-0",
      ].join(" ")}
      aria-hidden={!visible}
    >
      <div className="mx-auto flex h-14 max-w-[1440px] items-center gap-4 px-5 md:h-20 md:gap-6 md:px-20">
        <Link
          href="/"
          className="font-display text-[18px] font-semibold tracking-tight text-ink md:text-[22px]"
          tabIndex={visible ? undefined : -1}
        >
          {site.name}
        </Link>

        <div className="flex-1" aria-hidden="true" />

        <nav
          className="hidden items-center gap-6 lg:flex"
          aria-label="Primary"
        >
          {nav.links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              tabIndex={visible ? undefined : -1}
              className="text-sm font-medium text-muted transition-colors hover:text-ink"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div
          className="flex items-center gap-1.5 text-[13px]"
          aria-label="Language"
        >
          <span className="font-semibold text-ink">{site.localeLabel.active}</span>
          <span className="text-muted" aria-hidden="true">
            |
          </span>
          <button
            type="button"
            className="font-medium text-muted transition-colors hover:text-ink"
            disabled
            title="Coming soon"
            tabIndex={visible ? undefined : -1}
          >
            {site.localeLabel.inactive}
          </button>
        </div>

        <Link
          href={nav.cta.href}
          tabIndex={visible ? undefined : -1}
          className="inline-flex h-9 items-center justify-center rounded-full bg-teal px-4 text-[13px] font-semibold text-inverse transition-colors hover:bg-teal-deep md:h-[38px] md:px-4"
        >
          {nav.cta.label}
        </Link>
      </div>
    </header>
  );
}

export function publishHeroProgress(progress: number) {
  if (typeof window === "undefined") return;
  document.documentElement.dataset.heroProgress = String(progress);
  window.dispatchEvent(
    new CustomEvent(HERO_PROGRESS_EVENT, { detail: { progress } }),
  );
}
