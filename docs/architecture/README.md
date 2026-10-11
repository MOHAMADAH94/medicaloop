# Medicaloop Architecture Documentation

This directory contains the architectural decisions and diagrams for the Medicaloop healthcare SaaS platform.

## Contents

| Document | Description |
|----------|-------------|
| [ADR-001-multi-tenancy.md](./ADR-001-multi-tenancy.md) | Shared DB row-level tenancy |
| [ADR-002-api-planes.md](./ADR-002-api-planes.md) | Staff / Patient / Public API separation |
| [ADR-003-specialty-modules.md](./ADR-003-specialty-modules.md) | Pluggable specialty module registry |
| [ADR-004-visibility-model.md](./ADR-004-visibility-model.md) | Private vs patient-visible clinical data |
| [ERD.md](./ERD.md) | Logical entity-relationship diagram |

## Platform Overview

Medicaloop is a two-sided healthcare SaaS platform:

```
DOCTOR / CLINIC  ↔  MEDICALOOP PLATFORM  ↔  PATIENT
```

- **Core platform**: Specialty-independent (auth, clinics, patients, appointments, visits, records, billing, subscriptions)
- **Specialty modules**: Pluggable extensions (OBGYN first, then Pediatrics, Dental, etc.)
- **Three experiences**: Doctor dashboard, Patient portal, Public doctor page

## Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | Python, Django, DRF, PostgreSQL |
| Frontend | React, TypeScript, Vite, Material UI |
| Auth | JWT (SimpleJWT) |
| Storage | S3-compatible (MinIO dev / S3 prod) |
| Queue | Celery + Redis |
| Deployment | Docker, Docker Compose |

## Implementation Phases

See the main project README for the full phased delivery plan (Phases 1–18).
