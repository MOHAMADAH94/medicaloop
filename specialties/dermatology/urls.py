from django.urls import include, path
from rest_framework.routers import DefaultRouter

from specialties.dermatology.views import SkinCaseViewSet

router = DefaultRouter()
router.register("cases", SkinCaseViewSet, basename="dermatology-case")

urlpatterns = [path("", include(router.urls))]
