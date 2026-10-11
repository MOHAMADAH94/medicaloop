# Medicaloop Logical ERD

## Core Identity & Tenancy

```mermaid
erDiagram
    User ||--o{ ClinicMembership : has
    Clinic ||--o{ ClinicMembership : has
    ClinicMembership }o--o{ Role : assigned
    Role }o--o{ Permission : grants
    Clinic ||--|| ClinicSettings : has
    Clinic ||--o{ WorkingHours : defines
    User ||--o| DoctorProfile : has
    DoctorProfile }o--|| Clinic : belongs_to
```

## Clinical Core

```mermaid
erDiagram
    Clinic ||--o{ PatientClinicLink : links
    Patient ||--o{ PatientClinicLink : linked
    PatientClinicLink }o--|| Clinic : at
    Clinic ||--o{ Appointment : schedules
    Patient ||--o{ Appointment : books
    Appointment ||--o| Visit : becomes
    Visit ||--o{ ClinicalNote : contains
    Visit ||--o{ Diagnosis : contains
    Visit ||--o{ Prescription : contains
    Visit ||--o{ LabRequest : contains
    Visit ||--o{ VitalSign : records
    Prescription ||--o{ PrescriptionItem : has
    Patient ||--o{ FileAsset : owns
    Patient ||--o{ FollowUpPlan : has
    FollowUpPlan ||--o{ FollowUpItem : contains
```

## OBGYN Extension

```mermaid
erDiagram
    Patient ||--o{ Pregnancy : has
    Clinic ||--o{ Pregnancy : scopes
    Pregnancy ||--o{ PregnancyVisit : tracks
    Pregnancy ||--o{ UltrasoundRecord : has
    Pregnancy ||--o{ ObgynLabPanel : has
    Pregnancy ||--o{ RiskFactor : has
    Pregnancy ||--o| DeliveryRecord : ends_with
    DeliveryRecord ||--o| NewbornRecord : produces
```

## Platform Services

```mermaid
erDiagram
    Clinic ||--o{ Notification : receives
    User ||--o{ Notification : receives
    Clinic ||--o{ AuditLog : generates
    Clinic ||--o{ Invoice : bills
    Invoice ||--o{ InvoiceLine : contains
    Invoice ||--o{ Payment : paid_by
    Clinic ||--o| ClinicSubscription : subscribes
    ClinicSubscription }o--|| SubscriptionPlan : on
    SubscriptionPlan ||--o{ PlanFeature : includes
```

## Key Indexes (Planned)

| Table | Index | Purpose |
|-------|-------|---------|
| Appointment | `(clinic_id, scheduled_start)` | Calendar queries |
| Appointment | `(clinic_id, doctor_id, scheduled_start)` UNIQUE partial | Double-book prevention |
| PatientClinicLink | `(clinic_id, patient_id)` UNIQUE | Patient lookup |
| Clinic | `(slug)` UNIQUE | Public page routing |
| AuditLog | `(clinic_id, created_at)` | Audit queries |
| Notification | `(user_id, read_at, created_at)` | Unread notifications |

## Tenant Isolation Rule

Every table in the Clinical Core and OBGYN Extension groups includes `clinic_id` as a NOT NULL foreign key with an index.
