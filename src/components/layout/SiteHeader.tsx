"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { nav, site } from "@/content/en";

export function SiteHeader() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (window.scrollY > 8) {
      setVisible(true);
      return;
    }

    const reveal = () => {
      if (window.scrollY <= 8) return;
      setVisible(true);
      window.removeEventListener("scroll", reveal);
    };

    window.addEventListener("scroll", reveal, { passive: true });
    return () => window.removeEventListener("scroll", reveal);
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
