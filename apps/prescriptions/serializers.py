from rest_framework import serializers

from apps.prescriptions.models import Prescription, PrescriptionItem


class PrescriptionItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = PrescriptionItem
        fields = ("id", "medication_name", "dosage", "frequency", "duration", "instructions")


class PrescriptionSerializer(serializers.ModelSerializer):
    items = PrescriptionItemSerializer(many=True, required=False)

    class Meta:
        model = Prescription
        fields = ("id", "visit", "patient", "doctor", "notes", "visibility", "items", "created_at")

    def create(self, validated_data):
        items_data = validated_data.pop("items", [])
        prescription = Prescription.objects.create(**validated_data)
        for item in items_data:
            PrescriptionItem.objects.create(prescription=prescription, clinic=prescription.clinic, **item)
        return prescription
