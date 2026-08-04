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

export function SectionCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: 0, y: 0 });
  const ring = useRef({ x: 0, y: 0 });
  const [mode, setMode] = useState<CursorMode>("default");
  const [visible, setVisible] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [hoveringLink, setHoveringLink] = useState(false);

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

    let frame = 0;

    const onMove = (event: MouseEvent) => {
      pos.current = { x: event.clientX, y: event.clientY };
      setVisible(true);

      const target = event.target as HTMLElement | null;
      const interactive = Boolean(
        target?.closest(
          "a, button, input, textarea, select, label, [role='button']",
        ),
      );
      setHoveringLink(interactive);

      const section = target?.closest<HTMLElement>("[data-cursor]");
      const next = (section?.dataset.cursor as CursorMode | undefined) || "default";
      setMode((prev) => (prev === next ? prev : next));
    };

    const onLeave = () => setVisible(false);

    const tick = () => {
      ring.current.x += (pos.current.x - ring.current.x) * 0.18;
      ring.current.y += (pos.current.y - ring.current.y) * 0.18;

      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${pos.current.x}px, ${pos.current.y}px, 0)`;
      }
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ring.current.x}px, ${ring.current.y}px, 0)`;
      }
      frame = requestAnimationFrame(tick);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mouseleave", onLeave);
    frame = requestAnimationFrame(tick);

    return () => {
      document.documentElement.classList.remove("has-section-cursor");
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseleave", onLeave);
      cancelAnimationFrame(frame);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div
      className={[
        "section-cursor pointer-events-none fixed inset-0 z-[100] hidden md:block",
        visible ? "opacity-100" : "opacity-0",
      ].join(" ")}
      aria-hidden="true"
    >
      <div
        ref={dotRef}
        className={[
          "section-cursor-dot absolute left-0 top-0 will-change-transform",
          hoveringLink ? "is-hover" : "",
          `mode-${mode}`,
        ].join(" ")}
      />
      <div
        ref={ringRef}
        className={[
          "section-cursor-ring absolute left-0 top-0 will-change-transform",
          hoveringLink ? "is-hover" : "",
          `mode-${mode}`,
        ].join(" ")}
      />
    </div>
  );
}
