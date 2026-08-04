import Image from "next/image";

export function BusinessSiteScreen() {
  return (
    <div className="flex h-full flex-col bg-white text-ink">
      <div className="flex items-center justify-between px-3 pb-2 pt-7">
        <p className="text-[8px] font-semibold tracking-[0.14em] text-ink">
          RIVERDALE INTERIORS
        </p>
        <span className="flex flex-col gap-[2px]" aria-hidden="true">
          <span className="h-[1.5px] w-3 bg-ink" />
          <span className="h-[1.5px] w-3 bg-ink" />
          <span className="h-[1.5px] w-3 bg-ink" />
        </span>
      </div>

      <div className="relative mx-3 h-[42%] overflow-hidden rounded-md">
        <Image
          src="/mockups/riverdale-living.jpg"
          alt="Riverdale Interiors living room"
          width={900}
          height={700}
          className="h-full w-full object-cover"
        />
      </div>

      <div className="flex flex-1 flex-col px-3.5 pb-4 pt-3">
        <p className="text-[8px] font-semibold tracking-[0.16em] text-teal">
          THOUGHTFUL SPACES
        </p>
        <h3 className="mt-1 font-display text-[15px] font-bold leading-tight tracking-tight">
          Beautiful interiors. Designed for living.
        </h3>
        <p className="mt-1.5 text-[9px] leading-relaxed text-muted">
          From first visit to finished rooms, a clear path to book a consult.
        </p>

        <div className="mt-auto space-y-2 pt-3">
          <div className="flex items-center justify-center gap-1.5 rounded-full bg-teal py-2 text-[10px] font-semibold text-white">
            <span aria-hidden="true">☎</span>
            <span>(613) 555-0148</span>
          </div>
          <p className="text-center text-[9px] font-medium text-teal">
            View Our Work →
          </p>
        </div>
      </div>
    </div>
  );
}
