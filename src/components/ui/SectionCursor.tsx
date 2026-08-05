"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

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

function place(node: HTMLDivElement | null, x: number, y: number, scale: number) {
  if (!node) return;
  // left/top = hotspot; transform only centers + press scale (no second translate of coords)
  node.style.left = `${x}px`;
  node.style.top = `${y}px`;
  node.style.transform = `translate(-50%, -50%) scale(${scale})`;
}

export function SectionCursor() {
  const coreRef = useRef<HTMLDivElement>(null);
  const accentRef = useRef<HTMLDivElement>(null);
  const modeRef = useRef<CursorMode>("default");
  const hoverRef = useRef(false);
  const pressRef = useRef(false);
  const [enabled, setEnabled] = useState(false);
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
      coreRef.current.dataset.baseClass = "section-cursor-core";
    }
    if (accentRef.current) {
      accentRef.current.dataset.baseClass = "section-cursor-accent";
    }
    syncClasses(coreRef.current, modeRef.current, hoverRef.current, pressRef.current);
    syncClasses(accentRef.current, modeRef.current, hoverRef.current, pressRef.current);

    const paint = (x: number, y: number) => {
      const scale = pressRef.current ? 0.82 : 1;
      place(coreRef.current, x, y, scale);
      place(accentRef.current, x, y, scale);
    };

    const applyState = () => {
      syncClasses(coreRef.current, modeRef.current, hoverRef.current, pressRef.current);
      syncClasses(accentRef.current, modeRef.current, hoverRef.current, pressRef.current);
    };

    const onMove = (event: MouseEvent) => {
      setVisible(true);
      paint(event.clientX, event.clientY);

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

    const onDown = (event: MouseEvent) => {
      pressRef.current = true;
      applyState();
      paint(event.clientX, event.clientY);
    };

    const onUp = (event: MouseEvent) => {
      pressRef.current = false;
      applyState();
      paint(event.clientX, event.clientY);
    };

    const onLeave = () => {
      setVisible(false);
      pressRef.current = false;
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointerleave", onLeave);
    document.addEventListener("mouseleave", onLeave);

    return () => {
      document.documentElement.classList.remove("has-section-cursor");
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("mouseleave", onLeave);
    };
  }, [enabled]);

  if (!enabled || !mounted) return null;

  return createPortal(
    <div
      className={["section-cursor", visible ? "is-visible" : ""].join(" ")}
      aria-hidden="true"
    >
      <div ref={accentRef} className="section-cursor-accent" />
      <div ref={coreRef} className="section-cursor-core" />
    </div>,
    document.body,
  );
}
