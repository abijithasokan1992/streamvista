export const ANALYTICS_EVENTS = {
  USER_SIGNED_IN: "user_signed_in",
  CONTENT_VIEWED: "content_viewed",
  UPLOAD_STARTED: "upload_started",
  UPLOAD_COMPLETED: "upload_completed",
  RIGHTS_SUBMITTED: "rights_submitted",
  BUYER_INTEREST: "buyer_interest",
  LEAD_CREATED: "lead_created",
  PAYMENT_COMPLETED: "payment_completed",
} as const;

export type AnalyticsEvent =
  (typeof ANALYTICS_EVENTS)[keyof typeof ANALYTICS_EVENTS];

type SafePrimitive = string | number | boolean | null | undefined;

export type AnalyticsProperties = Record<string, SafePrimitive> & {
  event_version?: 1;
  app?: "streamvista-web";
  environment?: string;
  actor_role?: string;
  source_record_id?: string;
  content_id?: string;
  lead_id?: string;
  payment_id?: string;
  correlation_id?: string;
  value_inr?: number;
};

type PostHogBrowserClient = {
  capture: (event: string, properties?: AnalyticsProperties) => void;
  identify: (distinctId: string, properties?: Record<string, SafePrimitive>) => void;
  reset: () => void;
};

declare global {
  interface Window {
    posthog?: PostHogBrowserClient;
  }
}

const runtimeContext = (): AnalyticsProperties => ({
  event_version: 1,
  app: "streamvista-web",
  environment: import.meta.env.MODE,
});

/**
 * Captures an allow-listed StreamVista event only when PostHog is configured.
 * Never pass email, phone, bank data, contract text, credentials, tokens,
 * private rights documents, or other sensitive business data here.
 */
export function trackAnalyticsEvent(
  event: AnalyticsEvent,
  properties: AnalyticsProperties = {},
): void {
  if (typeof window === "undefined" || !window.posthog?.capture) return;

  window.posthog.capture(event, {
    ...runtimeContext(),
    ...properties,
  });
}

/**
 * Identify only with a stable application UID/pseudonymous ID.
 * Do not identify mock users and do not send raw email/phone as properties.
 */
export function identifyAnalyticsUser(
  stableUserId: string,
  properties: Record<string, SafePrimitive> = {},
): void {
  if (!stableUserId || typeof window === "undefined" || !window.posthog?.identify) return;
  window.posthog.identify(stableUserId, properties);
}

export function resetAnalyticsIdentity(): void {
  if (typeof window === "undefined" || !window.posthog?.reset) return;
  window.posthog.reset();
}
