# Supabase Project Separation Policy

Status: active operating rule.

## Purpose

StreamVista and Union Auto Spares must not share the same Supabase database. They are different businesses with different data, users, permissions, payment flows, and audit requirements.

## Canonical mapping

| Business/Product | Supabase role | Project ref | Rule |
|---|---|---:|---|
| StreamVista, Crayons Bridge, Crayons Pictures, Crayons Loop | Media production platform data plane | `uakpqqardziifcwzvgfx` | Use for platform identity, media workflows, rights, payments, entitlements, analytics, and audit. |
| Union Auto Spares | Automobile inventory/order data plane | `jpfyhahrdxbtwximsglj` | Use only for automobile inventory, parts, orders, staff, suppliers, and store operations. |

## Hard rules

- Do not point StreamVista, Crayons Bridge, Crayons Pictures, or Crayons Loop at the Union Auto Spares database.
- Do not point Union Auto Spares at the StreamVista media-production database.
- Do not create a new Supabase project unless the existing canonical project is inaccessible or intentionally replaced after approval.
- Do not delete any Supabase project until its owner, linked Vercel project, domains, migrations, auth users, storage buckets, webhooks, and backups are verified.
- Before deleting or archiving anything, produce a candidate list with evidence and obtain explicit Founder approval.

## Required env lock

StreamVista production must use:

```text
SUPABASE_URL=https://uakpqqardziifcwzvgfx.supabase.co
STREAMVISTA_SUPABASE_PROJECT_REFS=uakpqqardziifcwzvgfx
```

Union Auto Spares production must use:

```text
SUPABASE_URL=https://jpfyhahrdxbtwximsglj.supabase.co
```

Secrets must stay server-side. Browser-visible variables may only contain publishable keys and public URLs intended for frontend use.
