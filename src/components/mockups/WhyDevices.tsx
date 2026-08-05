"use client";

import Image from "next/image";

export function WhyDevices() {
  return (
    <div
      className="relative mx-auto hidden h-[460px] w-full max-w-[680px] lg:block"
      aria-hidden="true"
    >
      <div className="pointer-events-none absolute inset-x-[10%] bottom-0 h-16 rounded-full bg-ink/20 blur-3xl" />

      <div className="absolute left-[2%] top-[2%] h-[98%] w-[52%] animate-float">
        <Image
          src="/mockups/phones/alex-morgan-3d.png"
          alt=""
          width={614}
          height={1024}
          unoptimized
          className="h-full w-full object-contain [filter:drop-shadow(0_18px_28px_rgba(15,28,31,0.28))_drop-shadow(0_6px_10px_rgba(15,28,31,0.18))]"
        />
      </div>

      <div className="absolute right-[0%] top-[8%] h-[92%] w-[50%] animate-float-delayed">
        <Image
          src="/mockups/phones/riverdale-3d.png"
          alt=""
          width={614}
          height={1024}
          unoptimized
          className="h-full w-full object-contain [filter:drop-shadow(0_18px_28px_rgba(15,28,31,0.28))_drop-shadow(0_6px_10px_rgba(15,28,31,0.18))]"
        />
      </div>
    </div>
  );
}
