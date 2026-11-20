// Building blocks shared by the client and admin areas (server components).

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

/** Status as the brand dot followed by the word. */
export function Status({ children, tone }: { children: ReactNode; tone?: "ok" | "warn" | "wait" }) {
  return (
    <span className="pt-st" data-tone={tone}>
      {children}
    </span>
  );
}

export function Title({ children }: { children: ReactNode }) {
  return (
    <h1 className="pt-title">
      {children}
      <i aria-hidden="true" />
    </h1>
  );
}

/** A page section: heading on the left, content on the right, a hairline above. */
export function Section({ id, title, note, children }: { id?: string; title: ReactNode; note?: ReactNode; children: ReactNode }) {
  const hid = id ? `${id}-title` : undefined;
  return (
    <section className="pt-sec" id={id} aria-labelledby={hid}>
      <div className="pt-sec-head">
        <h2 className="pt-h2" id={hid}>
          {title}
        </h2>
        {note && <p className="pt-sec-note">{note}</p>}
      </div>
      <div className="pt-body">{children}</div>
    </section>
  );
}

/** The five stages written out; a sarcelle line above what is done. */
export function Stages({ project, lang, labels }: { project: Project; lang: Lang; labels: { now: string; next: string } }) {
  const current = STAGES.indexOf(project.stage);
  return (
    <ol className="pt-stages">
      {STAGES.map((s, i) => {
        const state = i < current || project.stage === "live" ? "done" : i === current ? "now" : "next";
        const date = project.stage_dates[s];
        return (
          <li key={s} className="pt-stage" data-state={state} aria-current={state === "now" ? "step" : undefined}>
            <b>{STAGE_LABEL[lang][s]}</b>
            <span>{state === "next" ? labels.next : date ? fmtDate(date, lang, true) : labels.now}</span>
          </li>
        );
      })}
    </ol>
  );
}

const PATHS = {
  arrow: "M7 17 17 7M8 7h9v9",
  plus: "M12 5v14M5 12h14",
};

export function Icon({ name }: { name: keyof typeof PATHS }) {
  return (
    <svg className="pt-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={PATHS[name]} />
    </svg>
  );
}

/** A disclosure written as a text link with a plus that turns into a cross. */
export function More({ label, open, children }: { label: ReactNode; open?: boolean; children: ReactNode }) {
  return (
    <details className="pt-more" open={open || undefined}>
      <summary>
        <Icon name="plus" />
        {label}
      </summary>
      {children}
    </details>
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
