import { trust } from "@/content/en";

function Star() {
  return (
    <span
      aria-hidden="true"
      className="inline-flex shrink-0 text-teal"
    >
      <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="currentColor">
        <path d="M8 1.2l1.76 3.56 3.93.57-2.85 2.78.67 3.92L8 10.2l-3.51 1.83.67-3.92L2.3 5.33l3.93-.57L8 1.2z" />
      </svg>
    </span>
  );
}

function TrustLoop({ items }: { items: readonly string[] }) {
  const sequence = [...items, ...items];

  return (
    <div className="overflow-hidden py-[18px]">
      <div className="flex w-max animate-marquee items-center gap-8 pr-8 will-change-transform">
        {sequence.map((item, index) => (
          <span
            key={`${item}-${index}`}
            className="flex items-center gap-8 text-[13px] font-medium whitespace-nowrap text-[#3a4a4e]"
          >
            <span>{item}</span>
            <Star />
          </span>
        ))}
      </div>
    </div>
  );
}

export function Trust() {
  return (
    <section
      aria-label="Trust signals"
      data-cursor="trust"
      className="border-b border-border/70 bg-surface"
    >
      <div className="sr-only">
        <ul>
          {trust.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>

      <div aria-hidden="true" className="hidden md:block">
        <TrustLoop items={trust.items} />
      </div>

      <div aria-hidden="true" className="md:hidden">
        <TrustLoop items={trust.mobileItems} />
      </div>
    </section>
  );
}
