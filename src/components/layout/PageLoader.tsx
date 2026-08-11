"use client";

import { useEffect, useState } from "react";
import { Logo } from "@/components/brand/Logo";

export const BOOT_DONE_EVENT = "standout:boot-done";
const SEEN_KEY = "standout-loader-seen";

/** Must match `--loader-bar-ms` / `@keyframes loader-bar-fill` in CSS. */
const BAR_MS = 2400;
/** Brief beat at 100% before the loader fades. */
const HOLD_FULL_MS = 120;
const FADE_MS = 380;

function markBootDone() {
  document.documentElement.classList.remove("is-booting");
  window.dispatchEvent(new Event(BOOT_DONE_EVENT));
}

export function PageLoader() {
  // pending: wait until we know whether to show (avoids empty-bar flash when skipped)
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const seen = sessionStorage.getItem(SEEN_KEY) === "1";
    // In production, show once per tab session. In local/dev, always show so you can tune it.
    const skip = reduce || (process.env.NODE_ENV === "production" && seen);

    if (skip) {
      setGone(true);
      markBootDone();
      return;
    }

    document.documentElement.classList.add("is-booting");
    setVisible(true);

    let cancelled = false;
    const totalMs = BAR_MS + HOLD_FULL_MS;
    const leaveTimer = window.setTimeout(() => {
      if (cancelled) return;
      sessionStorage.setItem(SEEN_KEY, "1");
      // Reveal hero title as the loader starts fading, not after it is gone.
      markBootDone();
      setLeaving(true);
      window.setTimeout(() => {
        if (cancelled) return;
        setGone(true);
      }, FADE_MS);
    }, totalMs);

    return () => {
      cancelled = true;
      window.clearTimeout(leaveTimer);
    };
  }, []);

  if (gone || !visible) return null;

  return (
    <div
      className={[
        "page-loader fixed inset-0 z-[200] flex items-center justify-center bg-hero text-inverse",
        leaving ? "page-loader--leave" : "",
      ].join(" ")}
      aria-hidden="true"
    >
      <div className="page-loader__inner flex w-[min(72vw,280px)] flex-col items-center gap-5">
        <div className="page-loader__mark">
          <Logo theme="inverse" layout="vertical" markSize={48} />
        </div>
        <div className="page-loader__track relative h-[3px] w-full overflow-hidden rounded-full bg-white/25">
          <span className="page-loader__bar page-loader__bar--run absolute inset-y-0 left-0 rounded-full bg-white" />
        </div>
      </div>
    </div>
  );
}
