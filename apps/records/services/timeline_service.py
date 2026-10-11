"""Patient medical timeline aggregation."""

from apps.core.constants import Visibility


class TimelineService:
    def __init__(self, patient, clinic, patient_visible_only=False):
        self.patient = patient
        self.clinic = clinic
        self.patient_visible_only = patient_visible_only

    def get_timeline(self) -> list[dict]:
        events = []

        from apps.visits.models import Visit

        for visit in Visit.objects.filter(patient=self.patient, clinic=self.clinic).order_by("-visit_date"):
            events.append({
                "type": "visit",
                "id": str(visit.id),
                "date": visit.visit_date.isoformat(),
                "title": visit.chief_complaint or "زيارة",
                "status": visit.status,
            })

        from apps.prescriptions.models import Prescription

        rx_qs = Prescription.objects.filter(patient=self.patient, clinic=self.clinic)
        if self.patient_visible_only:
            rx_qs = rx_qs.filter(visibility=Visibility.PATIENT_VISIBLE)

        for rx in rx_qs.order_by("-created_at"):
            events.append({
                "type": "prescription",
                "id": str(rx.id),
                "date": rx.created_at.isoformat(),
                "title": "وصفة طبية",
            })

        from apps.records.models import ClinicalNote, LabRequest

        notes_qs = ClinicalNote.objects.filter(patient=self.patient, clinic=self.clinic)
        if self.patient_visible_only:
            notes_qs = notes_qs.filter(visibility=Visibility.PATIENT_VISIBLE)

        for note in notes_qs.order_by("-created_at"):
            events.append({
                "type": "note",
                "id": str(note.id),
                "date": note.created_at.isoformat(),
                "title": note.content[:80],
            })

        labs_qs = LabRequest.objects.filter(patient=self.patient, clinic=self.clinic)
        if self.patient_visible_only:
            labs_qs = labs_qs.filter(is_published=True, visibility=Visibility.PATIENT_VISIBLE)

        for lab in labs_qs.order_by("-created_at"):
            events.append({
                "type": "lab",
                "id": str(lab.id),
                "date": lab.created_at.isoformat(),
                "title": lab.test_name,
            })

        events.sort(key=lambda e: e["date"], reverse=True)
        return events
