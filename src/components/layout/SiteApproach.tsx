"use client";

import { Children, isValidElement, useRef, type ReactNode } from "react";

type SiteApproachProps = {
  children: ReactNode;
};

/**
 * Sticky stack: Selected Work stays pinned while Packages rises over it.
 * Desktop only — mobile keeps normal document flow.
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
      <div className="relative z-10 md:sticky md:top-0 md:z-10">
        {work}
      </div>
      <div className="relative z-20 md:-mt-[min(52vh,420px)]">
        {overlay}
      </div>
    </div>
  );
}
