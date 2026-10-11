from django.urls import include, path
from rest_framework.routers import DefaultRouter

from specialties.general.views import CarePlanViewSet

router = DefaultRouter()
router.register("care-plans", CarePlanViewSet, basename="general-care-plan")

urlpatterns = [path("", include(router.urls))]
