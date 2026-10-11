# ADR-001: Shared Database Row-Level Multi-Tenancy

## Status

Accepted

## Context

Medicaloop is a multi-tenant SaaS where each clinic's data must be fully isolated. We need a tenancy strategy that supports rapid MVP delivery while scaling to thousands of clinics.

## Decision

Use a **shared PostgreSQL database** with **row-level tenant isolation** via a mandatory `clinic_id` foreign key on all tenant-scoped models.

## Rationale

- Lower operational complexity than database-per-tenant for early-stage SaaS
- Standard Django ORM patterns; faster team velocity
- PostgreSQL handles thousands of small/medium clinics with proper indexing
- Enables platform-wide analytics (anonymized) when needed
- Hybrid upgrade path: enterprise tenants can later get dedicated schema/DB via a `tenant_tier` flag

## Consequences

### Positive

- Single migration pipeline
- Simpler backup/restore for MVP
- Lower infrastructure cost

### Negative

- Requires rigorous tenant isolation testing (mandatory CI suite)
- Noisy-neighbor risk at extreme scale (mitigated by connection pooling, read replicas)
- Compliance audits may eventually require dedicated DB for enterprise tier

## Implementation

1. `TenantModel` abstract base with `clinic` FK
2. `TenantMiddleware` attaches `request.clinic` from JWT
3. `TenantQuerySet` / `TenantManager` auto-filter by clinic
4. Composite unique constraints include `clinic_id`
5. Cross-tenant access returns 404 (not 403) to prevent ID oracle leaks
