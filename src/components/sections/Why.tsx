import Image from "next/image";
import { Reveal } from "@/components/ui/Reveal";
import { why } from "@/content/en";

function PhoneMock({
  src,
  alt,
  className,
  tilt,
}: {
  src: string;
  alt: string;
  className?: string;
  tilt: string;
}) {
  return (
    <div
      className={[
        "absolute overflow-hidden rounded-[2rem] border-[6px] border-[#12181a] bg-[#12181a] shadow-[0_28px_60px_rgba(15,28,31,0.22)]",
        tilt,
        className,
      ].join(" ")}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex justify-center pt-2">
        <span className="h-4 w-20 rounded-full bg-black/80" />
      </div>
      <Image
        src={src}
        alt={alt}
        width={390}
        height={844}
        className="h-full w-full object-cover object-top"
      />
    </div>
  );
}

export function Why() {
  return (
    <section id="why" className="bg-white px-5 py-10 md:px-12 md:py-[72px] lg:px-20">
      <div className="mx-auto grid max-w-[1440px] items-center gap-10 lg:grid-cols-[minmax(0,632px)_minmax(0,1fr)] lg:gap-10">
        <Reveal>
          <p className="text-xs font-semibold tracking-[0.12em] text-teal">
            {why.kicker}
          </p>
          <h2 className="mt-2.5 max-w-[16ch] font-display text-[20px] font-bold leading-tight tracking-tight text-ink md:text-[36px]">
            {why.title}
          </h2>

          <p className="mt-3.5 hidden max-w-[560px] text-base leading-relaxed text-[#3a4a4e] md:block">
            {why.body}
          </p>

          <ul className="mt-5 hidden space-y-2.5 md:block">
            {why.points.map((point, index) => (
              <Reveal key={point} as="li" delayMs={120 + index * 90} className="list-none">
                <span className="flex items-start gap-2 text-[15px] text-ink">
                  <span className="text-teal" aria-hidden="true">
                    ✓
                  </span>
                  <span>{point}</span>
                </span>
              </Reveal>
            ))}
          </ul>

          <div className="mt-4 flex gap-3.5 md:hidden">
            <ul className="flex w-[171px] shrink-0 flex-col gap-2">
              {why.mobilePoints.map((point) => (
                <li
                  key={point}
                  className="rounded-xl bg-page px-3 py-2.5 text-[13px] text-ink"
                >
                  <span className="text-teal" aria-hidden="true">
                    ✓{" "}
                  </span>
                  {point}
                </li>
              ))}
            </ul>
            <p className="text-xs leading-relaxed text-[#3a4a4e]">{why.body}</p>
          </div>
        </Reveal>

        <Reveal
          delayMs={140}
          className="relative mx-auto hidden h-[420px] w-full max-w-[640px] lg:block"
        >
          <div className="pointer-events-none absolute inset-x-[12%] bottom-4 h-8 rounded-full bg-ink/10 blur-xl" />
          <div className="animate-float absolute inset-0">
            <PhoneMock
              src="/work/steven-mobile.png"
              alt="Steven Atchall website on mobile"
              className="left-[8%] top-[6%] h-[92%] w-[46%]"
              tilt="-rotate-[8deg]"
            />
          </div>
          <div className="animate-float-delayed absolute inset-0">
            <PhoneMock
              src="/work/rayann-mobile.png"
              alt="Rayann Sagnon website on mobile"
              className="right-[6%] top-[14%] h-[88%] w-[44%]"
              tilt="rotate-[7deg]"
            />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
