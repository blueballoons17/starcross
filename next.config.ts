import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
    ],
  },
  experimental: {},
  async redirects() {
    return [
      // Force HTTPS — redirect http://kindredstars.org → https://www.kindredstars.org
      {
        source: "/:path*",
        has: [{ type: "header", key: "x-forwarded-proto", value: "http" }],
        destination: "https://www.kindredstars.org/:path*",
        permanent: true,
      },
    ];
  },
};

// Only wrap with Sentry when the DSN is actually configured.
// Without a DSN, Sentry.init() throws "TypeError: Invalid URL" at
// module-evaluation time during Next.js static page generation.
const sentryOptions = {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  silent: !process.env.CI,
  widenClientFileUpload: true,
  sourcemaps: { disable: false },
  disableLogger: true,
  automaticVercelMonitors: true,
};

export default process.env.NEXT_PUBLIC_SENTRY_DSN
  ? withSentryConfig(nextConfig, sentryOptions)
  : nextConfig;
