import { Reveal } from "@/components/ui/Reveal";
import { testimonials } from "@/content/en";

function Stars() {
  return (
    <p className="text-sm tracking-wide text-teal" aria-label="5 out of 5 stars">
      ★★★★★
    </p>
  );
}

export function Testimonials() {
  return (
    <section
      id="testimonials"
      data-cursor="testimonials"
      className="bg-page px-5 py-10 md:px-20 md:py-24"
    >
      <div className="mx-auto max-w-[1280px]">
        <Reveal className="max-w-[616px]">
          <p className="text-xs font-semibold tracking-[0.12em] text-teal md:hidden">
            {testimonials.mobileKicker}
          </p>
          <h2 className="mt-1.5 font-display text-[22px] font-bold tracking-tight text-ink md:mt-0 md:text-[40px]">
            <span className="md:hidden">{testimonials.mobileTitle}</span>
            <span className="hidden md:inline">{testimonials.title}</span>
          </h2>
          <p className="mt-3 hidden text-base text-muted md:block">
            {testimonials.intro}
          </p>
          <p className="mt-1.5 text-xs text-muted md:hidden">
            {testimonials.swipeHint}
          </p>
        </Reveal>

        <div className="mt-9 hidden gap-5 md:grid md:grid-cols-3">
          {testimonials.items.map((item, index) => (
            <Reveal key={item.id} delayMs={index * 90} as="article">
              <div className="lift-card flex h-full flex-col rounded-xl bg-white p-7">
              <Stars />
              <blockquote className="mt-4 flex-1 font-display text-[17px] leading-relaxed text-ink">
                “{item.quote}”
              </blockquote>
              <div className="mt-6">
                  <p className="text-sm font-semibold text-ink">{item.name}</p>
                  <p className="mt-1 text-xs text-muted">{item.role}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        <div className="mt-5 flex gap-3 overflow-x-auto pb-1 md:hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {testimonials.items.map((item) => (
            <article
              key={item.id}
              className="w-[260px] shrink-0 rounded-2xl border border-border bg-white p-4"
            >
              <Stars />
              <blockquote className="mt-3 font-display text-[13px] leading-relaxed text-ink">
                “{item.mobileQuote}”
              </blockquote>
              <p className="mt-4 text-xs font-semibold text-ink">{item.name}</p>
              <p className="mt-1 text-[11px] text-muted">{item.mobileRole}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
