"use client";

import { Children, isValidElement, useRef, type ReactNode } from "react";

type SiteApproachProps = {
  children: ReactNode;
};

/**
 * Selected Work finishes in normal document flow, then Packages begins.
 * No sticky / negative margin — those pulled the wave into the middle of Work.
 */
export function SiteApproach({ children }: SiteApproachProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const items = Children.toArray(children);
  const work = items[0];
  const overlay = items[1];

  if (!isValidElement(work) || !overlay) {
    return <div ref={rootRef}>{children}</div>;
  }

  return (
    <div ref={rootRef} className="relative">
      <div className="relative z-10">{work}</div>
      <div className="relative z-20">{overlay}</div>
    </div>
  );
}
