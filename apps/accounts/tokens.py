"""Custom JWT token with clinic/patient context."""

from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.tokens import RefreshToken

from apps.core.constants import UserType
from apps.rbac.services import get_user_permissions


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token["user_type"] = user.user_type

        if user.user_type == UserType.STAFF:
            membership = user.clinic_memberships.filter(is_active=True).select_related("clinic").first()
            if membership:
                token["active_clinic_id"] = str(membership.clinic_id)
        elif user.user_type == UserType.PATIENT:
            patient = getattr(user, "patient_profile", None)
            if patient:
                token["patient_id"] = str(patient.id)

        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        user = self.user
        data["user"] = {
            "id": str(user.id),
            "username": user.username,
            "full_name": user.full_name,
            "user_type": user.user_type,
        }

        if user.user_type == UserType.STAFF:
            membership = user.clinic_memberships.filter(is_active=True).select_related("clinic").first()
            if membership:
                data["active_clinic"] = {
                    "id": str(membership.clinic_id),
                    "name": membership.clinic.name,
                    "slug": membership.clinic.slug,
                }
                data["permissions"] = list(get_user_permissions(user, membership.clinic))
        elif user.user_type == UserType.PATIENT:
            patient = getattr(user, "patient_profile", None)
            if patient:
                data["patient"] = {"id": str(patient.id), "full_name": patient.full_name}

        return data


def get_tokens_for_user(user, clinic_id=None):
    refresh = RefreshToken.for_user(user)
    refresh["user_type"] = user.user_type

    if user.user_type == UserType.STAFF and clinic_id:
        refresh["active_clinic_id"] = str(clinic_id)
    elif user.user_type == UserType.PATIENT:
        patient = getattr(user, "patient_profile", None)
        if patient:
            refresh["patient_id"] = str(patient.id)

    return {"refresh": str(refresh), "access": str(refresh.access_token)}
