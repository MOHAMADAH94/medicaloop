from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    CreateClinicView,
    CustomTokenObtainPairView,
    MeView,
    RegisterPatientView,
    RegisterStaffView,
    SwitchClinicView,
)

urlpatterns = [
    path("register/staff/", RegisterStaffView.as_view(), name="auth-register-staff"),
    path("register/patient/", RegisterPatientView.as_view(), name="auth-register-patient"),
    path("login/", CustomTokenObtainPairView.as_view(), name="auth-login"),
    path("refresh/", TokenRefreshView.as_view(), name="auth-refresh"),
    path("me/", MeView.as_view(), name="auth-me"),
    path("clinic/create/", CreateClinicView.as_view(), name="auth-create-clinic"),
    path("switch-clinic/", SwitchClinicView.as_view(), name="auth-switch-clinic"),
]
