# ADR-003: Pluggable Specialty Module Registry

## Status

Accepted

## Context

Medicaloop must support multiple medical specialties without rebuilding the core platform. The first implementation is Obstetrics & Gynecology, but Pediatrics, Dental, Dermatology, and others will follow.

## Decision

Implement specialty features as **isolated Django sub-apps** under `specialties/` with a **registry pattern** for discovery by core platform and frontend.

## Rationale

- Core `Patient` model stays generic — no OBGYN fields in core tables
- New specialty = new app + registry entry, not core modification
- Permissions, API routes, and UI tabs registered dynamically
- Proves architecture with real OBGYN module, not theoretical abstraction

## Module Contract

Each specialty module provides:

- `code` — unique identifier (e.g. `obgyn`)
- `models` — extension tables FK'd to Patient + Clinic
- `permissions` — registered on app ready
- `api_urls` — namespaced under `/api/v1/specialties/{code}/`
- `frontend_tabs` — registry for patient detail UI (future)

## Rules

1. Specialty models MUST NOT be imported by core apps (dependency direction: specialty → core)
2. All specialty models carry `clinic_id` for tenant isolation
3. Patient portal specialty views respect per-field visibility flags

## Consequences

- Slight overhead for registry infrastructure (minimal for MVP)
- Frontend specialty tabs require a matching registry (Phase 14)
