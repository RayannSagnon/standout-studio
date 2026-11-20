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
  fr: "Standout Studio, Ottawa. Vous recevez cet email parce que vous avez un espace client chez nous.",
  en: "Standout Studio, Ottawa. You are receiving this email because you have a client area with us.",
};
const ADMIN_FOOT = "Email automatique de l'espace admin Standout Studio.";

function make(subject: string, b: Block): Email {
  return { subject, ...layout(b) };
}

export const emails = {
  login(lang: Lang, url: string): Email {
    return lang === "fr"
      ? make("Votre lien de connexion", {
          heading: "Votre lien de connexion",
          lines: ["Cliquez sur le bouton pour ouvrir votre espace. Le lien fonctionne une seule fois, pendant une heure.", "Si vous n'avez rien demandé, ignorez cet email."],
          cta: { label: "Ouvrir mon espace", url },
          footer: FOOT.fr,
        })
      : make("Your sign-in link", {
          heading: "Your sign-in link",
          lines: ["Click the button to open your client area. The link works once, for one hour.", "If you didn't ask for it, you can ignore this email."],
          cta: { label: "Open my client area", url },
          footer: FOOT.en,
        });
  },

  invite(lang: Lang, name: string, url: string): Email {
    return lang === "fr"
      ? make("Votre espace client Standout Studio", {
          heading: `Bienvenue, ${name}`,
          lines: [
            "Votre espace client est prêt. Vous y suivrez l'avancement de votre site, validerez chaque version, réglerez vos factures et pourrez nous écrire.",
            "Pas de mot de passe : à chaque connexion, on vous envoie un lien comme celui-ci.",
          ],
          cta: { label: "Ouvrir mon espace", url },
          footer: FOOT.fr,
        })
      : make("Your Standout Studio client area", {
          heading: `Welcome, ${name}`,
          lines: [
            "Your client area is ready. Follow your site's progress, approve each version, pay invoices and write to us, all in one place.",
            "No password: each time you sign in, we send you a link like this one.",
          ],
          cta: { label: "Open my client area", url },
          footer: FOOT.en,
        });
  },

  versionShared(lang: Lang, n: number, note: string | null, url: string): Email {
    return lang === "fr"
      ? make(`La version ${n} de votre site est prête`, {
          heading: `La version ${n} est prête`,
          lines: [note || "Une nouvelle version de votre site vous attend.", "Regardez-la, puis dites-nous si vous l'approuvez ou ce qu'il faut changer."],
          cta: { label: "Voir et donner mon avis", url },
          footer: FOOT.fr,
        })
      : make(`Version ${n} of your website is ready`, {
          heading: `Version ${n} is ready`,
          lines: [note || "A new version of your website is waiting for you.", "Take a look, then tell us if you approve it or what should change."],
          cta: { label: "Review it", url },
          footer: FOOT.en,
        });
  },

  stageChanged(lang: Lang, stageLabel: string, url: string): Email {
    return lang === "fr"
      ? make(`Votre projet passe à l'étape : ${stageLabel}`, {
          heading: `Nouvelle étape : ${stageLabel}`,
          lines: ["Votre projet avance. Les détails et la prochaine action sont dans votre espace."],
          cta: { label: "Voir mon projet", url },
          footer: FOOT.fr,
        })
      : make(`Your project moved to: ${stageLabel}`, {
          heading: `New stage: ${stageLabel}`,
          lines: ["Your project is moving forward. Details and the next step are in your client area."],
          cta: { label: "See my project", url },
          footer: FOOT.en,
        });
  },

  invoiceSent(lang: Lang, number: string, label: string, total: number, due: string | null, url: string): Email {
    return lang === "fr"
      ? make(`Facture ${number}`, {
          heading: `Facture ${number}`,
          lines: [`${label} : ${money(total, "fr")}.`, due ? `À régler avant le ${due}.` : "Vous pouvez la régler par carte depuis votre espace."],
          cta: { label: "Voir et payer", url },
          footer: FOOT.fr,
        })
      : make(`Invoice ${number}`, {
          heading: `Invoice ${number}`,
          lines: [`${label}: ${money(total, "en")}.`, due ? `Due by ${due}.` : "You can pay it by card from your client area."],
          cta: { label: "View and pay", url },
          footer: FOOT.en,
        });
  },

  invoicePaidClient(lang: Lang, number: string, total: number, url: string): Email {
    return lang === "fr"
      ? make(`Paiement reçu, facture ${number}`, {
          heading: "Merci, paiement reçu",
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
      ? make(`Petit rappel : la version ${n} attend votre avis`, {
          heading: "On attend votre avis",
          lines: [`La version ${n} de votre site attend votre réponse depuis ${days} jours. Un clic suffit pour l'approuver, ou quelques mots pour demander des changements.`],
          cta: { label: "Donner mon avis", url },
          footer: FOOT.fr,
        })
      : make(`Quick reminder: version ${n} is waiting for you`, {
          heading: "We're waiting for your feedback",
          lines: [`Version ${n} of your website has been waiting for ${days} days. One click approves it, or a few words ask for changes.`],
          cta: { label: "Give feedback", url },
          footer: FOOT.en,
        });
  },

  reminderInvoice(lang: Lang, number: string, total: number, url: string): Email {
    return lang === "fr"
      ? make(`Rappel : facture ${number} en retard`, {
          heading: `La facture ${number} est en retard`,
          lines: [`Le montant de ${money(total, "fr")} n'est pas encore réglé. Si c'est déjà fait, ignorez ce message.`],
          cta: { label: "Payer maintenant", url },
          footer: FOOT.fr,
        })
      : make(`Reminder: invoice ${number} is overdue`, {
          heading: `Invoice ${number} is overdue`,
          lines: [`${money(total, "en")} is still unpaid. If you already paid, please ignore this message.`],
          cta: { label: "Pay now", url },
          footer: FOOT.en,
        });
  },

  /** Every admin email shares one shape: what happened, for whom, and a link. */
  admin(subject: string, lines: string[], url: string): Email {
    return make(subject, { heading: subject, lines, cta: { label: "Ouvrir dans l'admin", url }, footer: ADMIN_FOOT });
  },
};
