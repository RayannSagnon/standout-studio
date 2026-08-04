import { trust } from "@/content/en";

export function Trust() {
  return (
    <section
      aria-label="Trust signals"
      className="border-b border-border/70 bg-surface"
    >
      <div className="mx-auto hidden max-w-[1440px] items-center justify-between gap-4 px-20 py-[18px] md:flex">
        {trust.items.map((item) => (
          <p
            key={item}
            className="text-[13px] font-medium whitespace-nowrap text-[#3a4a4e]"
          >
            {item}
          </p>
        ))}
      </div>

      <div className="md:hidden">
        <div className="flex gap-2 overflow-x-auto px-5 py-3.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {trust.mobileItems.map((item) => (
            <span
              key={item}
              className="shrink-0 rounded-full bg-teal-soft px-3.5 py-2 text-[12px] font-medium text-[#3a4a4e]"
            >
              {item}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
