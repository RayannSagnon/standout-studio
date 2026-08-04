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
) {
  if (!node) return;
  node.className = [
    node.dataset.baseClass,
    hovering ? "is-hover" : "",
    `mode-${mode}`,
  ]
    .filter(Boolean)
    .join(" ");
}

export function SectionCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: -100, y: -100 });
  const ring = useRef({ x: -100, y: -100 });
  const modeRef = useRef<CursorMode>("default");
  const hoverRef = useRef(false);
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

    if (dotRef.current) {
      dotRef.current.dataset.baseClass =
        "section-cursor-dot absolute left-0 top-0";
    }
    if (ringRef.current) {
      ringRef.current.dataset.baseClass =
        "section-cursor-ring absolute left-0 top-0";
    }
    syncClasses(dotRef.current, modeRef.current, hoverRef.current);
    syncClasses(ringRef.current, modeRef.current, hoverRef.current);

    let frame = 0;
    let running = false;
    let idleTimer = 0;

    const stop = () => {
      running = false;
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
    };

    const tick = () => {
      ring.current.x += (pos.current.x - ring.current.x) * 0.45;
      ring.current.y += (pos.current.y - ring.current.y) * 0.45;

      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${pos.current.x}px, ${pos.current.y}px, 0)`;
      }
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ring.current.x}px, ${ring.current.y}px, 0)`;
      }

      const dx = pos.current.x - ring.current.x;
      const dy = pos.current.y - ring.current.y;
      if (dx * dx + dy * dy < 0.05) {
        stop();
        return;
      }

      frame = requestAnimationFrame(tick);
    };

    const kick = () => {
      if (running) return;
      running = true;
      frame = requestAnimationFrame(tick);
    };

    const onMove = (event: MouseEvent) => {
      pos.current = { x: event.clientX, y: event.clientY };
      setVisible((prev) => (prev ? prev : true));
      kick();

      window.clearTimeout(idleTimer);
      idleTimer = window.setTimeout(stop, 120);

      const target = event.target as HTMLElement | null;
      const interactive = Boolean(
        target?.closest(
          "a, button, input, textarea, select, label, [role='button']",
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
      if (dirty) {
        syncClasses(dotRef.current, modeRef.current, hoverRef.current);
        syncClasses(ringRef.current, modeRef.current, hoverRef.current);
      }
    };

    const onLeave = () => {
      setVisible(false);
      stop();
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mouseleave", onLeave);

    return () => {
      document.documentElement.classList.remove("has-section-cursor");
      window.removeEventListener("mousemove", onMove);
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
      <div ref={dotRef} className="section-cursor-dot absolute left-0 top-0" />
      <div ref={ringRef} className="section-cursor-ring absolute left-0 top-0" />
    </div>
  );
}
