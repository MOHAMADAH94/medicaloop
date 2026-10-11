# Medicaloop

**Medicaloop** is a production-ready, multi-tenant healthcare SaaS platform connecting doctors/clinics with patients.

```
DOCTOR / CLINIC  ↔  MEDICALOOP  ↔  PATIENT
```

## Quick Start

```bash
cp .env.example .env
docker compose up --build
```

| Service  | URL                   |
|----------|-----------------------|
| API      | http://localhost:8000 |
| Frontend | http://localhost:5173 |
| Admin    | http://localhost:8000/admin |

### Local (without Docker)

```bash
python -m venv .venv && .venv\Scripts\activate
pip install -r requirements/development.txt
# Set POSTGRES_HOST=localhost in .env, or use SQLite for tests
python manage.py migrate
python manage.py seed_platform
python manage.py runserver

cd frontend && npm install && npm run dev
```

## API Overview

| Plane   | Prefix              | Description                |
|---------|---------------------|----------------------------|
| Auth    | `/api/v1/auth/`     | Register, login, clinic    |
| Staff   | `/api/v1/staff/`    | Clinic management          |
| Patient | `/api/v1/patient/`  | Patient portal             |
| Public  | `/api/v1/public/`   | Doctor page + booking      |
| Specialty | `/api/v1/specialties/` | OBGYN module          |

## Implementation Status

| Phase | Scope | Status |
|-------|-------|--------|
| 1 | Architecture + scaffold | ✅ |
| 2 | Full database schema | ✅ |
| 3–4 | Auth + multi-tenancy + RBAC | ✅ |
| 5 | Clinic settings, working hours | ✅ |
| 6 | Patient management | ✅ |
| 7 | Public doctor page + booking API | ✅ |
| 8 | Appointments + slot service | ✅ |
| 9 | Patient portal APIs | ✅ |
| 10 | Visits + medical timeline | ✅ |
| 11 | Prescriptions + files | ✅ |
| 12 | Follow-up plans | ✅ |
| 13 | Notifications (in-app) | ✅ |
| 14 | OBGYN module | ✅ |
| 15 | Billing foundation | ✅ |
| 16 | Subscriptions foundation | ✅ |
| 17 | Tests (10 passing) | ✅ |
| 18 | Docker + nginx production config | ✅ |

## Tests

```bash
pytest
python manage.py seed_platform
```

## Production

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up --build
```

See [docs/architecture/](./docs/architecture/) for ADRs and ERD.
