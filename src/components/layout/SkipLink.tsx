"use client";

import { useContent } from "@/components/i18n/LocaleProvider";

export function SkipLink() {
  const { ui } = useContent();
  return (
    <a
      href="#main"
      className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[300] focus:rounded-full focus:bg-teal focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-inverse"
    >
      {ui.skipToContent}
    </a>
  );
}
