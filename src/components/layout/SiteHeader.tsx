"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useLocale } from "@/components/i18n/LocaleProvider";

const HERO_PROGRESS_EVENT = "standout:hero-progress";

const SECTION_IDS = ["packages", "work", "faq", "contact"];

export function SiteHeader() {
  const { locale, setLocale, t } = useLocale();
  const [visible, setVisible] = useState(false);
  const [activeHref, setActiveHref] = useState<string>("");
  const visibleRef = useRef(false);
  const expandDoneRef = useRef(false);
  const armScrollYRef = useRef<number | null>(null);

  useEffect(() => {
    const setNav = (next: boolean) => {
      if (visibleRef.current === next) return;
      visibleRef.current = next;
      setVisible(next);
    };

    const onHeroProgress = (event: Event) => {
      const progress = (event as CustomEvent<{ progress: number }>).detail
        ?.progress;
      if (typeof progress !== "number") return;

      if (progress >= 0.98) {
        if (!expandDoneRef.current) {
          expandDoneRef.current = true;
          // Arm on the scroll position where expand finishes.
          // The next scroll past this point reveals the nav.
          armScrollYRef.current = window.scrollY;
        }
        return;
      }

      expandDoneRef.current = false;
      armScrollYRef.current = null;
      setNav(false);
    };

    const onScroll = () => {
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
    if (!Number.isNaN(existing) && existing >= 0.98) {
      expandDoneRef.current = true;
      armScrollYRef.current = window.scrollY;
      onScroll();
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
        // Closest section whose top has crossed the marker (page order, not nav order).
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

        <div
          className="flex items-center gap-1.5 text-[13px]"
          aria-label={t.ui.language}
        >
          <button
            type="button"
            onClick={() => setLocale("en")}
            className={
              locale === "en"
                ? "font-semibold text-ink"
                : "font-medium text-muted transition-colors hover:text-ink"
            }
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
            className={
              locale === "fr"
                ? "font-semibold text-ink"
                : "font-medium text-muted transition-colors hover:text-ink"
            }
            tabIndex={visible ? undefined : -1}
          >
            FR
          </button>
        </div>

        <Link
          href={t.nav.cta.href}
          tabIndex={visible ? undefined : -1}
          className="inline-flex h-9 items-center justify-center rounded-full bg-teal px-4 text-[13px] font-semibold text-inverse transition-colors hover:bg-teal-deep md:h-[38px] md:px-4"
        >
          {t.nav.cta.label}
        </Link>
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
