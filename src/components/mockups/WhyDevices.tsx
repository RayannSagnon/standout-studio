"use client";

import Image from "next/image";

export function WhyDevices() {
  return (
    <div
      className="relative mx-auto hidden h-[460px] w-full max-w-[680px] lg:block"
      aria-hidden="true"
    >
      <div className="pointer-events-none absolute inset-x-[12%] bottom-2 h-12 rounded-full bg-ink/12 blur-3xl" />

      <div className="absolute left-[2%] top-[4%] h-[96%] w-[52%] animate-float">
        <Image
          src="/mockups/phones/alex-morgan-3d.png"
          alt=""
          width={614}
          height={1024}
          className="h-full w-full object-contain drop-shadow-[0_28px_40px_rgba(15,28,31,0.28)]"
          priority={false}
        />
      </div>

      <div className="absolute right-[0%] top-[10%] h-[90%] w-[50%] animate-float-delayed">
        <Image
          src="/mockups/phones/riverdale-3d.png"
          alt=""
          width={614}
          height={1024}
          className="h-full w-full object-contain drop-shadow-[0_28px_40px_rgba(15,28,31,0.28)]"
          priority={false}
        />
      </div>
    </div>
  );
}
