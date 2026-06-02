import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || undefined,
  environment: process.env.NODE_ENV,

  // Capture 10 % of sessions for performance in prod; 100 % in dev
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

  // Session replay: 2 % of sessions, 100 % of sessions with errors
  replaysSessionSampleRate: 0.02,
  replaysOnErrorSampleRate: 1.0,

  integrations: [
    Sentry.replayIntegration({
      maskAllText: true,   // don't capture message content
      blockAllMedia: true,
    }),
  ],

  // Don't flood logs with noise in development
  debug: false,
});
