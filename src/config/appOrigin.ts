export const APP_ORIGIN = "https://chat.streamvista.in";

export function getAppOrigin(): string {
  if (typeof window !== "undefined" && window.location.origin === APP_ORIGIN) {
    return APP_ORIGIN;
  }

  return APP_ORIGIN;
}

export function getAuthRedirect(path = "/login?magic=1"): string {
  return new URL(path, APP_ORIGIN).toString();
}
