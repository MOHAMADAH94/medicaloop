# ADR-002: Three API Planes (Staff / Patient / Public)

## Status

Accepted

## Context

Medicaloop serves three distinct audiences with different security boundaries and data exposure requirements. A single API namespace with conditional logic risks leaking private clinical data to patients.

## Decision

Separate REST APIs into three logical planes:

| Plane | Prefix | Auth | Purpose |
|-------|--------|------|---------|
| Staff | `/api/v1/staff/` | Staff JWT + clinic context | Clinic management |
| Patient | `/api/v1/patient/` | Patient JWT | Patient portal |
| Public | `/api/v1/public/` | None (reads) / Patient JWT (writes) | Doctor page + booking |

## Rationale

- **Security by structure**: Patient serializers cannot accidentally include private fields
- **Clear ownership**: Each plane has dedicated ViewSets and serializers
- **Independent evolution**: Patient API can be simplified without affecting staff API
- **Rate limiting**: Different limits per plane (public booking vs staff operations)

## Consequences

- Some code duplication between staff and patient serializers (acceptable; DTOs differ intentionally)
- Frontend must use correct API client per experience (staff dashboard vs portal vs public)

## Implementation

```
/api/v1/auth/          → Shared authentication
/api/v1/staff/         → TenantViewSetMixin + RBAC permissions
/api/v1/patient/       → PatientVisibleQuerySet filter
/api/v1/public/        → Slug-based clinic lookup, no tenant JWT
/api/v1/specialties/   → Specialty module endpoints
```
