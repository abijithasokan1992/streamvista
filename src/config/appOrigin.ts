const CANONICAL_APP_ORIGIN = "https://streamvista.in";
const ALLOWED_APP_HOSTS = new Set([
  "streamvista.in",
  "www.streamvista.in",
  "chat.streamvista.in",
]);

export function getAppOrigin(): string {
  if (typeof window !== "undefined" && ALLOWED_APP_HOSTS.has(window.location.hostname)) {
    return window.location.origin;
  }

  return CANONICAL_APP_ORIGIN;
}

export function getAuthRedirect(path = "/login?magic=1"): string {
  return new URL(path, getAppOrigin()).toString();
}

export const APP_ORIGIN = CANONICAL_APP_ORIGIN;
