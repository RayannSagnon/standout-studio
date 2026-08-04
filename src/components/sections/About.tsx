import { about } from "@/content/en";

export function About() {
  return (
    <section id="about" className="bg-page px-5 py-7 md:bg-white md:px-20 md:py-[88px]">
      <div className="mx-auto max-w-[1280px]">
        <p className="text-xs font-semibold tracking-[0.12em] text-teal md:text-[13px]">
          {about.kicker}
        </p>
        <p className="mt-3 max-w-[70ch] text-[15px] leading-relaxed text-ink md:mt-4 md:text-[22px] md:leading-snug">
          {about.lead}
        </p>

        <div className="mt-8 grid items-center gap-8 md:mt-10 md:grid-cols-[560px_1fr] md:gap-9">
          <div
            className="relative h-40 overflow-hidden rounded-[20px] bg-[#e0f2f0] md:h-[380px] md:rounded-[28px]"
            aria-hidden="true"
          >
            <div className="absolute -left-6 top-4 h-20 w-20 rounded-full bg-[#b8e0db] md:left-10 md:top-12 md:h-[100px] md:w-[100px]" />
            <div className="absolute right-4 top-2 h-16 w-16 rounded-full bg-[#fad6c7] md:right-16 md:top-10 md:h-20 md:w-20" />
            <div className="absolute bottom-4 left-1/2 w-[58%] -translate-x-1/2 overflow-hidden rounded-xl border border-white/70 bg-white shadow-sm md:bottom-14 md:w-[52%]">
              <div className="flex gap-1 border-b border-border px-2.5 py-2">
                <span className="h-1.5 w-1.5 rounded-full bg-border" />
                <span className="h-1.5 w-1.5 rounded-full bg-border" />
                <span className="h-1.5 w-1.5 rounded-full bg-border" />
              </div>
              <div className="space-y-2 p-3">
                <div className="h-2 w-1/3 rounded bg-teal/25" />
                <div className="h-3 w-2/3 rounded bg-ink/10" />
                <div className="h-10 rounded-lg bg-gradient-to-br from-teal/15 to-hero/20 md:h-16" />
              </div>
            </div>
            <div className="absolute right-6 bottom-8 h-8 w-8 rounded-xl bg-[#f2736b] md:right-14 md:bottom-24 md:h-10 md:w-10" />
          </div>

          <div className="max-w-[624px]">
            <p className="text-sm leading-relaxed text-muted md:text-lg md:text-[#3a4a4e]">
              {about.body}
            </p>
            <p className="mt-4 text-sm font-medium text-teal md:mt-4 md:text-base">
              {about.locale}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
