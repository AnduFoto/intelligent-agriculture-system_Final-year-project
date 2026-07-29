from rest_framework import serializers

from predictions.models import PredictionHistory


class ImageUploadSerializer(serializers.Serializer):
    """
    Validates the incoming image upload before we ever forward it to
    the AI System. Mirrors the AI System's own checks (file type,
    size) so obviously invalid uploads are rejected immediately with
    our own normalized error response, rather than wasting a round
    trip to the external service only to get its differently-shaped
    400 error back.
    """

    ALLOWED_CONTENT_TYPES = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp']
    MAX_SIZE_BYTES = 10 * 1024 * 1024  # 10MB, matching the AI System's own limit

    image = serializers.ImageField()

    def validate_image(self, value):
        if value.content_type not in self.ALLOWED_CONTENT_TYPES:
            raise serializers.ValidationError(
                "Please upload a valid image file (JPG, PNG, or WEBP)."
            )
        if value.size > self.MAX_SIZE_BYTES:
            raise serializers.ValidationError(
                "Image file is too large. Please upload an image smaller than 10MB."
            )
        return value


class PredictionHistorySerializer(serializers.ModelSerializer):
    """
    Represents a single saved prediction record. Used both as the
    success response shape for POST /api/predictions/predict/ and
    for the history list/detail endpoints — the same shape is
    appropriate in both places since a "prediction result" and a
    "history entry" are the same underlying object.
    """

    class Meta:
        model = PredictionHistory
        fields = [
            'id',
            'disease_class',
            'display_name',
            'crop',
            'confidence',
            'is_healthy',
            'image',
            'solution_detail',
            'top_predictions',
            'created_at',
        ]
        read_only_fields = fields  # this serializer is read-only everywhere it's used;
                                     # records are only ever created internally by the
                                     # view's own logic (Step 9), never directly via this
                                     # serializer's own .create()/.update()


class PredictionHistoryListSerializer(serializers.ModelSerializer):
    """
    A lighter-weight representation for the history LIST endpoint,
    omitting the large solution_detail/top_predictions JSON blobs —
    a Farmer browsing their history doesn't need the full treatment
    detail for every row, only enough to identify each entry and
    decide whether to open it. Full detail remains available via the
    detail endpoint (which uses PredictionHistorySerializer above).
    """

    class Meta:
        model = PredictionHistory
        fields = [
            'id',
            'disease_class',
            'display_name',
            'crop',
            'confidence',
            'is_healthy',
            'image',
            'created_at',
        ]
        read_only_fields = fields


class KebeleBrowseSerializer(serializers.Serializer):
    """
    One row in the Kebele browsing list — a Kebele annotated with
    aggregate prediction activity, used only for the Officer/
    Administrator drill-down browsing feature. Not related to the
    location app's own KebeleSerializer, which serves CRUD purposes.
    """
    id = serializers.IntegerField()
    name = serializers.CharField()
    woreda_name = serializers.CharField(allow_null=True)
    special_woreda_name = serializers.CharField(allow_null=True)
    prediction_count = serializers.IntegerField()
    last_prediction_at = serializers.DateTimeField(allow_null=True)


class CropBrowseSerializer(serializers.Serializer):
    """
    One distinct crop type predicted within a given Kebele, annotated
    with how many predictions exist for it and the most recent date —
    mirrors the same shape/reasoning as KebeleBrowseSerializer, one
    level deeper in the drill-down.
    """
    crop = serializers.CharField()
    prediction_count = serializers.IntegerField()
    last_prediction_at = serializers.DateTimeField(allow_null=True)



class FarmerBrowseSerializer(serializers.Serializer):
    """
    One Farmer row in the Kebele+Crop drill-down — a Farmer who has
    made at least one prediction for the given crop within the given
    Kebele, annotated with their prediction count for that crop.
    """
    id = serializers.IntegerField()
    full_name = serializers.CharField()
    email = serializers.EmailField()
    prediction_count = serializers.IntegerField()
    last_prediction_at = serializers.DateTimeField(allow_null=True)