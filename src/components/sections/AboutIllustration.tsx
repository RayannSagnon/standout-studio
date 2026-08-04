"use client";

function GlobeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M3.5 12h17M12 3.5c2.4 2.6 3.6 5.4 3.6 8.5S14.4 17.9 12 20.5C9.6 17.9 8.4 15.1 8.4 12S9.6 6.1 12 3.5Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <rect
        x="8"
        y="3.5"
        width="8"
        height="17"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <circle cx="12" cy="17.5" r="1" fill="currentColor" />
    </svg>
  );
}

function DeviceIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <rect
        x="3.5"
        y="5.5"
        width="17"
        height="12"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path d="M8 20.5h8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function Spark({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={[
        "absolute h-1.5 w-2.5 rotate-[28deg] rounded-sm bg-teal-deep/70",
        className,
      ].join(" ")}
    />
  );
}

export function AboutIllustration() {
  return (
    <div
      className="relative h-40 overflow-hidden rounded-[20px] bg-[#dff3f0] md:h-[380px] md:rounded-[28px]"
      aria-hidden="true"
    >
      <div className="absolute -left-10 top-[48%] h-[180px] w-[180px] rounded-full bg-[#bfe4df]/70" />
      <div className="absolute -right-8 -top-8 h-[140px] w-[140px] rounded-full bg-[#f7d7c6]/80" />
      <div className="absolute left-10 top-8 h-[100px] w-[100px] rounded-full bg-[#cfeae6]/80" />

      <Spark className="left-[16%] top-[18%] animate-float" />
      <Spark className="right-[26%] top-[14%] animate-float-delayed" />
      <Spark className="bottom-[14%] left-[12%] animate-float-delayed" />
      <Spark className="bottom-[12%] right-[8%] animate-float" />

      {/* Browser card */}
      <div className="absolute left-1/2 top-[16%] w-[68%] -translate-x-1/2 overflow-hidden rounded-2xl border border-white/80 bg-white shadow-[0_18px_40px_rgba(15,28,31,0.12)] md:top-[18%] md:w-[60%] md:rounded-[20px]">
        <div className="flex items-center gap-1.5 border-b border-border/80 px-3 py-2.5">
          <span className="h-2 w-2 rounded-full bg-[#ff5f57]" />
          <span className="h-2 w-2 rounded-full bg-[#febc2e]" />
          <span className="h-2 w-2 rounded-full bg-[#28c840]" />
        </div>
        <div className="space-y-3 px-5 py-5 md:px-7 md:py-6">
          <div className="h-8 rounded-lg bg-[#9fd3cd] md:h-9" />
          <div className="h-2 w-[72%] rounded bg-ink/15" />
          <div className="h-2 w-[56%] rounded bg-ink/10" />
          <div className="h-7 w-[34%] rounded-full bg-teal md:h-8" />
        </div>
      </div>

      {/* Floating service chips */}
      <div className="absolute left-[7%] top-[30%] flex h-11 w-11 items-center justify-center rounded-2xl bg-[#ef6b63] text-white shadow-md animate-float md:h-[52px] md:w-[52px]">
        <GlobeIcon />
      </div>
      <div className="absolute right-[6%] top-[40%] flex h-11 w-11 items-center justify-center rounded-2xl bg-teal text-white shadow-md animate-float-delayed md:h-[52px] md:w-[52px]">
        <PhoneIcon />
      </div>
      <div className="absolute bottom-[12%] right-[14%] flex h-11 w-11 items-center justify-center rounded-2xl bg-[#8b7cc9] text-white shadow-md animate-float md:h-[52px] md:w-[52px]">
        <DeviceIcon />
      </div>
    </div>
  );
}
