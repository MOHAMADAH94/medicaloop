from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView


class HealthCheckView(APIView):
    """Platform health check endpoint."""

    authentication_classes = []
    permission_classes = []

    def get(self, request):
        return Response(
            {
                "status": "ok",
                "service": "medicaloop",
                "version": "0.1.0",
            },
            status=status.HTTP_200_OK,
        )
