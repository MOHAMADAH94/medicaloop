"""RBAC permission resolution."""

from apps.rbac.models import Permission


def get_user_permissions(user, clinic) -> set[str]:
    """Return permission codenames for user at clinic."""
    if user.is_superuser:
        return set(Permission.objects.values_list("codename", flat=True))

    membership = user.clinic_memberships.filter(clinic=clinic, is_active=True).first()
    if not membership:
        return set()

    if membership.is_owner:
        return set(Permission.objects.values_list("codename", flat=True))

    codenames = Permission.objects.filter(
        roles__memberships=membership,
    ).values_list("codename", flat=True)

    return set(codenames.distinct())


def user_has_permission(user, clinic, codename: str) -> bool:
    return codename in get_user_permissions(user, clinic)
