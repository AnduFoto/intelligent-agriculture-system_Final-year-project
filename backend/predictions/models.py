from django.db import models

# Create your models here.
from django.conf import settings
from django.db import models


class PredictionHistory(models.Model):
    """
    A single successful crop disease prediction, owned entirely by
    the Intelligent Agriculture System (not the external AI System).

    Only genuine successful predictions are stored here — rejected
    images (not-a-plant, not-confident-enough) are never persisted,
    per the confirmed Phase 2 business rule.
    """

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='prediction_history'
    )

    # Our own stored copy of the image (see Phase 2, Decision 1 —
    # Django re-saves its own copy rather than referencing the AI
    # System's media URL, keeping this system self-contained).
    image = models.ImageField(upload_to='predictions/%Y/%m/%d/')

    # Raw values from the AI System's response.
    disease_class = models.CharField(max_length=100)  # e.g. "Tomato___Early_blight"
    display_name = models.CharField(max_length=150)   # e.g. "Tomato Early Blight"
    crop = models.CharField(max_length=100)            # e.g. "Tomato"
    confidence = models.FloatField()                    # e.g. 87.42 (percentage, not 0-1)
    is_healthy = models.BooleanField(default=False)

    # Snapshots of the AI System's structured response — never
    # edited or queried field-by-field by our system, only stored
    # and displayed as-is (see Phase 2, Section 10 rationale).
    solution_detail = models.JSONField()
    top_predictions = models.JSONField()

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Prediction History'
        verbose_name_plural = 'Prediction History'

    def __str__(self):
        return f"{self.display_name} ({self.confidence:.2f}%) — {self.user.email}"