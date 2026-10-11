from datetime import time

from django.contrib.auth import get_user_model
from django.db import transaction
from django.utils.text import slugify
from rest_framework import serializers, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView

from apps.accounts.tokens import CustomTokenObtainPairSerializer, get_tokens_for_user
from apps.audit.services import log_action
from apps.core.constants import UserType
from apps.rbac.models import Role
from apps.subscriptions.models import ClinicSubscription, SubscriptionPlan
from apps.tenancy.models import Clinic, ClinicMembership, ClinicSettings, DoctorProfile, WorkingHours
from specialties.base.services import get_display_name, get_module, resolve_code

User = get_user_model()


class RegisterStaffSerializer(serializers.Serializer):
    username = serializers.RegexField(
        r"^[a-zA-Z0-9_\u0600-\u06FF]+$", min_length=3, max_length=150
    )
    password = serializers.CharField(min_length=8, write_only=True)
    first_name = serializers.CharField(max_length=150)
    last_name = serializers.CharField(max_length=150)
    phone = serializers.CharField(max_length=20, required=False, allow_blank=True)
    email = serializers.EmailField(required=False, allow_blank=True)


class CreateClinicSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=255)
    slug = serializers.SlugField(max_length=100, required=False)
    specialty_code = serializers.CharField(max_length=50, required=False)
    specialty = serializers.CharField(max_length=100, required=False, allow_blank=True)
    description = serializers.CharField(required=False, allow_blank=True)
    phone = serializers.CharField(max_length=20, required=False, allow_blank=True)
    address = serializers.CharField(required=False, allow_blank=True)
    city = serializers.CharField(max_length=100, required=False, allow_blank=True)

    def validate(self, attrs):
        raw_code = attrs.get("specialty_code")
        raw_specialty = attrs.get("specialty")

        if raw_code:
            resolved = raw_code.strip().lower().replace(" ", "_").replace("&", "")
            module = get_module(resolved)
        elif raw_specialty:
            resolved = resolve_code(raw_specialty)
            module = get_module(resolved)
        else:
            resolved = "general"
            module = get_module(resolved)

        if not module:
            raise serializers.ValidationError({"specialty_code": "Unknown specialty."})
        if not module.enabled:
            raise serializers.ValidationError({"specialty_code": "This specialty is not available yet."})
        attrs["specialty_code"] = module.code
        return attrs


class RegisterPatientSerializer(serializers.Serializer):
    username = serializers.RegexField(
        r"^[a-zA-Z0-9_\u0600-\u06FF]+$", min_length=3, max_length=150
    )
    password = serializers.CharField(min_length=8, write_only=True)
    first_name = serializers.CharField(max_length=150)
    last_name = serializers.CharField(max_length=150)
    phone = serializers.CharField(max_length=20, required=False, allow_blank=True)
    email = serializers.EmailField(required=False, allow_blank=True)
    date_of_birth = serializers.DateField(required=False)
    gender = serializers.CharField(max_length=20, required=False, allow_blank=True)


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


class RegisterStaffView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterStaffSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        if User.objects.filter(username=data["username"]).exists():
            return Response({"detail": "Username already taken."}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.create_user(
            username=data["username"],
            password=data["password"],
            email=data.get("email", ""),
            first_name=data["first_name"],
            last_name=data["last_name"],
            phone=data.get("phone", ""),
            user_type=UserType.STAFF,
        )
        tokens = get_tokens_for_user(user)
        return Response(
            {"user": {"id": str(user.id), "username": user.username}, "tokens": tokens},
            status=status.HTTP_201_CREATED,
        )


def _default_working_hours(clinic):
    for day in range(0, 5):
        WorkingHours.objects.get_or_create(
            clinic=clinic,
            day_of_week=day,
            doctor=None,
            defaults={
                "start_time": time(9, 0),
                "end_time": time(17, 0),
                "is_active": True,
            },
        )


class CreateClinicView(APIView):
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request):
        if request.user.user_type != UserType.STAFF:
            return Response({"detail": "Staff only."}, status=status.HTTP_403_FORBIDDEN)

        serializer = CreateClinicSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        specialty_code = data["specialty_code"]
        specialty_label = get_display_name(specialty_code, lang="ar")

        slug = data.get("slug") or slugify(data["name"])
        base_slug = slug
        counter = 1
        while Clinic.objects.filter(slug=slug).exists():
            slug = f"{base_slug}-{counter}"
            counter += 1

        clinic = Clinic.objects.create(
            name=data["name"],
            slug=slug,
            specialty_code=specialty_code,
            description=data.get("description", ""),
            phone=data.get("phone", ""),
            address=data.get("address", ""),
            city=data.get("city", ""),
        )
        ClinicSettings.objects.create(clinic=clinic, onboarding_completed=True)
        _default_working_hours(clinic)
        from specialties.base.pack import seed_clinic_services

        seed_clinic_services(clinic)
        membership = ClinicMembership.objects.create(
            clinic=clinic,
            user=request.user,
            is_owner=True,
            is_active=True,
        )

        owner_role = Role.objects.filter(slug="owner", is_system=True, clinic__isnull=True).first()
        if owner_role:
            membership.roles.add(owner_role)

        DoctorProfile.objects.create(
            clinic=clinic,
            user=request.user,
            specialty=specialty_label,
            bio=data.get("description", ""),
        )

        plan = SubscriptionPlan.objects.filter(slug="starter").first()
        if plan:
            ClinicSubscription.objects.create(clinic=clinic, plan=plan, status="trial")

        tokens = get_tokens_for_user(request.user, clinic_id=clinic.id)
        log_action(
            clinic=clinic,
            actor=request.user,
            action="clinic.created",
            resource_type="Clinic",
            resource_id=clinic.id,
        )

        return Response(
            {
                "clinic": {
                    "id": str(clinic.id),
                    "name": clinic.name,
                    "slug": clinic.slug,
                    "specialty_code": clinic.specialty_code,
                    "specialty_name": specialty_label,
                },
                "tokens": tokens,
            },
            status=status.HTTP_201_CREATED,
        )


class SwitchClinicView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        clinic_id = request.data.get("clinic_id")
        if not ClinicMembership.objects.filter(
            user=request.user, clinic_id=clinic_id, is_active=True
        ).exists():
            return Response({"detail": "Not a member."}, status=status.HTTP_403_FORBIDDEN)

        tokens = get_tokens_for_user(request.user, clinic_id=clinic_id)
        return Response({"tokens": tokens})


class RegisterPatientView(APIView):
    permission_classes = [AllowAny]

    @transaction.atomic
    def post(self, request):
        from apps.patients.models import Patient

        serializer = RegisterPatientSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        if User.objects.filter(username=data["username"]).exists():
            return Response({"detail": "Username already taken."}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.create_user(
            username=data["username"],
            password=data["password"],
            email=data.get("email", ""),
            first_name=data["first_name"],
            last_name=data["last_name"],
            phone=data.get("phone", ""),
            user_type=UserType.PATIENT,
        )
        patient = Patient.objects.create(
            user=user,
            first_name=data["first_name"],
            last_name=data["last_name"],
            phone=data.get("phone", ""),
            email=data.get("email", ""),
            date_of_birth=data.get("date_of_birth"),
            gender=data.get("gender", ""),
        )
        tokens = get_tokens_for_user(user)
        return Response(
            {
                "user": {"id": str(user.id), "username": user.username},
                "patient": {"id": str(patient.id)},
                "tokens": tokens,
            },
            status=status.HTTP_201_CREATED,
        )


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        from apps.accounts.serializers import UserSerializer
        from apps.rbac.services import get_user_permissions
        from specialties.base.services import list_modules, module_to_dict

        data = UserSerializer(request.user).data
        clinic = getattr(request, "clinic", None)
        if clinic:
            data["active_clinic"] = {
                "id": str(clinic.id),
                "name": clinic.name,
                "slug": clinic.slug,
                "specialty_code": clinic.specialty_code,
            }
            data["permissions"] = list(get_user_permissions(request.user, clinic))
            data["specialty_modules"] = [
                module_to_dict(m, active_code=clinic.specialty_code)
                for m in list_modules()
            ]
        return Response(data)
