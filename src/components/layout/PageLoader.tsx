"use client";

import { useEffect, useState } from "react";
import { useContent } from "@/components/i18n/LocaleProvider";

const MIN_MS = 480;
const MAX_MS = 900;
const FADE_MS = 280;
const SEEN_KEY = "standout-loader-seen";

export function PageLoader() {
  const { site } = useContent();
  const [leaving, setLeaving] = useState(false);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const seen = sessionStorage.getItem(SEEN_KEY) === "1";
    if (reduce || seen) {
      setGone(true);
      return;
    }

    document.documentElement.classList.add("is-booting");

    const started = performance.now();
    let finished = false;
    let maxTimer = 0;
    let exitTimer = 0;
    let leaveTimer = 0;

    const exit = () => {
      if (finished) return;
      finished = true;
      sessionStorage.setItem(SEEN_KEY, "1");
      const wait = Math.max(0, MIN_MS - (performance.now() - started));
      leaveTimer = window.setTimeout(() => {
        setLeaving(true);
        exitTimer = window.setTimeout(() => {
          setGone(true);
          document.documentElement.classList.remove("is-booting");
        }, FADE_MS);
      }, wait);
    };

    if (document.readyState === "complete") {
      exit();
    } else {
      window.addEventListener("load", exit, { once: true });
    }

    maxTimer = window.setTimeout(exit, MAX_MS);

    return () => {
      window.clearTimeout(maxTimer);
      window.clearTimeout(exitTimer);
      window.clearTimeout(leaveTimer);
      document.documentElement.classList.remove("is-booting");
    };
  }, []);

  if (gone) return null;

  return (
    <div
      className={[
        "page-loader fixed inset-0 z-[200] flex items-center justify-center bg-hero text-inverse",
        leaving ? "page-loader--leave" : "",
      ].join(" ")}
      aria-hidden="true"
    >
      <div className="page-loader__inner flex w-[min(72vw,280px)] flex-col items-center gap-5">
        <p className="page-loader__mark font-display text-[22px] font-semibold tracking-tight md:text-[26px]">
          {site.name}
        </p>
        <div className="page-loader__track h-[2px] w-full overflow-hidden rounded-full bg-white/20">
          <span className="page-loader__bar block h-full w-full origin-left rounded-full bg-white" />
        </div>
      </div>
    </div>
  );
}
