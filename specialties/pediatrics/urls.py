from django.urls import include, path
from rest_framework.routers import DefaultRouter

from specialties.pediatrics.views import GrowthRecordViewSet, ImmunizationViewSet

router = DefaultRouter()
router.register("growth-records", GrowthRecordViewSet, basename="pediatrics-growth")
router.register("immunizations", ImmunizationViewSet, basename="pediatrics-immunization")

urlpatterns = [path("", include(router.urls))]
