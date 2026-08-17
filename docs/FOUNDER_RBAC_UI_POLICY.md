# Founder RBAC UI Policy

## Production rule

The production UI must never expose a role selector, mock role switcher, impersonation control, or client-side role override.

The authenticated identity displayed by the workspace is read-only presentation of the session profile. Authorization is enforced independently by the server and database.

## Required UI behavior

- Display the authenticated user's display name.
- Display the server/profile-derived role as read-only text.
- Never provide a control that changes `user.role`.
- Never use URL query parameters, request headers, request bodies, local storage, or client state to elevate a user's role.
- Protected navigation may improve UX, but protected resources must remain server-authorized.

## Certification blocker

If a deployed preview contains `Mock Role Switcher` or a role dropdown, that deployment is not production-certified even if the source branch no longer contains the control. The deployment must be rebuilt from the certified source commit and re-verified.
