"use client";

import { useEffect, useRef, useState } from "react";

type CursorMode =
  | "default"
  | "hero"
  | "trust"
  | "services"
  | "work"
  | "packages"
  | "why"
  | "marquee"
  | "process"
  | "testimonials"
  | "about"
  | "faq"
  | "contact";

function syncClasses(
  node: HTMLDivElement | null,
  mode: CursorMode,
  hovering: boolean,
  pressing: boolean,
) {
  if (!node) return;
  node.className = [
    node.dataset.baseClass,
    hovering ? "is-hover" : "",
    pressing ? "is-press" : "",
    `mode-${mode}`,
  ]
    .filter(Boolean)
    .join(" ");
}

export function SectionCursor() {
  const coreRef = useRef<HTMLDivElement>(null);
  const accentRef = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: -100, y: -100 });
  const modeRef = useRef<CursorMode>("default");
  const hoverRef = useRef(false);
  const pressRef = useRef(false);
  const [enabled, setEnabled] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(
      "(pointer: fine) and (hover: hover) and (prefers-reduced-motion: no-preference)",
    );
    const sync = () => setEnabled(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!enabled) return;

    document.documentElement.classList.add("has-section-cursor");

    if (coreRef.current) {
      coreRef.current.dataset.baseClass =
        "section-cursor-core absolute left-0 top-0";
    }
    if (accentRef.current) {
      accentRef.current.dataset.baseClass =
        "section-cursor-accent absolute left-0 top-0";
    }
    syncClasses(coreRef.current, modeRef.current, hoverRef.current, pressRef.current);
    syncClasses(accentRef.current, modeRef.current, hoverRef.current, pressRef.current);

    let frame = 0;
    let running = false;
    let idleTimer = 0;

    const paint = () => {
      const { x, y } = pos.current;
      const pressScale = pressRef.current ? 0.82 : 1;
      // Center hotspot in the same transform as the move — avoids CSS translate drift.
      const t = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%) scale(${pressScale})`;
      if (coreRef.current) coreRef.current.style.transform = t;
      if (accentRef.current) accentRef.current.style.transform = t;
    };

    const stop = () => {
      running = false;
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
    };

    const tick = () => {
      paint();
      stop();
    };

    const kick = () => {
      paint();
      if (running) return;
      running = true;
      frame = requestAnimationFrame(tick);
    };

    const applyState = () => {
      syncClasses(coreRef.current, modeRef.current, hoverRef.current, pressRef.current);
      syncClasses(accentRef.current, modeRef.current, hoverRef.current, pressRef.current);
    };

    const onMove = (event: MouseEvent) => {
      pos.current = { x: event.clientX, y: event.clientY };
      setVisible((prev) => (prev ? prev : true));
      kick();

      window.clearTimeout(idleTimer);
      idleTimer = window.setTimeout(stop, 160);

      const target = event.target as HTMLElement | null;
      const interactive = Boolean(
        target?.closest(
          "a, button, input, textarea, select, label, [role='button'], [data-plan]",
        ),
      );
      const section = target?.closest<HTMLElement>("[data-cursor]");
      const next =
        (section?.dataset.cursor as CursorMode | undefined) || "default";

      let dirty = false;
      if (hoverRef.current !== interactive) {
        hoverRef.current = interactive;
        dirty = true;
      }
      if (modeRef.current !== next) {
        modeRef.current = next;
        dirty = true;
      }
      if (dirty) applyState();
    };

    const onDown = () => {
      pressRef.current = true;
      applyState();
      kick();
    };

    const onUp = () => {
      pressRef.current = false;
      applyState();
      kick();
    };

    const onLeave = () => {
      setVisible(false);
      pressRef.current = false;
      stop();
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("mouseleave", onLeave);

    return () => {
      document.documentElement.classList.remove("has-section-cursor");
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("mouseleave", onLeave);
      window.clearTimeout(idleTimer);
      stop();
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div
      className={[
        "section-cursor pointer-events-none fixed inset-0 z-[100] hidden md:block",
        visible ? "is-visible" : "",
      ].join(" ")}
      aria-hidden="true"
    >
      <div ref={accentRef} className="section-cursor-accent absolute left-0 top-0" />
      <div ref={coreRef} className="section-cursor-core absolute left-0 top-0" />
    </div>
  );
}
