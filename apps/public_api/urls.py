from django.urls import path

from .views import PublicAvailableDatesView, PublicBookAppointmentView, PublicClinicView, PublicSlotsView

urlpatterns = [
    path("clinics/<slug:slug>/", PublicClinicView.as_view(), name="public-clinic-detail"),
    path("clinics/<slug:slug>/slots/", PublicSlotsView.as_view(), name="public-clinic-slots"),
    path("clinics/<slug:slug>/available-dates/", PublicAvailableDatesView.as_view(), name="public-available-dates"),
    path(
        "clinics/<slug:slug>/appointments/",
        PublicBookAppointmentView.as_view(),
        name="public-book-appointment",
    ),
]
