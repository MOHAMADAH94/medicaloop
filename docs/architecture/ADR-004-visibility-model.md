# ADR-004: Private vs Patient-Visible Clinical Data

## Status

Accepted

## Context

Not all clinical documentation should be visible to patients. Doctors need private internal notes alongside patient-facing instructions. Relying on frontend hiding is not acceptable for healthcare data.

## Decision

All clinical content entities carry an explicit **visibility** attribute:

```python
class Visibility(models.TextChoices):
    PRIVATE = "private", "Private"
    PATIENT_VISIBLE = "patient_visible", "Patient Visible"
```

Patient API plane uses dedicated serializers and querysets that **exclude** all `PRIVATE` records at the database query level.

## Entity Defaults

| Entity | Default Visibility |
|--------|-------------------|
| ClinicalNote (internal) | PRIVATE |
| ClinicalNote (instructions) | PATIENT_VISIBLE |
| Prescription | PATIENT_VISIBLE |
| LabRequest | PRIVATE until explicitly published |
| FileAsset | Configurable per upload |
| Diagnosis | PRIVATE (patient summary optional) |

## Rationale

- Intentional disclosure model — doctors choose what patients see
- Backend enforcement prevents API bypass
- Audit log can track when visibility changes (publish lab result)

## Consequences

- Two note types or explicit visibility on create (UX consideration for Phase 10)
- Automated tests must assert patient API responses never contain private fields
