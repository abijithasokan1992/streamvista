# StreamVista Release Rules

Production promotion is evidence-gated.

- Audit existing implementation before building.
- Reuse compatible code/components/routes before creating anything new.
- Build only when a required capability has no compatible existing implementation.
- Verify the change on the canonical path before promotion.
- Never bypass Vercel, GitHub, authentication, database, security, or payment gates.
- Never expose, copy, or hardcode secrets.
- Never rewrite history or delete production records as a blocker workaround.
- Do not treat a preview, alias, or successful compile as production certification.
- Keep products independently branded and avoid duplicate/conflicting navigation.
