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

const ICONS: Record<CursorMode, string> = {
  default: "",
  hero: "",
  trust: "★",
  services: "◆",
  work: "+",
  packages: "$",
  why: "◎",
  marquee: "",
  process: "→",
  testimonials: "“",
  about: "",
  faq: "?",
  contact: "✉",
};

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
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: -100, y: -100 });
  const ring = useRef({ x: -100, y: -100 });
  const modeRef = useRef<CursorMode>("default");
  const hoverRef = useRef(false);
  const pressRef = useRef(false);
  const [enabled, setEnabled] = useState(false);
  const [visible, setVisible] = useState(false);
  const [icon, setIcon] = useState("");

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
    if (iconRef.current) {
      iconRef.current.dataset.baseClass =
        "section-cursor-icon absolute left-0 top-0";
    }
    syncClasses(dotRef.current, modeRef.current, hoverRef.current, pressRef.current);
    syncClasses(ringRef.current, modeRef.current, hoverRef.current, pressRef.current);
    syncClasses(iconRef.current, modeRef.current, hoverRef.current, pressRef.current);

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

      const pressScale = pressRef.current ? 0.82 : 1;
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${pos.current.x}px, ${pos.current.y}px, 0) scale(${pressScale})`;
      }
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ring.current.x}px, ${ring.current.y}px, 0) scale(${pressScale})`;
      }
      if (iconRef.current) {
        iconRef.current.style.transform = `translate3d(${ring.current.x}px, ${ring.current.y}px, 0) scale(${pressScale})`;
      }

      const dx = pos.current.x - ring.current.x;
      const dy = pos.current.y - ring.current.y;
      if (dx * dx + dy * dy < 0.05 && !pressRef.current) {
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

    const applyState = () => {
      syncClasses(dotRef.current, modeRef.current, hoverRef.current, pressRef.current);
      syncClasses(ringRef.current, modeRef.current, hoverRef.current, pressRef.current);
      syncClasses(iconRef.current, modeRef.current, hoverRef.current, pressRef.current);
      setIcon(ICONS[modeRef.current] ?? "");
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
      <div ref={ringRef} className="section-cursor-ring absolute left-0 top-0" />
      <div
        ref={iconRef}
        className="section-cursor-icon absolute left-0 top-0"
        data-has-icon={icon ? "true" : "false"}
      >
        {icon}
      </div>
      <div ref={dotRef} className="section-cursor-dot absolute left-0 top-0" />
    </div>
  );
}
