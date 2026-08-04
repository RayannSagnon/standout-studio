"use client";

import { useState } from "react";
import { faq } from "@/content/en";

export function Faq() {
  const [openId, setOpenId] = useState<string>(faq.items[0].id);

  return (
    <section id="faq" className="bg-page px-5 py-10 md:px-20 md:py-[88px]">
      <div className="mx-auto max-w-[1280px]">
        <div className="max-w-[466px]">
          <p className="text-xs font-semibold tracking-[0.12em] text-teal">
            {faq.kicker}
          </p>
          <h2 className="mt-2.5 font-display text-[22px] font-bold tracking-tight text-ink md:text-[36px]">
            <span className="md:hidden">{faq.mobileTitle}</span>
            <span className="hidden md:inline">{faq.title}</span>
          </h2>
          <p className="mt-2.5 hidden text-[15px] text-[#3a4a4e] md:block">
            {faq.hint}
          </p>
        </div>

        <div className="mt-6 space-y-3 md:mt-8 md:space-y-3">
          {faq.items.map((item) => {
            const isOpen = openId === item.id;
            return (
              <div
                key={item.id}
                className={[
                  "overflow-hidden rounded-xl bg-white",
                  item.mobile ? "" : "hidden md:block",
                ].join(" ")}
              >
                <button
                  type="button"
                  className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left md:px-[22px] md:py-[18px]"
                  aria-expanded={isOpen}
                  onClick={() => setOpenId(isOpen ? "" : item.id)}
                >
                  <span className="text-[13px] font-medium text-ink md:text-base">
                    {item.question}
                  </span>
                  <span
                    className="shrink-0 text-lg leading-none text-muted md:text-[22px]"
                    aria-hidden="true"
                  >
                    {isOpen ? "−" : "+"}
                  </span>
                </button>
                {isOpen ? (
                  <p className="border-t border-border/70 px-4 pb-4 pt-3 text-[13px] leading-relaxed text-muted md:px-[22px] md:pb-5 md:text-[15px]">
                    {item.answer}
                  </p>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
