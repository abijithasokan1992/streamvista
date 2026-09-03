# StreamVista — Verification Gate Policy

## Purpose

Keep provider availability limitations separate from application correctness. A provider-side rate limit or missing external CI execution is not, by itself, evidence of a code or production-runtime failure.

## Gate semantics

- `PASS`: direct evidence proves the check succeeded for the exact release SHA/environment.
- `BLOCKED`: direct evidence proves a required dependency, runtime, credential, schema, policy, or deployment is unavailable or failing.
- `NON_BLOCKING_PROVIDER_LIMIT`: an external provider limitation prevents a secondary verification signal (for example, a Vercel build-rate-limit status), while an independent production deployment for the exact SHA is `READY` and runtime verification is available.
- `UNKNOWN`: evidence is insufficient; never convert `UNKNOWN` into `PASS`.

## Vercel build-rate-limit exception

A GitHub status check reporting a Vercel build-rate-limit must not be classified as a P0/P1 application failure when all of the following are true:

1. The exact release SHA has an independently observed Vercel Production deployment in `READY` state.
2. The deployment is the intended canonical Vercel project/environment.
3. The production domain is mapped to that deployment/project.
4. No independent production runtime evidence shows an application failure attributable to the release.

In that situation, classify the Vercel rate-limit check as `NON_BLOCKING_PROVIDER_LIMIT` for release-gate purposes. Do not fabricate a passing GitHub status or alter provider-reported check results.

If any of the four conditions above is not proven, the gate remains `UNKNOWN` or `BLOCKED` as appropriate.

## Permanent operating rule

Prefer direct production evidence over a secondary provider status signal. Provider rate limits, unavailable CI runners, or missing external check execution must not repeatedly stop a release when the canonical production deployment is independently proven healthy.

This policy does not waive security, authentication, authorization, RLS, payment, email, database, or production-runtime certification requirements.
