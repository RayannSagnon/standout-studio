"use client";

import { BusinessSiteScreen } from "@/components/mockups/BusinessSiteScreen";
import { DigitalCardScreen } from "@/components/mockups/DigitalCardScreen";
import { PhoneFrame } from "@/components/mockups/PhoneFrame";

export function WhyDevices() {
  return (
    <div
      className="relative mx-auto hidden h-[420px] w-full max-w-[640px] [perspective:1200px] lg:block"
      aria-hidden="true"
    >
      <div className="pointer-events-none absolute inset-x-[14%] bottom-2 h-10 rounded-full bg-ink/10 blur-2xl" />

      <PhoneFrame
        className="left-[6%] top-[4%] h-[96%] w-[46%]"
        baseRotateX={10}
        baseRotateY={-18}
      >
        <DigitalCardScreen />
      </PhoneFrame>

      <PhoneFrame
        className="right-[4%] top-[10%] h-[90%] w-[44%]"
        baseRotateX={8}
        baseRotateY={16}
        floatDelay
      >
        <BusinessSiteScreen />
      </PhoneFrame>
    </div>
  );
}
