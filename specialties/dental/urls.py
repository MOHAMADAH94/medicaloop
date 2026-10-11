from django.urls import include, path
from rest_framework.routers import DefaultRouter

from specialties.dental.views import DentalTreatmentViewSet

router = DefaultRouter()
router.register("treatments", DentalTreatmentViewSet, basename="dental-treatment")

urlpatterns = [path("", include(router.urls))]
