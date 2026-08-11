import type { NextConfig } from "next";

const posthogHost =
  process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com";
const isEu = posthogHost.includes("eu");
const posthogApi = isEu ? "https://eu.i.posthog.com" : "https://us.i.posthog.com";
const posthogAssets = isEu
  ? "https://eu-assets.i.posthog.com"
  : "https://us-assets.i.posthog.com";

const nextConfig: NextConfig = {
  // Required so PostHog capture URLs that end with `/` are not redirected.
  skipTrailingSlashRedirect: true,
  images: {
    formats: ["image/avif", "image/webp"],
  },
  async rewrites() {
    return [
      {
        source: "/ss-ph/static/:path*",
        destination: `${posthogAssets}/static/:path*`,
      },
      {
        source: "/ss-ph/array/:path*",
        destination: `${posthogAssets}/array/:path*`,
      },
      {
        source: "/ss-ph/:path*",
        destination: `${posthogApi}/:path*`,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
