# StreamVista Production Blocker Runbook

## Execution law

AUDIT -> REUSE -> BUILD ONLY IF NO COMPATIBLE CAPABILITY EXISTS -> VERIFY -> PROMOTE -> DEPLOY.

Never delete production data. Never rewrite Git history. Never expose secrets. Never bypass release/security gates. Never create duplicate product modules where a verified reusable implementation already exists.

## Current verified blockers

1. Vercel Hobby deployment function-count limit: the canonical `streamvista` project has a deployment failing with `exceeded_serverless_functions_per_deployment` because more than 12 Serverless Functions are being added on the Hobby plan.
2. Canonical project is Vite, and the latest observed deployment is ERROR rather than production-ready.
3. Multiple Vercel projects are linked to the same `abijithasokan1992/streamvista` repository. Only one may be treated as canonical production after verification.
4. The repository emits a mixed package-manager warning because `package-lock.json` exists alongside Yarn signals. Standardize the package manager before final certification.
5. A prior security audit identified a committed `apps/auto-api/.env` credential exposure. Credential rotation/revocation and removal of tracked secret material must be verified before certification.

## Reuse-first inventory

Existing reusable surfaces include the Vite web application, `apps/auto-api`, Creator Studio, Film OS, Crayons LOOP, admin/agent command-center surfaces, existing checkout/payment UI, and existing routing/components.

## Remediation order

1. Reduce/reshape serverless function surface by composing existing API routes into the existing API architecture. Do not remove business functionality merely to satisfy the limit.
2. Keep the Vite build architecture; fix only the actual deployment configuration/runtime blocker.
3. Establish one canonical Vercel production project; retain other projects until domain/usage/dependency verification proves they are safe to retire.
4. Standardize package management using the lockfile and build path that are verified against the canonical repository.
5. Rotate/revoke any credential previously exposed through the repository, remove secret material from tracked source, and provide only `.env.example`/environment contracts.
6. Run production verification: build -> auth -> API -> data -> AI runtime (where applicable) -> payment/webhook persistence -> domain -> analytics/security.
7. Promote/deploy only when the relevant gate is verified green. A successful build alone is not production certification.

## Product design rule

Keep products independently branded and routed. Reuse existing components but prevent mixed navigation and dashboard clutter. Parent brand: STREAMVISTA. Product surfaces should remain distinct for StreamVista Rights, Crayons Bridge, Crayons Creator Cloud, Crayons LOOP, and StreamVista Studio OS.
