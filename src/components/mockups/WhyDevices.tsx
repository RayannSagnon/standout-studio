"use client";

import { BusinessSiteScreen } from "@/components/mockups/BusinessSiteScreen";
import { DigitalCardScreen } from "@/components/mockups/DigitalCardScreen";
import { PhoneFrame } from "@/components/mockups/PhoneFrame";

export function WhyDevices() {
  return (
    <div
      className="relative mx-auto hidden h-[460px] w-full max-w-[680px] [perspective:1600px] lg:block"
      aria-hidden="true"
    >
      <div className="pointer-events-none absolute inset-x-[10%] bottom-0 h-14 rounded-full bg-ink/15 blur-3xl" />

      <PhoneFrame
        className="left-[4%] top-[2%] h-[98%] w-[48%]"
        baseRotateX={12}
        baseRotateY={-26}
      >
        <DigitalCardScreen />
      </PhoneFrame>

      <PhoneFrame
        className="right-[2%] top-[8%] h-[92%] w-[46%]"
        baseRotateX={10}
        baseRotateY={24}
        floatDelay
      >
        <BusinessSiteScreen />
      </PhoneFrame>
    </div>
  );
}
