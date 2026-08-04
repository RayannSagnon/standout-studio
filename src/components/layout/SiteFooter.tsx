import { footer, site } from "@/content/en";

export function SiteFooter() {
  return (
    <footer className="bg-hero text-inverse">
      <div className="mx-auto flex max-w-[1440px] flex-col items-center gap-1.5 px-5 py-3.5 text-center md:flex-row md:items-center md:justify-between md:gap-6 md:px-20 md:py-9 md:text-left">
        <p className="font-display text-[18px] font-semibold tracking-tight md:text-[20px]">
          {site.name}
        </p>
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
