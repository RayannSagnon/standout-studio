"use client";

import { FormEvent, useState } from "react";
import { contact, site } from "@/content/en";

export function Contact() {
  const [sent, setSent] = useState(false);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") || "").trim();
    const email = String(form.get("email") || "").trim();
    const phone = String(form.get("phone") || "").trim();
    const need = String(form.get("need") || "").trim();
    const message = String(form.get("message") || "").trim();

    const body = [
      `Name: ${name}`,
      `Email: ${email}`,
      phone ? `Phone: ${phone}` : null,
      `Need: ${need}`,
      "",
      message,
    ]
      .filter(Boolean)
      .join("\n");

    const mailto = `mailto:${site.email}?subject=${encodeURIComponent(
      `Standout Studio inquiry from ${name}`,
    )}&body=${encodeURIComponent(body)}`;

    window.location.href = mailto;
    setSent(true);
  }

  return (
    <section className="px-4 py-6 md:px-10 md:py-10">
      <div
        id="contact"
        className="mx-auto flex max-w-[1360px] flex-col gap-6 rounded-3xl bg-hero px-4 py-8 text-inverse md:flex-row md:items-start md:gap-14 md:rounded-[48px] md:px-20 md:py-[72px]"
      >
        <div className="max-w-[624px] md:pt-2">
          <p className="text-[13px] text-[#b8d1cc] md:text-sm">{contact.kicker}</p>
          <h2 className="mt-3 max-w-[18ch] font-display text-2xl font-bold leading-tight tracking-tight text-white md:text-[44px]">
            {contact.title}
          </h2>
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
          <p className="mt-1 hidden text-sm text-muted md:block">
            {contact.formSupport}
          </p>
          <p className="mt-3 text-xs text-muted">{contact.requiredHint}</p>

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

          <label className="mt-3 hidden text-[13px] font-medium text-ink md:block">
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
              placeholder={contact.fields.need.placeholder}
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
            className="mt-4 inline-flex h-12 w-full items-center justify-center rounded-full bg-hero px-7 text-sm font-semibold text-inverse transition hover:bg-teal-deep md:mt-5 md:h-[47px] md:w-auto"
          >
            {contact.submit}
          </button>

          {sent ? (
            <p className="mt-3 text-sm text-teal">
              Opening your email app with the message ready to send.
            </p>
          ) : null}
        </form>
      </div>
    </section>
  );
}
