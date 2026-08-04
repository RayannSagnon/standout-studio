"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { packages } from "@/content/en";

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      className="mt-0.5 h-4 w-4 shrink-0 text-teal"
      aria-hidden="true"
    >
      <path
        d="M3.2 8.2l3 3.1 6.6-7"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Packages() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    const onScroll = () => {
      const cards = Array.from(el.querySelectorAll<HTMLElement>("[data-plan]"));
      if (!cards.length) return;
      const mid = el.scrollLeft + el.clientWidth / 2;
      let best = 0;
      let bestDist = Infinity;
      cards.forEach((card, index) => {
        const center = card.offsetLeft + card.offsetWidth / 2;
        const dist = Math.abs(center - mid);
        if (dist < bestDist) {
          bestDist = dist;
          best = index;
        }
      });
      setActive(best);
    };

    onScroll();
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section id="packages" className="bg-white">
      <div className="mx-auto max-w-[1440px] px-5 py-7 md:px-20 md:py-[72px] md:pb-24">
        <div>
          <p className="text-xs font-semibold tracking-[0.12em] text-teal md:hidden">
            {packages.kicker}
          </p>
          <h2 className="mt-1.5 font-display text-[22px] font-bold tracking-tight text-ink md:mt-0 md:text-[40px]">
            {packages.title}
          </h2>
          <p className="mt-1.5 text-xs text-muted md:hidden">
            {packages.swipeHint}
          </p>
        </div>

        <div className="mt-9 hidden gap-6 md:grid md:grid-cols-3">
          {packages.plans.map((plan) => (
            <article
              key={plan.id}
              className={[
                "flex h-full flex-col rounded-xl bg-page p-7",
                plan.featured
                  ? "border-2 border-teal"
                  : "border border-border",
              ].join(" ")}
            >
              <div className="flex-1">
                {plan.featured && plan.badge ? (
                  <p className="mb-2 text-[11px] font-semibold tracking-wide text-teal">
                    {plan.badge}
                  </p>
                ) : null}
                <p className="text-sm font-semibold text-teal">{plan.name}</p>
                <p className="mt-2.5 font-display text-4xl font-bold tracking-tight text-ink">
                  {plan.price}
                </p>
                <ul className="mt-5 space-y-2.5">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-2.5 text-sm text-muted"
                    >
                      <CheckIcon />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <Link
                href={plan.cta.href}
                className="mt-8 inline-flex h-[42px] w-fit items-center justify-center rounded-full bg-teal px-4 text-sm font-semibold text-inverse transition-colors hover:bg-teal-deep"
              >
                {plan.cta.label}
              </Link>
            </article>
          ))}
        </div>

        <div
          ref={scrollerRef}
          className="mt-5 flex gap-3 overflow-x-auto pb-1 md:hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {packages.plans.map((plan) => (
            <article
              key={plan.id}
              data-plan={plan.id}
              className={[
                "flex w-[280px] shrink-0 flex-col rounded-2xl bg-page p-4",
                plan.featured
                  ? "border-2 border-teal"
                  : "border border-border",
              ].join(" ")}
            >
              {plan.featured && plan.mobileBadge ? (
                <p className="text-[10px] font-semibold tracking-wide text-teal">
                  {plan.mobileBadge}
                </p>
              ) : null}
              <h3 className="mt-1 font-display text-lg font-semibold tracking-tight text-ink">
                {plan.name}
              </h3>
              <p className="mt-1 font-display text-[28px] font-bold text-teal">
                {plan.price}
              </p>
              <ul className="mt-3 space-y-2">
                {plan.mobileFeatures.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-2 text-xs text-muted"
                  >
                    <CheckIcon />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Link
                href={plan.cta.href}
                className="mt-4 inline-flex h-12 w-full items-center justify-center rounded-full bg-hero text-sm font-semibold text-inverse"
              >
                {plan.cta.label}
              </Link>
            </article>
          ))}
        </div>

        <div
          className="mt-3 flex items-center justify-center gap-2 md:hidden"
          aria-hidden="true"
        >
          {packages.plans.map((plan, index) => (
            <span
              key={plan.id}
              className={[
                "h-1.5 rounded-full transition-all",
                index === active ? "w-[18px] bg-teal" : "w-1.5 bg-[#c7d1d1]",
              ].join(" ")}
            />
          ))}
        </div>

        <p className="mt-8 hidden text-sm text-muted md:block">
          {packages.siteCareNote}
        </p>

        <div className="mt-4 hidden items-center justify-between gap-8 rounded-[14px] border border-border bg-page px-7 py-6 md:flex">
          <div className="max-w-[640px]">
            <p className="text-[11px] font-semibold tracking-[0.08em] text-teal">
              {packages.siteCare.kicker}
            </p>
            <h3 className="mt-1.5 font-display text-2xl font-bold tracking-tight text-ink">
              {packages.siteCare.title}
            </h3>
            <p className="mt-1.5 text-sm text-muted">
              {packages.siteCare.description}
            </p>
          </div>
          <Link
            href={packages.siteCare.cta.href}
            className="inline-flex h-10 shrink-0 items-center justify-center rounded-full bg-teal px-[18px] text-[13px] font-semibold text-inverse transition-colors hover:bg-teal-deep"
          >
            {packages.siteCare.cta.label}
          </Link>
        </div>

        <div className="mt-3 rounded-[14px] border border-border bg-page px-4 py-3.5 md:hidden">
          <p className="text-[13px] font-semibold text-teal">
            {packages.siteCare.mobileTitle}
          </p>
          <p className="mt-1 text-xs text-muted">
            {packages.siteCare.mobileDescription}
          </p>
        </div>
      </div>
    </section>
  );
}
