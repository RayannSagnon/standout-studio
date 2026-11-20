// End-to-end walk through the client and admin areas in demo mode.
// Start the site first (npm run build && npx next start -p 3177), then:
//   node scripts/e2e-portal.mjs [baseUrl] [screenshotDir]
// Fails loudly on the first broken step. Screenshots at phone, tablet and desktop widths.

import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const BASE = process.argv[2] || "http://localhost:3177";
const OUT = process.argv[3] || "tmp-e2e";
mkdirSync(OUT, { recursive: true });

const SIZES = { phone: { width: 390, height: 844 }, tablet: { width: 820, height: 1180 }, desktop: { width: 1440, height: 900 } };
const errors = [];
// On Vercel, demo data lives in memory per serverless function, so a prospect filed
// by /api/leads may not show in the admin page. With Supabase there is one database.
const REMOTE = !/localhost|127.0.0.1/.test(BASE);
const soft = (cond, msg) => (REMOTE ? cond || console.log(`    (skipped online, demo memory is per function) ${msg}`) : check(cond, msg));
let step = 0;
const log = (m) => console.log(`${String(++step).padStart(2, "0")}. ${m}`);
function check(cond, msg) {
  if (!cond) throw new Error(`FAILED: ${msg}`);
}

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: SIZES.desktop });
const page = await ctx.newPage();
page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
page.on("console", (m) => m.type() === "error" && errors.push(`console: ${m.text()}`));

async function shots(name) {
  for (const [label, size] of Object.entries(SIZES)) {
    await page.setViewportSize(size);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(150);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    check(overflow <= 1, `${name} has horizontal scroll at ${label} (${overflow}px)`);
    await page.screenshot({ path: `${OUT}/${name}-${label}.png`, fullPage: true });
  }
  await page.setViewportSize(SIZES.desktop);
}

async function signIn(name, path = "/fr/client/login") {
  await page.goto(BASE + path);
  await page.locator(".pt-accounts button", { hasText: name }).click();
  await page.waitForURL(/sent=1/);
  await page.getByRole("link", { name: /^(Ouvrir le lien|Open the link)$/ }).click();
  await page.waitForLoadState("networkidle");
}

async function signOut() {
  await page.getByRole("button", { name: /Se déconnecter|Sign out/ }).first().click();
  await page.waitForURL(/login/);
}

const flash = () => page.locator(".pt-flash").first().innerText();

try {
  // Reset the demo store through the admin, so the run starts from the seed
  await signIn("Rayann");
  await page.goto(`${BASE}/admin/journal`);
  await page.getByRole("button", { name: "Remettre la démo à zéro" }).click();
  await page.waitForURL(/demo_reset/);
  await signOut();

  await page.goto(`${BASE}/fr/client/login`);
  await shots("01-login");
  log("sign-in page renders");

  await page.goto(`${BASE}/client`);
  check(page.url().includes("/client/login"), "signed-out visitors are sent to sign-in");
  log("client area is closed to strangers");

  await page.goto(`${BASE}/auth/confirm?demo=forged.token`);
  check(page.url().includes("error=link"), "a forged link is refused");
  log("forged sign-in link refused");

  await signIn("Camille Roy");
  check(page.url().endsWith("/fr/client"), `Camille lands on /fr/client (got ${page.url()})`);
  check(await page.locator(".pt-title").innerText().then((t) => t.includes("Camille")), "greets Camille");
  check(!(await page.content()).includes("Calendly"), "internal notes never reach the client page");
  await shots("02-client-dashboard");
  log("client dashboard renders without internal notes");

  await page.goto(`${BASE}/admin`);
  check(page.url().endsWith("/client"), "a client cannot open the admin");
  await page.goto(`${BASE}/client/pay/i3?lang=fr`);
  check(!page.url().includes("/pay/"), "a client cannot pay another client's invoice");
  await page.goto(`${BASE}/fr/client`);
  log("client is kept out of the admin and of other clients' invoices");

  await page.getByText("Demander des modifications").click();
  await page.getByRole("button", { name: "Envoyer mes commentaires" }).click();
  check(page.url().includes("/fr/client"), "empty feedback stays on the page (browser validation)");
  await page.locator("textarea[name=comment]").fill("Mettre la photo de Camille plus grande sur l'accueil.");
  await page.getByRole("button", { name: "Envoyer mes commentaires" }).click();
  await page.waitForURL(/ok=changes/);
  check((await flash()).includes("prochaine version"), "feedback confirmation shown");
  check((await page.locator("#project .pt-small").first().innerText()).includes("2 révisions utilisées sur 3"), "revision counter moved to 2 of 3");
  log("client asks for changes, revision counter updates");

  await page.locator("textarea[name=body]").fill("Merci ! Et pour le blogue, on en reparle en décembre ?");
  await page.getByRole("button", { name: "Envoyer", exact: true }).click();
  await page.waitForURL(/ok=message/);
  check((await page.locator(".pt-msg").count()) === 3, "message added to the thread");
  log("client sends a message");
  await signOut();

  // Contact form → prospect
  const res = await page.request.post(`${BASE}/api/leads`, {
    headers: { "Content-Type": "application/json", Origin: BASE },
    data: { name: "Test Formulaire", email: "form@demo.standout", message: "site web\n\nUn site pour mon salon.", lang: "fr" },
  });
  check(res.status() === 204, `lead API answers 204 (got ${res.status()})`);
  const bot = await page.request.post(`${BASE}/api/leads`, { headers: { "Content-Type": "application/json" }, data: { name: "Bot", email: "b@b.co", message: "x", botcheck: "true" } });
  check(bot.status() === 204, "bots get a silent 204");
  log("contact form files a prospect");

  await signIn("Rayann");
  check(page.url().endsWith("/admin"), `Rayann lands on /admin (got ${page.url()})`);
  const leadShown = (await page.getByText("Test Formulaire").count()) > 0;
  soft(leadShown, "new prospect visible on the dashboard");
  check(!(await page.getByText("Bot", { exact: true }).count()), "bot lead was not filed");
  await shots("03-admin-dashboard");
  log("admin dashboard shows the new prospect and Camille's feedback waiting");

  // Dashboard tasks: claim, reply in place, mark as seen
  const msgTask = page.locator(".pt-task", { hasText: "Répondre à son message" });
  await msgTask.getByRole("button", { name: "Je m'en occupe" }).click();
  await page.waitForURL(/ok=todo_claim/);
  check(await page.locator(".pt-task", { hasText: "Répondre à son message" }).getByText("vous vous en occupez").isVisible(), "task shows who handles it");
  const msgTask2 = page.locator(".pt-task", { hasText: "Répondre à son message" });
  await msgTask2.getByText("Répondre", { exact: true }).click();
  await msgTask2.locator("textarea[name=body]").fill("Oui, on en parle en décembre. Bonne journée !");
  await msgTask2.getByRole("button", { name: "Envoyer" }).click();
  await page.waitForURL(/ok=message/);
  check(!(await page.locator(".pt-task", { hasText: "Répondre à son message" }).count()), "answering from the dashboard clears the task");
  await page.getByRole("button", { name: "Tout marquer comme vu" }).click();
  await page.waitForURL(/ok=seen/);
  check((await page.locator("#nouveau").innerText()).includes("Rien de nouveau"), "news cleared only when asked");
  log("dashboard: claim a task, reply in place, mark all as seen");

  await page.getByRole("link", { name: "Camille Roy" }).first().click();
  await page.waitForURL(/\/admin\/clients\//);
  check(await page.getByText("Mettre la photo de Camille plus grande").first().isVisible(), "admin sees the client's feedback");
  await shots("04-admin-client");
  await page.locator("input[name=preview_url]").fill("javascript:alert(1)");
  await page.locator("input[name=preview_url]").evaluate((el) => (el.type = "text"));
  await page.getByRole("button", { name: "Partager et prévenir le client" }).click();
  await page.waitForURL(/error=preview_url/);
  log("unsafe preview link refused");
  await page.locator("input[name=preview_url]").fill("https://standoutstudio.ca/work/rayann-sagnon");
  await page.locator("textarea[name=note]").fill("Photo agrandie sur l'accueil.");
  await page.getByRole("button", { name: "Partager et prévenir le client" }).click();
  await page.waitForURL(/ok=version_shared/);
  log("admin shares version 3");

  await page.getByRole("button", { name: "Envoyer au client" }).click();
  await page.waitForURL(/ok=invoice_sent/);
  log("admin sends the balance invoice");

  await page.getByText("Nouvelle facture ou devis").click();
  await page.locator("input[name=label]").fill("Page blogue");
  await page.locator("input[name=amount]").fill("250");
  await page.locator("input[name=tax_rate]").fill("13");
  await page.getByRole("button", { name: "Créer en brouillon" }).click();
  await page.waitForURL(/ok=invoice_created/);
  check(await page.getByText("282,50").first().isVisible(), "draft shows the total with 13 % tax");
  log("admin creates a draft with tax");

  check(await page.getByText("Elle veut un formulaire de réservation relié à Calendly.").isVisible(), "Steven's internal note is visible to Rayann");
  await page.locator("textarea[name=team_body]").fill("Je relance Camille pour le blogue en décembre.");
  await page.getByRole("button", { name: "Envoyer à Steven" }).click();
  await page.waitForURL(/ok=team_note/);
  check((await page.locator("#historique").innerText()).includes("Version 3 partagée, par Rayann"), "history says who shared the version");
  log("Rayann writes to Steven in the internal thread; history shows who did what");

  await page.goto(`${BASE}/admin`);
  if (!leadShown) await page.getByRole("link", { name: "Nadia Haddad" }).first().click();
  else await page.getByRole("link", { name: "Test Formulaire" }).first().click();
  await page.getByRole("button", { name: "Inviter dans l'espace client" }).click();
  await page.waitForURL(/ok=invited/);
  const newProject = page.locator("details", { has: page.locator("summary", { hasText: "Nouveau projet" }) });
  if (!(await newProject.getAttribute("open")) && (await newProject.getAttribute("open")) !== "") await newProject.locator("summary").click();
  await page.getByRole("button", { name: "Créer le projet" }).click();
  await page.waitForURL(/ok=project_created/);
  log("prospect invited and given a project");

  await page.goto(`${BASE}/admin/emails`);
  const subjects = await page.locator(".pt-mail summary b").allInnerTexts();
  check(subjects.some((s) => s.includes("La version 3 de votre site est prête")), "version email in outbox");
  check(subjects.some((s) => s.includes("Facture F-2026-002")), "invoice email in outbox");
  check(subjects.some((s) => s.includes("Votre espace client Standout Studio")), "invite email in outbox");
  check(subjects.some((s) => s.includes("Rayann a écrit sur Camille Roy")), "Steven is told about Rayann's internal note");
  check(subjects.some((s) => s.includes("Rayann a partagé la version 3 avec Camille Roy")), "Steven is told about the shared version");
  soft(subjects.some((s) => s.includes("Nouveau prospect : Test Formulaire")), "admin lead email in outbox");
  await shots("05-admin-emails");
  log("every expected email is in the demo outbox");

  await page.goto(`${BASE}/admin/journal`);
  await page.getByRole("button", { name: "Lancer les relances" }).click();
  await page.waitForURL(/ok=reminders/);
  log(`reminders ran: ${await flash()}`);
  await signOut();

  await signIn("Camille Roy");
  await page.getByRole("button", { name: "J'approuve cette version" }).click();
  await page.waitForURL(/ok=approved/);
  check((await page.locator(".pt-next-text").innerText()).includes("Version 3 approuvée"), "next step updates after approval");
  log("client approves version 3");

  await page.getByRole("button", { name: "Payer par carte" }).click();
  await page.waitForURL(/\/client\/pay\//);
  await shots("06-demo-checkout");
  await page.getByRole("button", { name: "Simuler un paiement réussi" }).click();
  await page.waitForURL(/ok=paid/);
  check(!(await page.getByRole("button", { name: "Payer par carte" }).count()), "no more invoice to pay");
  await shots("07-client-after");
  log("client pays the balance (simulated Stripe)");
  await signOut();

  await signIn("Julien Dubois", "/client/login");
  check(page.url().endsWith("/client") && !page.url().includes("/fr/"), `Julien (English) lands on /client (got ${page.url()})`);
  check(await page.getByText("Hosting and care").isVisible(), "English copy");
  await shots("08-client-english");
  log("English client area");
  await page.getByRole("link", { name: "Français" }).click();
  await page.waitForURL(/\/fr\/client$/);
  log("language switch");
  await signOut();

  // The public site is untouched
  await page.goto(`${BASE}/`);
  await page.waitForLoadState("networkidle");
  check(await page.locator("header.hdr").isVisible(), "public site header renders");
  check(!(await page.locator(".hdr-account").count()), "no client-area link until NEXT_PUBLIC_CLIENT_AREA=1");
  await page.goto(`${BASE}/fr/client/login`);
  check(!(await page.locator("header.hdr").count()), "the public site app does not render on portal pages");
  await page.goto(`${BASE}/admin/clients/does-not-exist`);
  log("public site unchanged, portal pages stand alone");

  const robots = await (await page.request.get(`${BASE}/robots.txt`)).text();
  check(robots.includes("Disallow: /admin") && robots.includes("Disallow: /client"), "robots.txt blocks private paths");
  const cron = await page.request.get(`${BASE}/api/cron/reminders`);
  check(cron.status() === 401, "cron endpoint refuses calls without the secret");
  const hook = await page.request.post(`${BASE}/api/stripe/webhook`, { data: "{}" });
  check(hook.status() === 503 || hook.status() === 400, "webhook refuses unsigned calls");
  log("robots, cron and webhook are locked");

  const real = errors.filter((e) => !/favicon|posthog|ss-ph|Failed to load resource/i.test(e));
  check(real.length === 0, `browser errors:\n${real.join("\n")}`);
  log("no browser errors");
  console.log(`\nAll ${step} checks passed. Screenshots in ${OUT}/`);
} catch (err) {
  console.error(`\n${err.message}\nAt: ${page.url()}`);
  await page.screenshot({ path: `${OUT}/failure.png`, fullPage: true }).catch(() => {});
  process.exitCode = 1;
} finally {
  await browser.close();
}
