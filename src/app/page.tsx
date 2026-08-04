import { Hero } from "@/components/sections/Hero";

function SectionPlaceholder({
  id,
  title,
}: {
  id: string;
  title: string;
}) {
  return (
    <section
      id={id}
      className="border-t border-border/60 px-5 py-16 md:px-20 md:py-24"
    >
      <div className="mx-auto max-w-[1280px]">
        <p className="text-xs font-semibold tracking-[0.12em] text-teal uppercase">
          Next up
        </p>
        <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-ink md:text-4xl">
          {title}
        </h2>
        <p className="mt-3 max-w-xl text-muted">
          Section scaffolded. Implementation follows the approved Figma mockup.
        </p>
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <>
      <Hero />
      <SectionPlaceholder id="trust" title="Trust" />
      <SectionPlaceholder id="what-we-do" title="What we do" />
      <SectionPlaceholder id="work" title="Selected Work" />
      <SectionPlaceholder id="packages" title="Packages & pricing" />
      <SectionPlaceholder id="why" title="Why it matters" />
      <SectionPlaceholder id="process" title="Process" />
      <SectionPlaceholder id="testimonials" title="Testimonials" />
      <SectionPlaceholder id="about" title="About" />
      <SectionPlaceholder id="faq" title="FAQ" />
      <SectionPlaceholder id="contact" title="Get in touch" />
    </>
  );
}
