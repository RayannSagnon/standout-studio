"use client";

import {
  type ReactNode,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";

type PhoneFrameProps = {
  children: ReactNode;
  className?: string;
  baseRotateX?: number;
  baseRotateY?: number;
  floatDelay?: boolean;
};

export function PhoneFrame({
  children,
  className = "",
  baseRotateX = 8,
  baseRotateY = -12,
  floatDelay = false,
}: PhoneFrameProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  function onPointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    const node = ref.current;
    if (!node) return;
    const rect = node.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width - 0.5;
    const py = (event.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: py * -10, y: px * 14 });
  }

  function onPointerLeave() {
    setTilt({ x: 0, y: 0 });
  }

  return (
    <div
      ref={ref}
      className={[
        "absolute [transform-style:preserve-3d]",
        floatDelay ? "animate-float-delayed" : "animate-float",
        className,
      ].join(" ")}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      style={{
        transform: `rotateX(${baseRotateX + tilt.x}deg) rotateY(${baseRotateY + tilt.y}deg)`,
        transition: "transform 0.28s ease-out",
      }}
    >
      <div className="relative h-full w-full [transform-style:preserve-3d]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -inset-x-[8%] -bottom-[6%] h-[18%] rounded-[100%] bg-ink/25 blur-2xl"
          style={{ transform: "translateZ(-28px) rotateX(80deg)" }}
        />

        {/* Metal chassis */}
        <div
          className="absolute inset-0 rounded-[2.45rem] [transform-style:preserve-3d]"
          style={{
            background:
              "linear-gradient(145deg, #4a5158 0%, #23282e 45%, #0d1013 100%)",
            boxShadow:
              "0 30px 50px rgba(15,28,31,0.32), 0 10px 18px rgba(15,28,31,0.18), inset 0 1px 0 rgba(255,255,255,0.35), inset 0 -2px 4px rgba(0,0,0,0.55)",
          }}
        >
          {/* Depth walls */}
          <div
            aria-hidden="true"
            className="absolute inset-y-[10%] -left-[7px] w-[7px] rounded-l-md"
            style={{
              background:
                "linear-gradient(90deg, #9aa1a8 0%, #3d444c 55%, #15191d 100%)",
              transform: "translateZ(-6px)",
              boxShadow: "inset 1px 0 0 rgba(255,255,255,0.2)",
            }}
          />
          <div
            aria-hidden="true"
            className="absolute inset-y-[10%] -right-[7px] w-[7px] rounded-r-md"
            style={{
              background:
                "linear-gradient(270deg, #a7adb4 0%, #454c54 55%, #171b20 100%)",
              transform: "translateZ(-6px)",
              boxShadow: "inset -1px 0 0 rgba(255,255,255,0.18)",
            }}
          />
          <div
            aria-hidden="true"
            className="absolute inset-x-[12%] -top-[6px] h-[6px] rounded-t-md"
            style={{
              background:
                "linear-gradient(180deg, #b4bac0 0%, #4a5158 60%, #1a1e22 100%)",
              transform: "translateZ(-4px)",
            }}
          />
          <div
            aria-hidden="true"
            className="absolute inset-x-[12%] -bottom-[6px] h-[6px] rounded-b-md"
            style={{
              background:
                "linear-gradient(0deg, #6b727a 0%, #2a3036 55%, #12161a 100%)",
              transform: "translateZ(-4px)",
            }}
          />

          {/* Hardware buttons */}
          <div
            aria-hidden="true"
            className="absolute top-[22%] -left-[10px] h-[6%] w-[4px] rounded-full"
            style={{
              background: "linear-gradient(90deg, #c5cbd1, #4a5158)",
              transform: "translateZ(2px)",
            }}
          />
          <div
            aria-hidden="true"
            className="absolute top-[31%] -left-[10px] h-[10%] w-[4px] rounded-full"
            style={{
              background: "linear-gradient(90deg, #c5cbd1, #4a5158)",
              transform: "translateZ(2px)",
            }}
          />
          <div
            aria-hidden="true"
            className="absolute top-[28%] -right-[10px] h-[13%] w-[4px] rounded-full"
            style={{
              background: "linear-gradient(270deg, #c5cbd1, #4a5158)",
              transform: "translateZ(2px)",
            }}
          />

          {/* Front bezel + screen */}
          <div
            className="absolute inset-[8px] overflow-hidden rounded-[2rem]"
            style={{
              transform: "translateZ(10px)",
              background: "#050607",
              boxShadow:
                "inset 0 0 0 1px rgba(255,255,255,0.1), 0 0 0 1px rgba(0,0,0,0.65)",
            }}
          >
            <div className="relative h-full w-full overflow-hidden rounded-[1.85rem] bg-black">
              <div className="absolute left-1/2 top-[11px] z-30 flex h-[22px] w-[36%] -translate-x-1/2 items-center justify-end rounded-full bg-black px-2.5 shadow-[0_0_0_1px_rgba(255,255,255,0.08)]">
                <span className="h-[7px] w-[7px] rounded-full bg-[#10161a] ring-1 ring-[#243038]" />
              </div>

              <div className="relative h-full w-full overflow-hidden bg-white">
                {children}
              </div>

              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0"
                style={{
                  background:
                    "linear-gradient(125deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.05) 18%, transparent 40%)",
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
