import posthog from "posthog-js";

const token = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;
const host = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com";

if (token) {
  posthog.init(token, {
    api_host: "/ss-ph",
    ui_host: host.includes("eu")
      ? "https://eu.posthog.com"
      : "https://us.posthog.com",
    defaults: "2026-05-30",
    capture_pageview: true,
    capture_pageleave: true,
    person_profiles: "identified_only",
    // Session replay is useful early; turn off later if Vercel bandwidth climbs.
    disable_session_recording: false,
  });
}
