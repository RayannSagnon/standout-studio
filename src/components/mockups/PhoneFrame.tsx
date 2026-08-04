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
    setTilt({ x: py * -8, y: px * 10 });
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
        transition: "transform 0.25s ease-out",
      }}
    >
      <div className="relative h-full w-full rounded-[2.15rem] bg-gradient-to-br from-[#2a3034] via-[#12161a] to-[#050708] p-[7px] shadow-[0_30px_60px_rgba(15,28,31,0.28),inset_0_1px_0_rgba(255,255,255,0.18)]">
        <div className="absolute inset-x-[18%] top-[5px] z-20 mx-auto h-[18px] w-[34%] rounded-full bg-black" />
        <div className="relative h-full w-full overflow-hidden rounded-[1.75rem] bg-white">
          {children}
        </div>
        <div className="pointer-events-none absolute inset-0 rounded-[2.15rem] ring-1 ring-white/10" />
      </div>
    </div>
  );
}
