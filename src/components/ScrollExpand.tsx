"use client";

import { useCallback, useEffect, useRef } from "react";
import type { CSSProperties, ReactNode } from "react";

import "./ScrollExpand.css";

const clamp = (v: number, a: number, b: number): number =>
  v < a ? a : v > b ? b : v;

const smoothstep = (edge0: number, edge1: number, x: number): number => {
  const t = clamp((x - edge0) / (edge1 - edge0 || 1e-6), 0, 1);
  return t * t * (3 - 2 * t);
};

type ConfigKey =
  | "startWidth"
  | "startHeight"
  | "startRadius"
  | "endRadius"
  | "mediaZoom"
  | "scrollDistance"
  | "holdDistance"
  | "smoothing"
  | "overlayScrim"
  | "useWindowScroll"
  | "enabled";

export interface ScrollExpandProps {
  src?: string;
  mediaType?: "image" | "video";
  poster?: string;
  alt?: string;
  title?: string;
  scrollHint?: string;
  startWidth?: number;
  startHeight?: number;
  startRadius?: number;
  endRadius?: number;
  mediaZoom?: number;
  scrollDistance?: number;
  holdDistance?: number;
  smoothing?: number;
  overlayScrim?: number;
  useWindowScroll?: boolean;
  enabled?: boolean;
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
  onProgress?: (progress: number) => void;
  [key: string]: unknown;
}

const ScrollExpand: React.FC<ScrollExpandProps> = ({
  src = "",
  mediaType = "image",
  poster = "",
  alt = "",
  title = "",
  scrollHint = "",
  startWidth = 42,
  startHeight = 58,
  startRadius = 24,
  endRadius = 0,
  mediaZoom = 1.35,
  scrollDistance = 1.2,
  holdDistance = 0.35,
  smoothing = 0.06,
  overlayScrim = 0.45,
  useWindowScroll = false,
  enabled = true,
  children,
  className = "",
  style,
  onProgress,
  ...rest
}: ScrollExpandProps) => {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const frameRef = useRef<HTMLDivElement | null>(null);
  const mediaRef = useRef<(HTMLImageElement & HTMLVideoElement) | null>(null);
  const titleRef = useRef<HTMLDivElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const scrimRef = useRef<HTMLDivElement | null>(null);
  const hintRef = useRef<HTMLDivElement | null>(null);
  const onProgressRef = useRef(onProgress);
  const lastEmittedRef = useRef(-1);
  onProgressRef.current = onProgress;

  const propsRef = useRef<Required<Pick<ScrollExpandProps, ConfigKey>>>(
    {} as Required<Pick<ScrollExpandProps, ConfigKey>>,
  );
  propsRef.current = {
    startWidth,
    startHeight,
    startRadius,
    endRadius,
    mediaZoom,
    scrollDistance,
    holdDistance,
    smoothing,
    overlayScrim,
    useWindowScroll,
    enabled,
  };

  const applyProgress = useCallback((p: number) => {
    const frame = frameRef.current;
    const media = mediaRef.current;
    if (!frame || !media) return;
    const c = propsRef.current;

    const e = smoothstep(0, 1, p);

    const w = c.startWidth + (100 - c.startWidth) * e;
    const h = c.startHeight + (100 - c.startHeight) * e;
    const ix = Math.max(0, (100 - w) / 2);
    const iy = Math.max(0, (100 - h) / 2);
    // Keep radius soft early, snap to endRadius late to avoid clip-path round jank.
    const rEase = smoothstep(0, 0.85, e);
    const r = c.startRadius + (c.endRadius - c.startRadius) * rEase;
    frame.style.clipPath = `inset(${iy}% ${ix}% ${iy}% ${ix}% round ${r}px)`;

    media.style.transform = `scale(${c.mediaZoom + (1 - c.mediaZoom) * e})`;

    if (scrimRef.current) scrimRef.current.style.opacity = `${c.overlayScrim * e}`;

    if (titleRef.current) {
      const out = smoothstep(0.28, 0.7, p);
      const opacity = 1 - out;
      titleRef.current.style.opacity = `${opacity}`;
      titleRef.current.style.transform = `translate3d(0, ${-24 * out}px, 0)`;
      // Fully remove from paint once gone so it cannot cover the final headline.
      const gone = opacity < 0.02;
      titleRef.current.style.visibility = gone ? "hidden" : "visible";
      titleRef.current.style.pointerEvents = "none";
      if (gone) titleRef.current.style.zIndex = "0";
      else titleRef.current.style.zIndex = "3";
    }

    if (hintRef.current) {
      const gone = smoothstep(0, 0.1, p);
      hintRef.current.style.opacity = `${1 - gone}`;
    }

    if (overlayRef.current) {
      const inn = smoothstep(0.62, 0.95, p);
      overlayRef.current.style.opacity = `${inn}`;
      overlayRef.current.style.transform = `translate3d(0, ${14 * (1 - inn)}px, 0)`;
      overlayRef.current.style.pointerEvents = inn > 0.9 ? "auto" : "none";
    }

    const rounded = Math.round(p * 40) / 40;
    if (rounded !== lastEmittedRef.current) {
      lastEmittedRef.current = rounded;
      onProgressRef.current?.(p);
    }
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    const track = trackRef.current;
    const stage = stageRef.current;
    if (!root || !track || !stage) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let raf = 0;
    let current = 0;
    let target = 0;
    let stageH = 0;
    let running = false;
    let resizeRaf = 0;

    const measure = () => {
      const c = propsRef.current;
      stageH = c.useWindowScroll ? window.innerHeight : root.clientHeight;
      if (stageH <= 0) return;
      stage.style.height = `${stageH}px`;
      track.style.height = `${stageH * (1 + Math.max(0, c.scrollDistance) + Math.max(0, c.holdDistance))}px`;

      const w = root.clientWidth || stageH;
      stage.style.setProperty("--se-title-size", `${clamp(w * 0.075, 20, 84)}px`);
    };

    const readProgress = () => {
      const c = propsRef.current;
      if (!c.enabled) return 1;
      const span = stageH * Math.max(0.01, c.scrollDistance);
      if (c.useWindowScroll) {
        const top = track.getBoundingClientRect().top;
        return clamp(-top / span, 0, 1);
      }
      return clamp(root.scrollTop / span, 0, 1);
    };

    const tick = () => {
      const c = propsRef.current;
      const k = c.smoothing <= 0 ? 1 : 1 - Math.exp(-1 / (60 * Math.max(0.02, c.smoothing)));
      current += (target - current) * k;
      if (Math.abs(target - current) < 0.00035) {
        current = target;
        running = false;
      }
      applyProgress(current);
      raf = running ? requestAnimationFrame(tick) : 0;
    };

    const kick = () => {
      if (running) return;
      running = true;
      if (!raf) raf = requestAnimationFrame(tick);
    };

    const onScroll = () => {
      target = readProgress();
      if (propsRef.current.smoothing <= 0 || reduceMotion) {
        current = target;
        applyProgress(current);
        return;
      }
      kick();
    };

    const onResize = () => {
      if (resizeRaf) return;
      resizeRaf = requestAnimationFrame(() => {
        resizeRaf = 0;
        measure();
        target = readProgress();
        current = target;
        applyProgress(current);
      });
    };

    document.documentElement.classList.add("is-hero-expanding");

    measure();
    target = readProgress();
    current = target;
    applyProgress(current);

    const scroller = useWindowScroll ? window : root;
    scroller.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    // Only observe element resize for nested scrollers — window mode
    // rewrites track height and would thrash ResizeObserver mid-expand.
    let ro: ResizeObserver | null = null;
    if (!useWindowScroll) {
      ro = new ResizeObserver(onResize);
      ro.observe(root);
    }

    return () => {
      document.documentElement.classList.remove("is-hero-expanding");
      if (raf) cancelAnimationFrame(raf);
      if (resizeRaf) cancelAnimationFrame(resizeRaf);
      scroller.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      ro?.disconnect();
    };
  }, [applyProgress, useWindowScroll]);

  useEffect(() => {
    if (!enabled) {
      document.documentElement.classList.remove("is-hero-expanding");
    }
  }, [enabled]);

  const media =
    mediaType === "video" ? (
      <video
        ref={mediaRef}
        className="scroll-expand__media"
        src={src}
        poster={poster}
        autoPlay
        muted
        loop
        playsInline
      />
    ) : (
      <img
        ref={mediaRef}
        className="scroll-expand__media"
        src={src}
        alt={alt}
        draggable={false}
        decoding="async"
        fetchPriority="high"
      />
    );

  return (
    <div
      ref={rootRef}
      className={`scroll-expand ${useWindowScroll ? "" : "scroll-expand--scroller"} ${className}`.trim()}
      style={style}
      {...rest}
    >
      <div ref={trackRef} className="scroll-expand__track">
        <div ref={stageRef} className="scroll-expand__stage">
          <div ref={frameRef} className="scroll-expand__frame">
            {media}
            <div ref={scrimRef} className="scroll-expand__scrim" />
            {children ? (
              <div ref={overlayRef} className="scroll-expand__overlay">
                {children}
              </div>
            ) : null}
          </div>
          {title ? (
            <div ref={titleRef} className="scroll-expand__title" aria-hidden="true">
              <span className="scroll-expand__title-inner">
                {Array.from(title).map((char, index) =>
                  char === " " ? (
                    <span key={`sp-${index}`} className="scroll-expand__space">
                      {"\u00A0"}
                    </span>
                  ) : (
                    <span key={`ch-${index}`} className="scroll-expand__char">
                      {char}
                    </span>
                  ),
                )}
              </span>
            </div>
          ) : null}
          {scrollHint ? (
            <div ref={hintRef} className="scroll-expand__hint">
              {scrollHint}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default ScrollExpand;
