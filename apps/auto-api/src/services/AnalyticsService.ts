type EventProperties = Record<string, string | number | boolean | null | undefined>;

function clean(properties: EventProperties = {}) {
  return Object.fromEntries(Object.entries(properties).filter(([, value]) => value !== undefined));
}

export async function trackEvent(event: string, distinctId: string, properties: EventProperties = {}) {
  const payload = { event, distinct_id: distinctId, properties: clean(properties) };
  const jobs: Promise<unknown>[] = [];

  const posthogKey = process.env.POSTHOG_API_KEY;
  const posthogHost = process.env.POSTHOG_HOST || 'https://us.i.posthog.com';
  if (posthogKey) {
    jobs.push(fetch(`${posthogHost.replace(/\/$/, '')}/capture/`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${posthogKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }));
  }

  const amplitudeKey = process.env.AMPLITUDE_API_KEY;
  if (amplitudeKey) {
    jobs.push(fetch('https://api2.amplitude.com/2/httpapi', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: amplitudeKey,
        events: [{
          user_id: distinctId,
          event_type: event,
          event_properties: clean(properties),
        }],
      }),
    }));
  }

  await Promise.allSettled(jobs);
}
