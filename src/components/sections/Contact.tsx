"use client";

import { FormEvent, useEffect, useId, useRef, useState } from "react";
import { useContent, useLocale } from "@/components/i18n/LocaleProvider";
import SplitText from "@/components/SplitText";

export function Contact() {
  const { locale } = useLocale();
  const { contact, site } = useContent();
  const [sent, setSent] = useState(false);
  const [fileNames, setFileNames] = useState<string[]>([]);
  const [fileError, setFileError] = useState("");
  const [mdUp, setMdUp] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fileInputId = useId();
  const MAX_FILE_BYTES = 5 * 1024 * 1024;

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const sync = () => setMdUp(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") || "").trim();
    const email = String(form.get("email") || "").trim();
    const phone = String(form.get("phone") || "").trim();
    const need = String(form.get("need") || "").trim();
    const message = String(form.get("message") || "").trim();

    const body = [
      `${contact.fields.name.mailLabel}: ${name}`,
      `${contact.fields.email.mailLabel}: ${email}`,
      phone ? `${contact.fields.phone.mailLabel}: ${phone}` : null,
      `${contact.fields.need.mailLabel}: ${need}`,
      "",
      message,
      fileNames.length
        ? `\n${contact.fields.files.mailNote}\n${fileNames
            .map((file) => `- ${file}`)
            .join("\n")}`
        : null,
    ]
      .filter(Boolean)
      .join("\n");

    const mailto = `mailto:${site.email}?subject=${encodeURIComponent(
      `${contact.mailSubject} ${name}`,
    )}&body=${encodeURIComponent(body)}`;

    window.location.href = mailto;
    setSent(true);
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

          <div className="mt-3">
            <label
              htmlFor={fileInputId}
              className="block text-[13px] font-medium text-ink"
            >
              {contact.fields.files.label}
            </label>
            <div className="mt-2 flex items-center gap-3 rounded-xl border border-border bg-page px-3 py-2.5">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="pressable inline-flex h-11 shrink-0 items-center justify-center rounded-full bg-teal px-4 text-[13px] font-semibold text-inverse transition-colors hover:bg-teal-deep"
              >
                {contact.fields.files.button}
              </button>
              <p className="min-w-0 flex-1 truncate text-sm text-muted">
                {fileNames.length
                  ? fileNames.join(", ")
                  : contact.fields.files.empty}
              </p>
              <input
                ref={fileInputRef}
                id={fileInputId}
                type="file"
                name="files"
                multiple
                accept=".pdf,.png,.jpg,.jpeg,.webp,.doc,.docx,.zip,.fig"
                className="sr-only"
                onChange={(event) => {
                  const files = Array.from(event.target.files ?? []);
                  const oversized = files.some(
                    (file) => file.size > MAX_FILE_BYTES,
                  );
                  if (oversized) {
                    setFileError(contact.fields.files.tooLarge);
                    setFileNames([]);
                    event.target.value = "";
                    return;
                  }
                  setFileError("");
                  setFileNames(files.map((file) => file.name));
                }}
              />
            </div>
            <p className="mt-1.5 text-[12px] text-muted">
              {contact.fields.files.hint}
            </p>
            {fileError ? (
              <p className="mt-1.5 text-[12px] text-teal-deep" role="alert">
                {fileError}
              </p>
            ) : null}
          </div>

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
            <p className="mt-3 text-sm text-teal" aria-live="polite">
              {fileNames.length ? contact.sentWithFiles : contact.sent}
            </p>
          ) : null}
        </form>
      </div>
    </section>
  );
}
