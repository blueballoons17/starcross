"use client";

import posthog from "posthog-js";
import { PostHogProvider as PHProvider, usePostHog } from "posthog-js/react";
import { useSession } from "next-auth/react";
import { useEffect } from "react";

// Identify the logged-in user so PostHog ties events to a person
function PostHogIdentify() {
  const { data: session } = useSession();
  const ph = usePostHog();

  useEffect(() => {
    const userId = (session?.user as { id?: string })?.id;
    if (userId) {
      ph.identify(userId, { email: session?.user?.email ?? undefined });
    } else {
      ph.reset(); // clear identity on sign-out
    }
  }, [session, ph]);

  return null;
}

// Initialise once on the client
if (typeof window !== "undefined" && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com",
    person_profiles: "identified_only",
    capture_pageview: true,
    capture_pageleave: true,
    autocapture: false, // we'll fire explicit events instead
  });
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  return (
    <PHProvider client={posthog}>
      <PostHogIdentify />
      {children}
    </PHProvider>
  );
}
