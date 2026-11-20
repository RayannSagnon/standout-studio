// Small building blocks shared by the client and admin areas (server components).

import type { ReactNode } from "react";
import { STAGE_LABEL, fmtDate } from "@/lib/portal/labels";
import { STAGES, type Lang, type Project } from "@/lib/portal/types";

export function Bar({ area, home, children }: { area: string; home: string; children?: ReactNode }) {
  return (
    <header className="pt-bar">
      <a className="pt-brand" href={home}>
        <span className="pt-mark">
          Standout Studio<i aria-hidden="true" />
        </span>
        <span className="pt-area">{area}</span>
      </a>
      <div className="pt-bar-right">{children}</div>
    </header>
  );
}

export function Flash({ text, tone = "ok" }: { text?: string | null; tone?: "ok" | "error" }) {
  if (!text) return null;
  return (
    <p className="pt-flash" data-tone={tone} role={tone === "error" ? "alert" : "status"}>
      {text}
    </p>
  );
}

export function Pill({ children, tone }: { children: ReactNode; tone?: "ok" | "warn" | "wait" }) {
  return (
    <span className="pt-pill" data-tone={tone}>
      {children}
    </span>
  );
}

export function Title({ children, as: Tag = "h1" }: { children: ReactNode; as?: "h1" | "h2" }) {
  return (
    <Tag className="pt-title">
      {children}
      <i aria-hidden="true" />
    </Tag>
  );
}

export function Steps({ project, lang, labels }: { project: Project; lang: Lang; labels: { done: string; now: string; next: string } }) {
  const current = STAGES.indexOf(project.stage);
  return (
    <ol className="pt-steps" style={{ "--n": STAGES.length } as React.CSSProperties}>
      {STAGES.map((s, i) => {
        const state = i < current || project.stage === "live" ? "done" : i === current ? "now" : "next";
        const date = project.stage_dates[s];
        return (
          <li key={s} className="pt-step" data-state={state} aria-current={state === "now" ? "step" : undefined}>
            <b>{STAGE_LABEL[lang][s]}</b>
            <span>{date && state !== "next" ? fmtDate(date, lang) : state === "now" ? labels.now : state === "done" ? labels.done : labels.next}</span>
          </li>
        );
      })}
    </ol>
  );
}

export function Meter({ used, total }: { used: number; total: number }) {
  const n = Math.max(total, used);
  return (
    <div className="pt-meter-bar" aria-hidden="true">
      {Array.from({ length: n }, (_, i) => (
        <span key={i} data-on={i < used && i < total ? "" : undefined} data-over={i < used && i >= total ? "" : undefined} />
      ))}
    </div>
  );
}

/** A primary button with the site's orb hover (needs the inner span). */
export function Primary({ children, small, ...rest }: { children: ReactNode; small?: boolean } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={`btn btn-primary${small ? " btn-sm" : ""}`} {...rest}>
      <span>{children}</span>
    </button>
  );
}

export function Ghost({ children, small, ...rest }: { children: ReactNode; small?: boolean } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={`btn btn-ghost${small ? " btn-sm" : ""}`} {...rest}>
      {children}
    </button>
  );
}
