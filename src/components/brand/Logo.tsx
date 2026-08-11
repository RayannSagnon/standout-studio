import { siteConfig } from "@/lib/site";

export type LogoTheme = "color" | "inverse" | "mono";
export type LogoLayout = "horizontal" | "vertical";

const markThemeClass: Record<LogoTheme, string> = {
  color: "bg-hero text-inverse",
  inverse: "bg-inverse text-ink",
  mono: "bg-ink text-inverse",
};

const wordThemeClass: Record<
  LogoTheme,
  { standout: string; studio: string }
> = {
  color: { standout: "text-ink", studio: "text-muted" },
  inverse: { standout: "text-inverse", studio: "text-hero-support" },
  mono: { standout: "text-ink", studio: "text-ink" },
};

type LogoMarkProps = {
  theme?: LogoTheme;
  size?: number;
  className?: string;
};

export function LogoMark({
  theme = "color",
  size = 32,
  className = "",
}: LogoMarkProps) {
  const radius = Math.max(6, Math.round(size * 0.22));
  const fontSize = Math.round(size * 0.58);

  return (
    <span
      className={[
        "inline-flex shrink-0 items-center justify-center font-display font-bold leading-none select-none",
        markThemeClass[theme],
        className,
      ].join(" ")}
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        fontSize,
      }}
      aria-hidden="true"
    >
      <span style={{ marginTop: size >= 40 ? -2 : -1 }}>S</span>
    </span>
  );
}

type LogoProps = {
  theme?: LogoTheme;
  layout?: LogoLayout;
  markSize?: number;
  className?: string;
  wordmarkClassName?: string;
  /** When true, hide from AT (parent Link already has an accessible name). */
  decorative?: boolean;
};

export function Logo({
  theme = "color",
  layout = "horizontal",
  markSize,
  className = "",
  wordmarkClassName = "",
  decorative = false,
}: LogoProps) {
  const size = markSize ?? (layout === "vertical" ? 40 : 32);
  const words = wordThemeClass[theme];
  const isVertical = layout === "vertical";

  return (
    <span
      className={[
        "inline-flex min-w-0",
        isVertical
          ? "flex-col items-center gap-2.5 text-center"
          : "items-center gap-2.5 md:gap-3",
        className,
      ].join(" ")}
      aria-hidden={decorative || undefined}
    >
      <LogoMark theme={theme} size={size} />
      <span
        className={[
          "min-w-0",
          isVertical ? "flex flex-col items-center" : "flex flex-col items-start",
          wordmarkClassName,
        ].join(" ")}
      >
        <span
          className={[
            "font-display font-semibold tracking-tight leading-none",
            isVertical ? "text-[22px]" : "text-[17px] md:text-[20px]",
            words.standout,
          ].join(" ")}
        >
          Standout
        </span>
        <span
          className={[
            "font-sans font-medium uppercase leading-none",
            isVertical
              ? "mt-1 text-[11px] tracking-[0.18em]"
              : "mt-0.5 text-[10px] tracking-[0.16em] md:text-[11px] md:tracking-[0.18em]",
            words.studio,
          ].join(" ")}
        >
          Studio
        </span>
      </span>
      {decorative ? null : (
        <span className="sr-only">{siteConfig.name}</span>
      )}
    </span>
  );
}
