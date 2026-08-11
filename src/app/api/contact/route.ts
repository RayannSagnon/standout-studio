import { NextResponse } from "next/server";

const MAX_FILE_BYTES = 5 * 1024 * 1024;
const MAX_FILES = 5;
const WEB3FORMS_ENDPOINT = "https://api.web3forms.com/submit";

function asTrimmedString(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(request: Request) {
  const accessKey = process.env.WEB3FORMS_ACCESS_KEY;

  if (!accessKey) {
    return NextResponse.json(
      { error: "Contact form is not configured." },
      { status: 500 },
    );
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data." }, { status: 400 });
  }

  // Honeypot: bots fill this, humans never see it.
  if (asTrimmedString(form.get("botcheck"))) {
    return NextResponse.json({ success: true });
  }

  const name = asTrimmedString(form.get("name"));
  const email = asTrimmedString(form.get("email"));
  const phone = asTrimmedString(form.get("phone"));
  const need = asTrimmedString(form.get("need"));
  const message = asTrimmedString(form.get("message"));
  const locale = asTrimmedString(form.get("locale")) || "en";

  if (!name || !email || !need || !message) {
    return NextResponse.json(
      { error: "Missing required fields." },
      { status: 400 },
    );
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Invalid email." }, { status: 400 });
  }

  const files = form
    .getAll("files")
    .filter((entry): entry is File => entry instanceof File && entry.size > 0);

  if (files.length > MAX_FILES) {
    return NextResponse.json(
      { error: "Too many files." },
      { status: 400 },
    );
  }

  if (files.some((file) => file.size > MAX_FILE_BYTES)) {
    return NextResponse.json(
      { error: "A file exceeds the 5 MB limit." },
      { status: 400 },
    );
  }

  const fileNames = files.map((file) => file.name);
  const body = [
    `Name: ${name}`,
    `Email: ${email}`,
    phone ? `Phone: ${phone}` : null,
    `Need: ${need}`,
    `Locale: ${locale}`,
    "",
    message,
    fileNames.length
      ? `\nSelected files (names only; ask the client to send them by reply):\n${fileNames
          .map((fileName) => `- ${fileName}`)
          .join("\n")}`
      : null,
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
  };

  let upstream: Response;
  try {
    upstream = await fetch(WEB3FORMS_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });
  } catch {
    return NextResponse.json(
      { error: "Could not reach the mail service." },
      { status: 502 },
    );
  }

  const result = (await upstream.json().catch(() => null)) as {
    success?: boolean;
    message?: string;
  } | null;

  if (!upstream.ok || !result?.success) {
    return NextResponse.json(
      { error: result?.message || "Failed to send message." },
      { status: 502 },
    );
  }

  return NextResponse.json({ success: true });
}
