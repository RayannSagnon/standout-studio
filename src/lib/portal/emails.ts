// Email templates. Client emails follow the client's language; admin emails are in French.
// Plain, branded HTML that renders in every mail client (tables, inline styles).

import type { Lang } from "./types.ts";

export type Email = { subject: string; text: string; html: string };

export const money = (cents: number, lang: Lang) =>
  new Intl.NumberFormat(lang === "fr" ? "fr-CA" : "en-CA", { style: "currency", currency: "CAD" }).format(cents / 100);

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string);

type Block = { heading: string; lines: string[]; cta?: { label: string; url: string }; footer: string };

function layout(b: Block): { text: string; html: string } {
  const text = [b.heading, "", ...b.lines, ...(b.cta ? ["", `${b.cta.label} : ${b.cta.url}`] : []), "", "Standout Studio", b.footer].join("\n");
  const paras = b.lines
    .map((l) => `<p style="margin:0 0 14px;font-size:16px;line-height:1.55;color:#0c2624;white-space:pre-line">${esc(l)}</p>`)
    .join("");
  const button = b.cta
    ? `<p style="margin:24px 0"><a href="${esc(b.cta.url)}" style="display:inline-block;background:#0f6b66;color:#f3f5f4;text-decoration:none;padding:13px 22px;border-radius:999px;font-size:16px">${esc(b.cta.label)}</a></p>`
    : "";
  const html = `<!doctype html><html><body style="margin:0;background:#f3f5f4;font-family:Helvetica,Arial,sans-serif">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f3f5f4"><tr><td align="center" style="padding:32px 16px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px"><tr><td style="padding:32px">
<p style="margin:0 0 28px;font-size:18px;font-weight:600;color:#0c2624">Standout Studio<span style="color:#0f6b66">.</span></p>
<h1 style="margin:0 0 18px;font-size:24px;line-height:1.25;font-weight:500;color:#0c2624">${esc(b.heading)}</h1>
${paras}${button}
<p style="margin:28px 0 0;font-size:13px;line-height:1.5;color:#5b6f6d">${esc(b.footer)}</p>
</td></tr></table></td></tr></table></body></html>`;
  return { text, html };
}

const FOOT = {
  fr: "Standout Studio, Ottawa. Vous recevez ce courriel parce que vous avez un espace client chez nous.",
  en: "Standout Studio, Ottawa. You are receiving this email because you have a client area with us.",
};
const ADMIN_FOOT = "Courriel envoyé par l'admin Standout Studio.";

function make(subject: string, b: Block): Email {
  return { subject, ...layout(b) };
}

export const emails = {
  login(lang: Lang, url: string): Email {
    return lang === "fr"
      ? make("Votre lien de connexion", {
          heading: "Votre lien de connexion",
          lines: ["Ce lien ouvre votre espace client. Il sert une seule fois et reste valable une heure.", "Vous n'avez rien demandé ? Ignorez ce courriel."],
          cta: { label: "Ouvrir mon espace", url },
          footer: FOOT.fr,
        })
      : make("Your sign-in link", {
          heading: "Your sign-in link",
          lines: ["This link opens your client area. It works once, for one hour.", "Didn't ask for it? You can ignore this email."],
          cta: { label: "Open my client area", url },
          footer: FOOT.en,
        });
  },

  invite(lang: Lang, name: string, url: string): Email {
    return lang === "fr"
      ? make("Votre espace client Standout Studio", {
          heading: `Bienvenue, ${name}`,
          lines: [
            "Votre espace client est prêt. C'est là qu'on vous montrera chaque version de votre site avant la mise en ligne.",
            "Pour revenir plus tard, entrez votre courriel sur la page de connexion. On vous enverra un lien comme celui-ci.",
          ],
          cta: { label: "Ouvrir mon espace", url },
          footer: FOOT.fr,
        })
      : make("Your Standout Studio client area", {
          heading: `Welcome, ${name}`,
          lines: [
            "Your client area is ready. That's where we'll show you each version of your website before it goes live.",
            "To come back later, enter your email on the sign-in page and we'll send you a link like this one.",
          ],
          cta: { label: "Open my client area", url },
          footer: FOOT.en,
        });
  },

  versionShared(lang: Lang, n: number, note: string | null, url: string): Email {
    return lang === "fr"
      ? make(`La version ${n} de votre site est prête`, {
          heading: `La version ${n} est prête`,
          lines: [note || "Une nouvelle version de votre site est en ligne.", "Regardez-la, puis approuvez-la ou dites-nous ce qu'il faut changer."],
          cta: { label: "Voir la version", url },
          footer: FOOT.fr,
        })
      : make(`Version ${n} of your website is ready`, {
          heading: `Version ${n} is ready`,
          lines: [note || "A new version of your website is up.", "Take a look, then approve it or tell us what should change."],
          cta: { label: "See the version", url },
          footer: FOOT.en,
        });
  },

  stageChanged(lang: Lang, stageLabel: string, url: string): Email {
    return lang === "fr"
      ? make(`Votre projet passe à l'étape : ${stageLabel}`, {
          heading: `Nouvelle étape : ${stageLabel}`,
          lines: ["La suite est expliquée dans votre espace client."],
          cta: { label: "Voir mon projet", url },
          footer: FOOT.fr,
        })
      : make(`Your project moved to: ${stageLabel}`, {
          heading: `New stage: ${stageLabel}`,
          lines: ["What happens next is in your client area."],
          cta: { label: "See my project", url },
          footer: FOOT.en,
        });
  },

  invoiceSent(lang: Lang, number: string, label: string, total: number, due: string | null, url: string): Email {
    return lang === "fr"
      ? make(`Facture ${number}`, {
          heading: `Facture ${number}`,
          lines: [`${label} : ${money(total, "fr")}.`, due ? `À payer avant le ${due}, par carte, depuis votre espace client.` : "Vous pouvez la payer par carte depuis votre espace client."],
          cta: { label: "Voir et payer", url },
          footer: FOOT.fr,
        })
      : make(`Invoice ${number}`, {
          heading: `Invoice ${number}`,
          lines: [`${label}: ${money(total, "en")}.`, due ? `Due by ${due}. You can pay by card from your client area.` : "You can pay it by card from your client area."],
          cta: { label: "View and pay", url },
          footer: FOOT.en,
        });
  },

  invoicePaidClient(lang: Lang, number: string, total: number, url: string): Email {
    return lang === "fr"
      ? make(`Paiement reçu, facture ${number}`, {
          heading: "Paiement reçu, merci",
          lines: [`Nous avons bien reçu ${money(total, "fr")} pour la facture ${number}.`],
          cta: { label: "Voir mes factures", url },
          footer: FOOT.fr,
        })
      : make(`Payment received, invoice ${number}`, {
          heading: "Thank you, payment received",
          lines: [`We received ${money(total, "en")} for invoice ${number}.`],
          cta: { label: "See my invoices", url },
          footer: FOOT.en,
        });
  },

  messageToClient(lang: Lang, author: string, body: string, url: string): Email {
    return lang === "fr"
      ? make(`Nouveau message de ${author}`, { heading: `${author} vous a écrit`, lines: [body], cta: { label: "Répondre", url }, footer: FOOT.fr })
      : make(`New message from ${author}`, { heading: `${author} wrote to you`, lines: [body], cta: { label: "Reply", url }, footer: FOOT.en });
  },

  reminderFeedback(lang: Lang, n: number, days: number, url: string): Email {
    return lang === "fr"
      ? make(`Rappel : la version ${n} attend votre réponse`, {
          heading: "On attend votre réponse",
          lines: [`La version ${n} de votre site attend votre réponse depuis ${days} jours. Il vous suffit de l'approuver, ou de nous dire en quelques mots ce qu'il faut changer.`],
          cta: { label: "Voir la version", url },
          footer: FOOT.fr,
        })
      : make(`Reminder: version ${n} is waiting for your answer`, {
          heading: "We're waiting for your answer",
          lines: [`Version ${n} of your website has been waiting for your answer for ${days} days. You can approve it, or tell us in a few words what should change.`],
          cta: { label: "See the version", url },
          footer: FOOT.en,
        });
  },

  reminderInvoice(lang: Lang, number: string, total: number, url: string): Email {
    return lang === "fr"
      ? make(`Rappel : facture ${number} en retard`, {
          heading: `La facture ${number} est en retard`,
          lines: [`${money(total, "fr")} restent à payer. Si vous venez de le faire, ignorez ce courriel.`],
          cta: { label: "Payer maintenant", url },
          footer: FOOT.fr,
        })
      : make(`Reminder: invoice ${number} is overdue`, {
          heading: `Invoice ${number} is overdue`,
          lines: [`${money(total, "en")} is still unpaid. If you just paid, you can ignore this email.`],
          cta: { label: "Pay now", url },
          footer: FOOT.en,
        });
  },

  /** Every admin email shares one shape: what happened, for whom, and a link. */
  admin(subject: string, lines: string[], url: string): Email {
    return make(subject, { heading: subject, lines, cta: { label: "Ouvrir dans l'admin", url }, footer: ADMIN_FOOT });
  },
};
