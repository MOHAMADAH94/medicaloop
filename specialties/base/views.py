from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from specialties.base.services import list_modules, module_to_dict


class SpecialtyCatalogView(APIView):
    """List available specialty modules for clinic onboarding."""

    authentication_classes = []
    permission_classes = [AllowAny]

    def get(self, request):
        assignable = request.query_params.get("assignable", "true").lower() != "false"
        modules = list_modules(assignable_only=assignable)
        return Response({
            "specialties": [module_to_dict(m) for m in modules],
        })
