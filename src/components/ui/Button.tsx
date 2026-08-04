import Link from "next/link";
import type { ReactNode } from "react";

type ButtonVariant = "primary" | "ghost" | "nav";

type ButtonProps = {
  href: string;
  children: ReactNode;
  variant?: ButtonVariant;
  className?: string;
};

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-teal text-inverse hover:bg-teal-deep focus-visible:outline-teal",
  ghost:
    "bg-transparent text-inverse ring-1 ring-inset ring-white/25 hover:bg-white/5 focus-visible:outline-inverse",
  nav: "bg-teal text-inverse hover:bg-teal-deep focus-visible:outline-teal",
};

export function Button({
  href,
  children,
  variant = "primary",
  className = "",
}: ButtonProps) {
  return (
    <Link
      href={href}
      className={[
        "inline-flex items-center justify-center rounded-full px-7 py-4 text-[15px] font-semibold tracking-tight transition-colors",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
        variants[variant],
        className,
      ].join(" ")}
    >
      {children}
    </Link>
  );
}
