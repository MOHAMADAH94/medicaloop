import logging

from django.utils.functional import SimpleLazyObject

logger = logging.getLogger(__name__)


def _resolve_clinic(request):
    """Resolve clinic from JWT claims attached by authentication."""
    clinic_id = getattr(request, "_clinic_id", None)
    if not clinic_id:
        return None

    from apps.tenancy.models import Clinic

    try:
        return Clinic.objects.get(id=clinic_id, is_active=True)
    except Clinic.DoesNotExist:
        logger.warning("Invalid clinic_id in token: %s", clinic_id)
        return None


class TenantMiddleware:
    """
    Attach clinic context to every request from JWT claims.
    Sets request.clinic as a lazy object to avoid unnecessary DB hits.
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        self._extract_clinic_id_from_jwt(request)
        request.clinic = SimpleLazyObject(lambda: _resolve_clinic(request))
        response = self.get_response(request)
        return response

    def _extract_clinic_id_from_jwt(self, request):
        """Extract active_clinic_id from JWT if present."""
        auth_header = request.META.get("HTTP_AUTHORIZATION", "")
        if not auth_header.startswith("Bearer "):
            return

        try:
            from rest_framework_simplejwt.authentication import JWTAuthentication

            auth = JWTAuthentication()
            validated = auth.authenticate(request)
            if validated is None:
                return

            user, token = validated
            request.user = user
            clinic_id = token.get("active_clinic_id")
            if clinic_id:
                request._clinic_id = clinic_id
        except Exception:
            logger.debug("Could not extract clinic from JWT", exc_info=True)
