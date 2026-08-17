const FOUNDER_ROLE = "founder";

/**
 * Authorization policy for the Founder certification endpoint.
 * The only authoritative input is the server-derived profile role.
 * Client-provided role claims are intentionally absent from this function.
 */
export function evaluateFounderAuthorization(serverDerivedRole) {
  return {
    allowed: serverDerivedRole === FOUNDER_ROLE,
    requiredRole: FOUNDER_ROLE,
    resolvedRole: serverDerivedRole ?? null,
  };
}
