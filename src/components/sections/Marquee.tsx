import { marquee } from "@/content/en";

function Band({
  items,
  tone,
  reverse = false,
  tilt,
}: {
  items: readonly string[];
  tone: "teal" | "hero";
  reverse?: boolean;
  tilt: string;
}) {
  const half = [...items, ...items, ...items, ...items];
  const sequence = [...half, ...half];

  return (
    <div
      className={[
        "absolute left-1/2 w-[220vw] max-w-none -translate-x-1/2 overflow-hidden py-4 whitespace-nowrap",
        tone === "teal" ? "bg-teal" : "bg-hero",
        tilt,
      ].join(" ")}
    >
      <div
        className={[
          "flex w-max gap-8 text-[13px] font-medium text-inverse md:text-[15px]",
          reverse ? "animate-marquee-reverse" : "animate-marquee",
        ].join(" ")}
      >
        {sequence.map((item, index) => (
          <span key={`${item}-${index}`} className="flex items-center gap-8">
            <span>{item}</span>
            <span aria-hidden="true">·</span>
          </span>
        ))}
      </div>
    </div>
  );
}

export function Marquee() {
  return (
    <section
      aria-hidden="true"
      className="relative h-[88px] overflow-hidden bg-white md:h-[220px]"
    >
      <Band
        items={marquee.top}
        tone="teal"
        tilt="-rotate-[2.5deg] top-[18%] md:top-[28%]"
      />
      <Band
        items={marquee.bottom}
        tone="hero"
        reverse
        tilt="rotate-[2.5deg] top-[48%] md:top-[52%]"
      />
    </section>
  );
}
