from django.urls import include, path
from rest_framework.routers import DefaultRouter

from specialties.obgyn.views import PregnancyViewSet

router = DefaultRouter()
router.register("obgyn/pregnancies", PregnancyViewSet, basename="specialty-pregnancies")

urlpatterns = [
    path("", include(router.urls)),
]
