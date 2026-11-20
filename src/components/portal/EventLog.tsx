// The studio's journal, grouped by day. Automatic events (reminders, internal
// bookkeeping) are kept apart so the important ones stand out.

import { dayLabel, dayOf } from "@/lib/portal/labels";
import type { EventType, PortalEvent } from "@/lib/portal/types";
import { adminEventText } from "./AdminShell";

export const AUTO_EVENTS: EventType[] = ["reminder.feedback", "reminder.invoice", "project.next_action", "message.posted"];
export const isAuto = (e: PortalEvent) => AUTO_EVENTS.includes(e.type);

type Row = PortalEvent & { clientName?: string };

export default function EventLog({ events, clock, withClient = false }: { events: Row[]; clock: Date; withClient?: boolean }) {
  const groups: { day: string; label: string; items: Row[] }[] = [];
  for (const e of events) {
    const day = dayOf(new Date(e.created_at));
    let g = groups.at(-1);
    if (!g || g.day !== day) groups.push((g = { day, label: dayLabel(e.created_at, clock), items: [] }));
    g.items.push(e);
  }
  if (!groups.length) return <p className="pt-empty">Rien à afficher.</p>;
  return (
    <div className="pt-days">
      {groups.map((g) => (
        <section key={g.day} className="pt-day" aria-label={g.label}>
          <h3 className="pt-day-label">{g.label}</h3>
          <ol className="pt-log">
            {g.items.map((e) => (
              <li key={e.id}>
                <time dateTime={e.created_at}>{new Date(e.created_at).toLocaleTimeString("fr-CA", { hour: "2-digit", minute: "2-digit", timeZone: "America/Toronto" })}</time>
                <span>
                  {withClient && e.clientName && (
                    <>
                      <a className="link" href={`/admin/clients/${e.client_id}`}>
                        {e.clientName}
                      </a>
                      {" : "}
                    </>
                  )}
                  <span className={e.type === "email.failed" ? "pt-danger" : undefined}>{adminEventText(e)}</span>
                </span>
              </li>
            ))}
          </ol>
        </section>
      ))}
    </div>
  );
}
