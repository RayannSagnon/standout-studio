"use client";

import { FormEvent, useEffect, useState } from "react";
import { useContent, useLocale } from "@/components/i18n/LocaleProvider";
import SplitText from "@/components/SplitText";

type SubmitState = "idle" | "submitting" | "success" | "error";

const WEB3FORMS_ENDPOINT = "https://api.web3forms.com/submit";

export function Contact() {
  const { locale } = useLocale();
  const { contact } = useContent();
  const [status, setStatus] = useState<SubmitState>("idle");
  const [mdUp, setMdUp] = useState(false);
  const accessKey = process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY;

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const sync = () => setMdUp(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "submitting") return;

    if (!accessKey) {
      setStatus("error");
      return;
    }

    const form = event.currentTarget;
    setStatus("submitting");

    const data = new FormData(form);
    const name = String(data.get("name") || "").trim();
    const email = String(data.get("email") || "").trim();
    const phone = String(data.get("phone") || "").trim();
    const need = String(data.get("need") || "").trim();
    const message = String(data.get("message") || "").trim();

    const body = [
      `Name: ${name}`,
      `Email: ${email}`,
      phone ? `Phone: ${phone}` : null,
      `Need: ${need}`,
      `Locale: ${locale}`,
      "",
      message,
    ]
      .filter(Boolean)
      .join("\n");

    const payload = {
      access_key: accessKey,
      subject: `Standout Studio inquiry from ${name}`,
      from_name: "Standout Studio website",
      name,
      email,
      phone: phone || undefined,
      need,
      message: body,
      replyto: email,
      botcheck: data.get("botcheck") ? "true" : "",
    };

    try {
      const response = await fetch(WEB3FORMS_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = (await response.json().catch(() => null)) as {
        success?: boolean;
      } | null;

      if (!response.ok || !result?.success) {
        setStatus("error");
        return;
      }

      form.reset();
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  return (
    <section className="px-4 py-6 md:px-10 md:py-10" data-cursor="contact">
      <div
        id="contact"
        className="mx-auto flex max-w-[1360px] flex-col gap-6 rounded-3xl bg-hero px-4 py-8 text-inverse md:flex-row md:items-start md:gap-14 md:rounded-[48px] md:px-20 md:py-[72px]"
      >
        <div className="max-w-[624px] md:pt-2">
          <p className="text-[13px] text-[#b8d1cc] md:text-sm">{contact.kicker}</p>
          <SplitText
            key={locale}
            tag="h2"
            text={contact.title}
            splitType="chars"
            delay={28}
            duration={0.6}
            textAlign="left"
            from={{ opacity: 0, y: 32 }}
            to={{ opacity: 1, y: 0 }}
            className="mt-3 max-w-[18ch] font-display text-2xl font-bold leading-tight tracking-tight text-white md:text-[44px]"
          />
          <p className="mt-3 hidden text-base leading-relaxed text-[#b8d1cc] md:block">
            {contact.intro}
          </p>
          <p className="mt-3 text-sm text-[#b8d1cc] md:hidden">
            {contact.mobileIntro}
          </p>
          <p className="mt-4 hidden text-[13px] text-white md:block">
            {contact.meta}
          </p>
        </div>

        <form
          onSubmit={onSubmit}
          className="w-full max-w-[520px] rounded-[20px] bg-white p-4 text-ink md:rounded-[28px] md:p-8"
        >
          <h3 className="font-display text-[22px] font-bold tracking-tight md:text-[28px]">
            {contact.formTitle}
          </h3>
          <p className="mt-3 text-xs text-muted">{contact.requiredHint}</p>

          <input
            type="checkbox"
            name="botcheck"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            className="hidden"
          />

          <label className="mt-4 block text-[13px] font-medium text-ink">
            {contact.fields.name.label}
            <input
              required
              name="name"
              placeholder={contact.fields.name.placeholder}
              className="mt-2 w-full rounded-xl border border-border bg-page px-3.5 py-3 text-sm outline-none transition focus:border-teal"
            />
          </label>

          <label className="mt-3 block text-[13px] font-medium text-ink">
            {contact.fields.email.label}
            <input
              required
              type="email"
              name="email"
              placeholder={contact.fields.email.placeholder}
              className="mt-2 w-full rounded-xl border border-border bg-page px-3.5 py-3 text-sm outline-none transition focus:border-teal"
            />
          </label>

          <label className="mt-3 block text-[13px] font-medium text-ink">
            {contact.fields.phone.label}
            <input
              name="phone"
              placeholder={contact.fields.phone.placeholder}
              className="mt-2 w-full rounded-xl border border-border bg-page px-3.5 py-3 text-sm outline-none transition focus:border-teal"
            />
          </label>

          <label className="mt-3 block text-[13px] font-medium text-ink">
            {contact.fields.need.label}
            <input
              required
              name="need"
              placeholder={
                mdUp
                  ? contact.fields.need.placeholder
                  : contact.fields.need.mobilePlaceholder
              }
              className="mt-2 w-full rounded-xl border border-border bg-page px-3.5 py-3 text-sm outline-none transition focus:border-teal"
            />
          </label>

          <label className="mt-3 block text-[13px] font-medium text-ink">
            {contact.fields.message.label}
            <textarea
              required
              name="message"
              rows={4}
              placeholder={contact.fields.message.placeholder}
              className="mt-2 w-full resize-y rounded-xl border border-border bg-page px-3.5 py-3 text-sm outline-none transition focus:border-teal"
            />
          </label>

          <button
            type="submit"
            disabled={status === "submitting"}
            className="mt-4 inline-flex h-12 w-full items-center justify-center rounded-full bg-hero px-7 text-sm font-semibold text-inverse transition hover:bg-teal-deep disabled:cursor-not-allowed disabled:opacity-70 md:mt-5 md:h-[47px] md:w-auto"
          >
            {status === "submitting" ? contact.submitting : contact.submit}
          </button>

          {status === "success" ? (
            <p className="mt-3 text-sm text-teal" aria-live="polite">
              {contact.sent}
            </p>
          ) : null}
          {status === "error" ? (
            <p className="mt-3 text-sm text-teal-deep" role="alert">
              {contact.error}
            </p>
          ) : null}
        </form>
      </div>
    </section>
  );
}
