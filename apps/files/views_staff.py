from rest_framework import status, viewsets
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.response import Response

from apps.files.models import FileAsset
from apps.files.serializers import FileAssetSerializer
from apps.rbac.permissions import make_permission_class
from apps.tenancy.mixins import TenantViewSetMixin
from apps.tenancy.permissions import IsClinicMember


class FileAssetViewSet(TenantViewSetMixin, viewsets.ModelViewSet):
    queryset = FileAsset.objects.all()
    permission_classes = [IsClinicMember, make_permission_class("medical_records.view")]
    serializer_class = FileAssetSerializer
    parser_classes = [MultiPartParser, FormParser]

    def get_queryset(self):
        qs = super().get_queryset()
        patient_id = self.request.query_params.get("patient")
        if patient_id:
            qs = qs.filter(patient_id=patient_id)
        return qs.order_by("-created_at")

    def create(self, request, *args, **kwargs):
        upload = request.FILES.get("file")
        if not upload:
            return Response({"detail": "No file provided."}, status=status.HTTP_400_BAD_REQUEST)

        data = request.data.copy()
        asset = FileAsset(
            clinic=self.get_clinic(),
            patient_id=data.get("patient"),
            visit_id=data.get("visit") or None,
            uploaded_by=request.user,
            file=upload,
            original_name=upload.name,
            mime_type=getattr(upload, "content_type", ""),
            size_bytes=upload.size,
            category=data.get("category", ""),
            visibility=data.get("visibility", "private"),
            description=data.get("description", ""),
        )
        asset.save()
        return Response(FileAssetSerializer(asset).data, status=status.HTTP_201_CREATED)
