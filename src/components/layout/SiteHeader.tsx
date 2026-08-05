"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { useLocale } from "@/components/i18n/LocaleProvider";

const HERO_PROGRESS_EVENT = "standout:hero-progress";

const SECTION_IDS = ["packages", "work", "faq", "contact"];

function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      {open ? (
        <path
          d="M6 6l12 12M18 6L6 18"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      ) : (
        <path
          d="M4 7h16M4 12h16M4 17h16"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      )}
    </svg>
  );
}

export function SiteHeader() {
  const { locale, setLocale, t } = useLocale();
  const [visible, setVisible] = useState(false);
  const [activeHref, setActiveHref] = useState<string>("");
  const [menuOpen, setMenuOpen] = useState(false);
  const visibleRef = useRef(false);
  const expandDoneRef = useRef(false);
  const armScrollYRef = useRef<number | null>(null);
  const menuId = useId();

  useEffect(() => {
    const setNav = (next: boolean) => {
      if (visibleRef.current === next) return;
      visibleRef.current = next;
      setVisible(next);
      if (!next) setMenuOpen(false);
    };

    const isCompact = () => window.matchMedia("(max-width: 1023px)").matches;

    const onHeroProgress = (event: Event) => {
      const progress = (event as CustomEvent<{ progress: number }>).detail
        ?.progress;
      if (typeof progress !== "number") return;

      // Mobile/tablet: reveal earlier so lang + menu are reachable.
      if (isCompact() && progress >= 0.5) {
        setNav(true);
      }

      if (progress >= 0.98) {
        if (!expandDoneRef.current) {
          expandDoneRef.current = true;
          armScrollYRef.current = window.scrollY;
        }
        if (isCompact()) setNav(true);
        return;
      }

      expandDoneRef.current = false;
      armScrollYRef.current = null;
      if (!isCompact() || progress < 0.5) setNav(false);
    };

    const onScroll = () => {
      if (isCompact() && expandDoneRef.current) {
        setNav(true);
        return;
      }
      if (!expandDoneRef.current || visibleRef.current) return;
      const armed = armScrollYRef.current;
      if (armed == null) return;
      if (window.scrollY > armed + 16) setNav(true);
    };

    window.addEventListener(HERO_PROGRESS_EVENT, onHeroProgress);
    window.addEventListener("scroll", onScroll, { passive: true });

    const existing = Number(
      document.documentElement.dataset.heroProgress ?? "0",
    );
    if (!Number.isNaN(existing)) {
      if (isCompact() && existing >= 0.5) setNav(true);
      if (existing >= 0.98) {
        expandDoneRef.current = true;
        armScrollYRef.current = window.scrollY;
        onScroll();
      }
    }

    return () => {
      window.removeEventListener(HERO_PROGRESS_EVENT, onHeroProgress);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  useEffect(() => {
    let raf = 0;

    const updateActive = () => {
      raf = 0;
      const marker = Math.min(120, Math.round(window.innerHeight * 0.22));
      const nearBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 48;

      if (nearBottom) {
        setActiveHref("#contact");
        return;
      }

      let current = "";
      let bestTop = Number.NEGATIVE_INFINITY;
      for (const id of SECTION_IDS) {
        const el = document.getElementById(id);
        if (!el) continue;
        const top = el.getBoundingClientRect().top;
        if (top <= marker && top >= bestTop) {
          bestTop = top;
          current = id;
        }
      }

      setActiveHref(current ? `#${current}` : "");
    };

    const onScrollOrResize = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(updateActive);
    };

    updateActive();
    window.addEventListener("scroll", onScrollOrResize, { passive: true });
    window.addEventListener("resize", onScrollOrResize);

    return () => {
      if (raf) window.cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScrollOrResize);
      window.removeEventListener("resize", onScrollOrResize);
    };
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  const langButtons = (
    <div
      className="flex items-center gap-0.5 text-[13px]"
      aria-label={t.ui.language}
    >
      <button
        type="button"
        onClick={() => setLocale("en")}
        className={[
          "inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg",
          locale === "en"
            ? "font-semibold text-ink"
            : "font-medium text-muted transition-colors hover:text-ink",
        ].join(" ")}
        tabIndex={visible ? undefined : -1}
      >
        EN
      </button>
      <span className="text-muted" aria-hidden="true">
        |
      </span>
      <button
        type="button"
        onClick={() => setLocale("fr")}
        className={[
          "inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg",
          locale === "fr"
            ? "font-semibold text-ink"
            : "font-medium text-muted transition-colors hover:text-ink",
        ].join(" ")}
        tabIndex={visible ? undefined : -1}
      >
        FR
      </button>
    </div>
  );

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
      <div className="mx-auto flex h-14 max-w-[1440px] items-center gap-3 px-5 md:h-20 md:gap-6 md:px-20">
        <Link
          href="/"
          className="min-w-0 truncate font-display text-[18px] font-semibold tracking-tight text-ink md:text-[22px]"
          tabIndex={visible ? undefined : -1}
          onClick={() => setMenuOpen(false)}
        >
          {t.site.name}
        </Link>

        <div className="flex-1" aria-hidden="true" />

        <nav
          className="hidden items-center gap-6 lg:flex"
          aria-label={t.ui.primaryNav}
        >
          {t.nav.links.map((link) => {
            const active = activeHref === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                tabIndex={visible ? undefined : -1}
                aria-current={active ? "true" : undefined}
                className={[
                  "relative text-sm font-medium transition-colors",
                  active ? "text-teal" : "text-muted hover:text-ink",
                ].join(" ")}
              >
                {link.label}
                <span
                  aria-hidden="true"
                  className={[
                    "absolute -bottom-1 left-0 h-[2px] w-full origin-left rounded-full bg-teal transition-transform duration-300",
                    active ? "scale-x-100" : "scale-x-0",
                  ].join(" ")}
                />
              </Link>
            );
          })}
        </nav>

        <div className="hidden sm:block">{langButtons}</div>

        <Link
          href={t.nav.cta.href}
          tabIndex={visible ? undefined : -1}
          onClick={() => setMenuOpen(false)}
          className="inline-flex h-9 items-center justify-center rounded-full bg-teal px-3 text-[13px] font-semibold text-inverse transition-colors hover:bg-teal-deep sm:px-4 md:h-[38px]"
        >
          <span className="sm:hidden">{t.nav.cta.shortLabel}</span>
          <span className="hidden sm:inline">{t.nav.cta.label}</span>
        </Link>

        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-ink lg:hidden"
          aria-expanded={menuOpen}
          aria-controls={menuId}
          aria-label={menuOpen ? t.ui.menuClose : t.ui.menuOpen}
          tabIndex={visible ? undefined : -1}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <MenuIcon open={menuOpen} />
        </button>
      </div>

      <div
        id={menuId}
        hidden={!menuOpen}
        className={[
          "border-t border-border/70 bg-page lg:hidden",
          menuOpen ? "block" : "hidden",
        ].join(" ")}
      >
        <nav
          className="mx-auto flex max-w-[1440px] flex-col gap-1 px-5 py-4"
          aria-label={t.ui.primaryNav}
        >
          {t.nav.links.map((link) => {
            const active = activeHref === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                aria-current={active ? "true" : undefined}
                className={[
                  "rounded-xl px-3 py-3 text-base font-medium transition-colors",
                  active
                    ? "bg-teal/10 text-teal"
                    : "text-ink hover:bg-page",
                ].join(" ")}
              >
                {link.label}
              </Link>
            );
          })}
          <div className="mt-2 border-t border-border/70 pt-2 sm:hidden">
            {langButtons}
          </div>
        </nav>
      </div>
    </header>
  );
}

export function publishHeroProgress(progress: number) {
  if (typeof window === "undefined") return;
  const rounded = Math.round(progress * 100) / 100;
  const prev = Number(document.documentElement.dataset.heroProgress ?? "-1");
  if (Math.abs(prev - rounded) < 0.02) return;
  document.documentElement.dataset.heroProgress = String(rounded);
  window.dispatchEvent(
    new CustomEvent(HERO_PROGRESS_EVENT, { detail: { progress: rounded } }),
  );
}
