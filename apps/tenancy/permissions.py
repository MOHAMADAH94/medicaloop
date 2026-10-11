from rest_framework.permissions import BasePermission


class IsClinicMember(BasePermission):
    """Require authenticated staff user with active clinic membership."""

    message = "You must be an active member of this clinic."

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        clinic = getattr(request, "clinic", None)
        if clinic is None:
            return False

        return request.user.clinic_memberships.filter(
            clinic=clinic,
            is_active=True,
        ).exists()
