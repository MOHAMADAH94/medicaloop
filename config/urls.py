"""
URL configuration for Medicaloop.
"""
from django.conf import settings
from django.contrib import admin
from django.urls import include, path

from apps.core.views import HealthCheckView
from apps.subscriptions.views import SubscriptionPlanListView
from specialties.base.views import SpecialtyCatalogView

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/v1/health/", HealthCheckView.as_view(), name="health-check"),
    path("api/v1/auth/", include("apps.accounts.urls")),
    path("api/v1/staff/", include("config.urls_staff")),
    path("api/v1/patient/", include("config.urls_patient")),
    path("api/v1/public/", include("apps.public_api.urls")),
    path("api/v1/specialties/catalog/", SpecialtyCatalogView.as_view(), name="specialty-catalog"),
    path("api/v1/specialties/", include("specialties.obgyn.urls")),
    path("api/v1/subscriptions/plans/", SubscriptionPlanListView.as_view(), name="subscription-plans"),
]

if settings.DEBUG:
    urlpatterns += [path("__debug__/", include("debug_toolbar.urls"))]
