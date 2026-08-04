import Image from "next/image";
import type { ReactNode } from "react";

function Row({
  icon,
  label,
}: {
  icon: ReactNode;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2.5 rounded-xl border border-white/15 px-2.5 py-2">
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-[10px] text-[#9fd3cd]">
        {icon}
      </span>
      <span className="truncate text-[10px] text-white/90">{label}</span>
    </div>
  );
}

export function DigitalCardScreen() {
  return (
    <div className="relative flex h-full flex-col bg-[#0b1c1f] px-3.5 pb-4 pt-11 text-white">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(circle at 80% 90%, rgba(15,118,110,0.35), transparent 40%), radial-gradient(circle at 10% 85%, rgba(15,118,110,0.2), transparent 35%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-28 opacity-30"
        style={{
          backgroundImage:
            "repeating-linear-gradient(115deg, transparent 0 10px, rgba(15,118,110,0.2) 10px 11px)",
        }}
      />

      <div className="relative mx-auto h-16 w-16 overflow-hidden rounded-full ring-2 ring-[#0f766e]/60">
        <Image
          src="/mockups/alex-portrait.jpg"
          alt="Alex Morgan"
          width={128}
          height={128}
          className="h-full w-full object-cover"
        />
      </div>
      <p className="relative mt-3 text-center font-display text-[17px] font-semibold tracking-tight">
        Alex Morgan
      </p>
      <p className="relative text-center text-[10px] text-[#9fd3cd]">
        Financial Consultant
      </p>

      <div className="relative mt-4 space-y-2">
        <Row icon="☎" label="+1 (613) 555-0182" />
        <Row icon="@" label="alex@morganfinance.ca" />
        <Row icon="◎" label="morganfinance.ca" />
        <Row icon="⌖" label="Ottawa, ON" />
      </div>

      <div className="relative mt-auto flex flex-col items-center pt-4">
        <div className="flex h-[88px] w-[88px] items-center justify-center rounded-md bg-white p-1.5">
          <svg viewBox="0 0 80 80" className="h-full w-full" aria-hidden="true">
            <rect width="80" height="80" fill="white" />
            <path
              fill="black"
              d="M8 8h28v28H8zm6 6h16v16H14zm30-6h28v28H44zm6 6h16v16H50zM8 44h28v28H8zm6 6h16v16H14zm46-6h6v6h-6zm-6 12h6v6h-6zm12 0h6v6h-6zm-6 12h18v6H54zm12-24h6v18h-6z"
            />
          </svg>
        </div>
        <p className="mt-2 text-[9px] tracking-wide text-white/70">Save contact</p>
      </div>
    </div>
  );
}
