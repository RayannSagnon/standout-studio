import { why } from "@/content/en";

export function Why() {
  return (
    <section id="why" className="bg-white px-5 py-10 md:px-12 md:py-[72px] lg:px-20">
      <div className="mx-auto grid max-w-[1440px] items-center gap-10 lg:grid-cols-[minmax(0,632px)_minmax(0,1fr)] lg:gap-10">
        <div>
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
            {why.points.map((point) => (
              <li
                key={point}
                className="flex items-start gap-2 text-[15px] text-ink"
              >
                <span className="text-teal" aria-hidden="true">
                  ✓
                </span>
                <span>{point}</span>
              </li>
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
        </div>

        <div
          className="relative mx-auto hidden h-[400px] w-full max-w-[640px] lg:block"
          aria-hidden="true"
        >
          <div className="absolute left-[8%] top-[12%] w-[68%] overflow-hidden rounded-2xl border border-border bg-page shadow-[0_24px_60px_rgba(15,28,31,0.12)]">
            <div className="flex items-center gap-1.5 border-b border-border bg-white px-3 py-2.5">
              <span className="h-2.5 w-2.5 rounded-full bg-[#d5e0e2]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#d5e0e2]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#d5e0e2]" />
              <span className="ml-3 h-5 flex-1 rounded-full bg-page" />
            </div>
            <div className="space-y-3 p-5">
              <div className="h-3 w-1/3 rounded bg-teal/30" />
              <div className="h-8 w-3/4 rounded bg-ink/10" />
              <div className="h-3 w-full rounded bg-border" />
              <div className="h-3 w-5/6 rounded bg-border" />
              <div className="mt-4 h-24 rounded-xl bg-gradient-to-br from-teal/20 to-hero/20" />
              <div className="h-9 w-32 rounded-full bg-teal" />
            </div>
          </div>
          <div className="absolute bottom-[6%] right-[10%] w-[28%] overflow-hidden rounded-[1.4rem] border border-border bg-white shadow-[0_20px_50px_rgba(15,28,31,0.16)]">
            <div className="mx-auto mt-2 h-1.5 w-10 rounded-full bg-border" />
            <div className="space-y-2 p-3 pt-4">
              <div className="h-2 w-1/2 rounded bg-teal/30" />
              <div className="h-4 w-4/5 rounded bg-ink/10" />
              <div className="h-16 rounded-lg bg-gradient-to-br from-teal/15 to-hero/25" />
              <div className="h-7 rounded-full bg-teal" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
