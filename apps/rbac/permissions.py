from rest_framework.permissions import BasePermission

from apps.rbac.services import user_has_permission


class HasClinicPermission(BasePermission):
    """Require specific permission codename on active clinic."""

    permission_codename = ""

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        clinic = getattr(request, "clinic", None)
        if clinic is None:
            return False

        codename = getattr(view, "permission_codename", None) or self.permission_codename
        if not codename:
            return True

        return user_has_permission(request.user, clinic, codename)


def make_permission_class(codename: str):
    """Factory for permission classes."""

    class _Permission(HasClinicPermission):
        permission_codename = codename

    return _Permission
