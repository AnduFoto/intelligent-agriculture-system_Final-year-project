from rest_framework import serializers

from accounts.models import RoleChoices, OfficerKebeleAssignment
from .models import ProfessionalSpecialization, OfficerSpecialization
from .models import ProfessionalSpecialization, OfficerSpecialization, CropType
from .models import (
    ProfessionalSpecialization,
    OfficerSpecialization,
    CropType,
    Consultation,
    ConsultationImage,
    ConsultationMessage,
    ConsultationNote,
    ConsultationStatus,
    ConsultationAIResult,
)
class ProfessionalSpecializationSerializer(serializers.ModelSerializer):
    created_by_email = serializers.EmailField(source='created_by.email', read_only=True, allow_null=True)
    officer_count = serializers.SerializerMethodField()

    class Meta:
        model = ProfessionalSpecialization
        fields = [
            'id', 'kebele', 'name', 'description', 'is_active',
            'created_by_email', 'officer_count', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'kebele', 'created_by_email', 'officer_count', 'created_at', 'updated_at']

    def get_officer_count(self, obj):
        return obj.officers.count()

    def validate_name(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError("Name cannot be blank.")
        return value

    def validate(self, attrs):
        # kebele comes from the view context (URL kwarg), not client input —
        # mirrors the pattern of role being structurally absent from
        # PublicRegistrationSerializer (Business Rule 1).
        kebele = self.context['kebele']
        name = attrs.get('name', getattr(self.instance, 'name', None))
        qs = ProfessionalSpecialization.objects.filter(kebele=kebele, name__iexact=name)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError(
                {'name': 'A specialization with this name already exists in this Kebele.'}
            )
        return attrs

    def create(self, validated_data):
        validated_data['kebele'] = self.context['kebele']
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)


class OfficerSpecializationSerializer(serializers.ModelSerializer):
    specialization_name = serializers.CharField(source='specialization.name', read_only=True)
    officer_email = serializers.EmailField(source='officer.email', read_only=True)
    officer_full_name = serializers.SerializerMethodField()
    assigned_by_email = serializers.EmailField(source='assigned_by.email', read_only=True, allow_null=True)

    class Meta:
        model = OfficerSpecialization
        fields = [
            'id', 'officer', 'officer_email', 'officer_full_name',
            'specialization', 'specialization_name',
            'assigned_by_email', 'assigned_at',
        ]
        read_only_fields = ['id', 'officer_email', 'officer_full_name', 'specialization_name', 'assigned_by_email', 'assigned_at']

    def get_officer_full_name(self, obj):
        return f"{obj.officer.first_name} {obj.officer.last_name}".strip()

    def validate(self, attrs):
        officer = attrs['officer']
        specialization = attrs['specialization']

        if officer.role != RoleChoices.OFFICER:
            raise serializers.ValidationError("Only Officers can be assigned a specialization.")

        # The specialization's Kebele must be one the officer is actually assigned to.
        if not OfficerKebeleAssignment.objects.filter(
            officer=officer, kebele=specialization.kebele
        ).exists():
            raise serializers.ValidationError(
                "This officer is not assigned to the Kebele that owns this specialization."
            )

        if OfficerSpecialization.objects.filter(officer=officer, specialization=specialization).exists():
            raise serializers.ValidationError("This officer already holds this specialization.")

        return attrs



class CropTypeSerializer(serializers.ModelSerializer):
    specialization_count = serializers.SerializerMethodField()

    class Meta:
        model = CropType
        fields = ['id', 'name', 'description', 'is_active', 'specialization_count', 'created_at', 'updated_at']
        read_only_fields = ['id', 'specialization_count', 'created_at', 'updated_at']

    def get_specialization_count(self, obj):
        return obj.specializations.count()

    def validate_name(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError("Name cannot be blank.")
        qs = CropType.objects.filter(name__iexact=value)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError("A crop with this name already exists.")
        return value


class CropTypeMappingSerializer(serializers.Serializer):
    """
    Used by a Lead Officer to attach/detach ONE of their own Kebele's
    specializations to/from a global CropType. Never lets a Lead Officer
    touch another Kebele's specializations or create new crops.
    """
    specialization_id = serializers.IntegerField()

    def validate_specialization_id(self, value):
        kebele = self.context['kebele']
        try:
            specialization = ProfessionalSpecialization.objects.get(pk=value, kebele=kebele)
        except ProfessionalSpecialization.DoesNotExist:
            raise serializers.ValidationError(
                "This specialization does not belong to your Kebele."
            )
        return specialization  # return the resolved object, not the raw id


class CropTypeWithKebeleMappingSerializer(serializers.ModelSerializer):
    """
    Read view for Lead Officers: a crop plus which of THIS Kebele's
    specializations (if any) it's currently mapped to.
    """
    mapped_specializations = serializers.SerializerMethodField()

    class Meta:
        model = CropType
        fields = ['id', 'name', 'description', 'is_active', 'mapped_specializations']

    def get_mapped_specializations(self, obj):
        kebele = self.context['kebele']
        specs = obj.specializations.filter(kebele=kebele)
        return [{'id': s.id, 'name': s.name} for s in specs]




    from .models import (
    ProfessionalSpecialization,
    OfficerSpecialization,
    CropType,
    Consultation,
    ConsultationImage,
    ConsultationMessage,
    ConsultationNote,
    ConsultationStatus,
)


class ConsultationImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ConsultationImage
        fields = ['id', 'image', 'uploaded_at']
        read_only_fields = ['id', 'uploaded_at']


class ConsultationMessageSerializer(serializers.ModelSerializer):
    sender_email = serializers.EmailField(source='sender.email', read_only=True)
    sender_full_name = serializers.SerializerMethodField()
    sender_role = serializers.CharField(source='sender.role', read_only=True)

    class Meta:
        model = ConsultationMessage
        fields = ['id', 'sender_email', 'sender_full_name', 'sender_role', 'message', 'created_at']
        read_only_fields = ['id', 'sender_email', 'sender_full_name', 'sender_role', 'created_at']

    def get_sender_full_name(self, obj):
        return f"{obj.sender.first_name} {obj.sender.last_name}".strip()


class ConsultationNoteSerializer(serializers.ModelSerializer):
    author_email = serializers.EmailField(source='author.email', read_only=True)

    class Meta:
        model = ConsultationNote
        fields = ['id', 'author_email', 'note', 'created_at']
        read_only_fields = ['id', 'author_email', 'created_at']


class ConsultationCreateSerializer(serializers.Serializer):
    """
    Farmer-facing creation payload. `kebele` is deliberately absent —
    always snapshotted server-side from the farmer's own profile
    (Decision F), never client-supplied.
    """
    crop_type_id = serializers.IntegerField()
    title = serializers.CharField(max_length=200)
    description = serializers.CharField()
    images = serializers.ListField(
        child=serializers.ImageField(), required=False, allow_empty=True
    )

    def validate_crop_type_id(self, value):
        try:
            crop = CropType.objects.get(pk=value, is_active=True)
        except CropType.DoesNotExist:
            raise serializers.ValidationError("Invalid or inactive crop type.")
        return crop


class ConsultationListSerializer(serializers.ModelSerializer):
    crop_name = serializers.CharField(source='crop_type.name', read_only=True)
    kebele_name = serializers.CharField(source='kebele.name', read_only=True)
    farmer_email = serializers.EmailField(source='farmer.email', read_only=True)
    farmer_full_name = serializers.SerializerMethodField()
    assigned_officer_email = serializers.EmailField(
        source='assigned_officer.email', read_only=True, allow_null=True
    )

    class Meta:
        model = Consultation
        fields = [
            'id', 'crop_name', 'kebele_name', 'title', 'status',
            'farmer_email', 'farmer_full_name',
            'assigned_officer_email', 'created_at', 'updated_at',
        ]

    def get_farmer_full_name(self, obj):
        return f"{obj.farmer.first_name} {obj.farmer.last_name}".strip()


class ConsultationDetailSerializer(serializers.ModelSerializer):
    crop_name = serializers.CharField(source='crop_type.name', read_only=True)
    kebele_name = serializers.CharField(source='kebele.name', read_only=True)
    farmer_email = serializers.EmailField(source='farmer.email', read_only=True)
    farmer_full_name = serializers.SerializerMethodField()
    assigned_officer_email = serializers.EmailField(
        source='assigned_officer.email', read_only=True, allow_null=True
    )
    images = ConsultationImageSerializer(many=True, read_only=True)
    messages = ConsultationMessageSerializer(many=True, read_only=True)
    latest_reassignment_reason = serializers.SerializerMethodField()
    # Notes are attached separately by the view for non-Farmer roles only —
    # never included here directly, to guarantee Farmers can never see them
    # regardless of how this serializer might be reused later.

    class Meta:
        model = Consultation
        fields = [
            'id', 'crop_name', 'kebele_name', 'title', 'description', 'status',
            'farmer_email', 'farmer_full_name',
            'assigned_officer_email', 'images', 'messages',
            'created_at', 'updated_at', 'resolved_at', 'closed_at',
            'latest_reassignment_reason',
        ]

    def get_farmer_full_name(self, obj):
        return f"{obj.farmer.first_name} {obj.farmer.last_name}".strip()

    def get_latest_reassignment_reason(self, obj):
        latest_log = obj.assignment_logs.filter(assigned_by__isnull=False).first()
        if latest_log and latest_log.reason:
            return latest_log.reason
        return None


class ConsultationMessageCreateSerializer(serializers.Serializer):
    message = serializers.CharField()



class ConsultationReassignSerializer(serializers.Serializer):
    officer_id = serializers.IntegerField()
    reason = serializers.CharField(required=False, allow_blank=True, default='')

    def validate_officer_id(self, value):
        from accounts.models import User, RoleChoices
        try:
            officer = User.objects.get(pk=value, role=RoleChoices.OFFICER, status='ACTIVE')
        except User.DoesNotExist:
            raise serializers.ValidationError("Invalid or inactive officer.")
        return officer


class ConsultationAIResultSerializer(serializers.ModelSerializer):
    triggered_by_email = serializers.EmailField(source='triggered_by.email', read_only=True)
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = ConsultationAIResult
        fields = [
            'id', 'triggered_by_email', 'image_url',
            'disease_class', 'display_name', 'crop', 'confidence', 'is_healthy',
            'is_valid_crop_image', 'agent_message', 'solution_detail', 'top_predictions',
            'sent_to_farmer', 'was_edited', 'sent_message', 'sent_at', 'created_at',
        ]
        read_only_fields = fields

    def get_image_url(self, obj):
        if obj.image:
            request = self.context.get('request')
            url = obj.image.image.url
            return request.build_absolute_uri(url) if request else url
        return None


class ConsultationAICheckSerializer(serializers.Serializer):
    """Which of this consultation's already-uploaded images to analyze."""
    image_id = serializers.IntegerField()


class ConsultationAISendSerializer(serializers.Serializer):
    """
    Officer's decision on an AI result: send as-is, or send an edited
    version. `message` is always required — for "send unchanged" the
    frontend just submits the original agent_message back.
    """
    message = serializers.CharField()



class ConsultationNoteCreateSerializer(serializers.Serializer):
    note = serializers.CharField()