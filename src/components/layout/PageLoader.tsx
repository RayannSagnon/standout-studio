"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { Logo } from "@/components/brand/Logo";

export const BOOT_DONE_EVENT = "standout:boot-done";

/** Must match `@keyframes loader-bar-fill` duration in CSS. */
const BAR_MS = 1600;
/** Brief beat at 100% before the loader fades. */
const HOLD_FULL_MS = 100;
const FADE_MS = 320;

function markBootDone() {
  document.documentElement.classList.remove("is-booting");
  window.dispatchEvent(new Event(BOOT_DONE_EVENT));
}

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function prefersReducedMotion() {
  return window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

function subscribeReducedMotion(onChange: () => void) {
  const mq = window.matchMedia(REDUCED_MOTION_QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

function getReducedMotionServerSnapshot() {
  return false;
}

export function PageLoader() {
  const [runId, setRunId] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const [gone, setGone] = useState(false);

  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    prefersReducedMotion,
    getReducedMotionServerSnapshot,
  );

  useEffect(() => {
    if (reducedMotion) {
      markBootDone();
      return;
    }

    // pageshow resets leaving/gone before bumping runId.
    document.documentElement.classList.add("is-booting");

    let cancelled = false;
    const totalMs = BAR_MS + HOLD_FULL_MS;
    const leaveTimer = window.setTimeout(() => {
      if (cancelled) return;
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
  }, [runId, reducedMotion]);

  // Restart when the browser restores the page from bfcache.
  useEffect(() => {
    const onPageShow = (event: PageTransitionEvent) => {
      if (!event.persisted) return;
      if (prefersReducedMotion()) {
        markBootDone();
        return;
      }
      setGone(false);
      setLeaving(false);
      setRunId((id) => id + 1);
    };

    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, []);

  if (gone || reducedMotion) return null;

  return (
    <div
      key={runId}
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
