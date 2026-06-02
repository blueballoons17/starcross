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
};

export default withSentryConfig(nextConfig, {
  // Sentry organisation + project slugs (from sentry.io URL)
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,

  // Suppress the size warning banner in CI
  silent: !process.env.CI,

  // Upload source maps for readable stack traces in Sentry
  widenClientFileUpload: true,

  // Upload source maps but don't expose them in the final bundle
  sourcemaps: { disable: false },

  // Tree-shake Sentry logger statements in production
  disableLogger: true,

  // Automatically instrument Vercel Cron Monitors
  automaticVercelMonitors: true,
});
