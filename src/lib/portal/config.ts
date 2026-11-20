// Which backend runs. Supabase when its keys are set; otherwise the demo store,
// which is refused in production unless PORTAL_DEMO=1 is set on purpose.

export type PortalMode = "supabase" | "demo" | "off";

const env = (k: string) => (process.env[k] || "").trim();

export const supabaseEnv = () => ({
  url: env("NEXT_PUBLIC_SUPABASE_URL"),
  anonKey: env("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
  serviceKey: env("SUPABASE_SERVICE_ROLE_KEY"),
});

export function portalMode(): PortalMode {
  const s = supabaseEnv();
  if (s.url && s.anonKey && s.serviceKey) return "supabase";
  if (env("VERCEL_ENV") === "production" && env("PORTAL_DEMO") !== "1") return "off";
  return "demo";
}

export const adminEmails = () =>
  env("ADMIN_EMAILS")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

export const resendEnv = () => ({ key: env("RESEND_API_KEY"), from: env("EMAIL_FROM") || "Standout Studio <bonjour@standoutstudio.ca>" });
export const stripeEnv = () => ({ secret: env("STRIPE_SECRET_KEY"), webhookSecret: env("STRIPE_WEBHOOK_SECRET") });
export const cronSecret = () => env("CRON_SECRET");

/** Signs demo session cookies. Only the demo uses it; Supabase signs its own sessions. */
export const demoSecret = () => env("PORTAL_SECRET") || "standout-demo-only-secret";
