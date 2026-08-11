"use client";

import { Logo } from "@/components/brand/Logo";
import { useContent } from "@/components/i18n/LocaleProvider";

export function SiteFooter() {
  const { footer, site } = useContent();

  return (
    <footer className="bg-hero text-inverse">
      <div className="mx-auto flex max-w-[1440px] flex-col items-center gap-3 px-5 py-5 text-center md:flex-row md:items-center md:justify-between md:gap-6 md:px-20 md:py-9 md:text-left">
        <Logo theme="inverse" markSize={28} />
        <a
          href={`mailto:${site.email}`}
          className="text-sm text-hero-support transition-colors hover:text-inverse"
        >
          {site.email}
        </a>
        <p className="text-[13px] text-hero-support md:text-sm">{footer.meta}</p>
      </div>
    </footer>
  );
}
