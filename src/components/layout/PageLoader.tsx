"use client";

import { useEffect, useState } from "react";
import { site } from "@/content/en";

const MIN_MS = 450;
const MAX_MS = 1100;

export function PageLoader() {
  const [leaving, setLeaving] = useState(false);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setGone(true);
      return;
    }

    document.documentElement.classList.add("is-booting");

    const started = performance.now();
    let finished = false;
    let maxTimer = 0;
    let exitTimer = 0;

    const exit = () => {
      if (finished) return;
      finished = true;
      const wait = Math.max(0, MIN_MS - (performance.now() - started));
      window.setTimeout(() => {
        setLeaving(true);
        exitTimer = window.setTimeout(() => {
          setGone(true);
          document.documentElement.classList.remove("is-booting");
        }, 320);
      }, wait);
    };

    const onReady = () => exit();

    if (document.readyState === "complete") {
      void document.fonts.ready.then(onReady);
    } else {
      window.addEventListener(
        "load",
        () => {
          void document.fonts.ready.then(onReady);
        },
        { once: true },
      );
    }

    maxTimer = window.setTimeout(exit, MAX_MS);

    return () => {
      window.clearTimeout(maxTimer);
      window.clearTimeout(exitTimer);
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
        <div className="page-loader__track h-px w-full overflow-hidden bg-white/15">
          <span className="page-loader__bar block h-full w-full origin-left bg-teal" />
        </div>
      </div>
    </div>
  );
}
