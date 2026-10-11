from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.subscriptions.models import ClinicSubscription, SubscriptionPlan
from apps.subscriptions.serializers import ClinicSubscriptionSerializer, SubscriptionPlanSerializer
from apps.tenancy.permissions import IsClinicMember


class SubscriptionPlanListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        plans = SubscriptionPlan.objects.filter(is_active=True)
        return Response(SubscriptionPlanSerializer(plans, many=True).data)


class ClinicSubscriptionView(APIView):
    permission_classes = [IsAuthenticated, IsClinicMember]

    def get(self, request):
        clinic = request.clinic
        sub = ClinicSubscription.objects.filter(clinic=clinic).select_related("plan").first()
        if not sub:
            return Response({"detail": "No subscription."}, status=404)
        return Response(ClinicSubscriptionSerializer(sub).data)
