from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import serializers

from accounts.models import User, RoleChoices, StatusChoices, LanguageChoices
from locations.models import Region, Zone, Woreda, SpecialWoreda


class PublicRegistrationSerializer(serializers.ModelSerializer):
    """
    Handles public self-registration. Always creates a Farmer account,
    regardless of any 'role' value submitted by the client — role is
    never read from input.
    """

    password = serializers.CharField(write_only=True, min_length=8)
    confirm_password = serializers.CharField(write_only=True, min_length=8)

    region = serializers.PrimaryKeyRelatedField(queryset=Region.objects.all())
    zone = serializers.PrimaryKeyRelatedField(
        queryset=Zone.objects.all(), required=False, allow_null=True
    )
    woreda = serializers.PrimaryKeyRelatedField(
        queryset=Woreda.objects.all(), required=False, allow_null=True
    )
    special_woreda = serializers.PrimaryKeyRelatedField(
        queryset=SpecialWoreda.objects.all(), required=False, allow_null=True
    )

    language_preference = serializers.ChoiceField(
        choices=LanguageChoices.choices, default=LanguageChoices.ENGLISH
    )

    class Meta:
        model = User
        fields = [
            'first_name', 'middle_name', 'last_name',
            'email', 'phone_number',
            'password', 'confirm_password',
            'region', 'zone', 'woreda', 'special_woreda',
            'language_preference',
        ]

    def validate_email(self, value):
        value = value.lower().strip()
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("An account with this email already exists.")
        return value

    def validate_password(self, value):
        # AUTH_PASSWORD_VALIDATORS (including our ComplexPasswordValidator)
        # is not applied automatically — must be invoked explicitly.
        try:
            validate_password(value)
        except DjangoValidationError as exc:
            raise serializers.ValidationError(list(exc.messages))
        return value

    def validate(self, attrs):
        # Password confirmation check
        if attrs.get('password') != attrs.get('confirm_password'):
            raise serializers.ValidationError(
                {'confirm_password': "Passwords do not match."}
            )

        # Location XOR validation — mirrors User.clean(), surfaced here
        # as clear field-level errors before we ever touch the database.
        region = attrs.get('region')
        zone = attrs.get('zone')
        woreda = attrs.get('woreda')
        special_woreda = attrs.get('special_woreda')

        has_zone = zone is not None
        has_woreda = woreda is not None
        has_special = special_woreda is not None

        if has_zone != has_woreda:
            raise serializers.ValidationError(
                {'woreda': "Both Zone and Woreda must be provided together."}
            )

        if (has_zone and has_woreda) and has_special:
            raise serializers.ValidationError(
                {'special_woreda': "Select either a Zone with Woreda, or a Special Woreda — not both."}
            )

        if not (has_zone and has_woreda) and not has_special:
            raise serializers.ValidationError(
                {'non_field_errors': ["You must select either a Zone with Woreda, or a Special Woreda."]}
            )

        if has_zone and zone.region_id != region.id:
            raise serializers.ValidationError(
                {'zone': "The selected Zone does not belong to the selected Region."}
            )

        if has_special and special_woreda.region_id != region.id:
            raise serializers.ValidationError(
                {'special_woreda': "The selected Special Woreda does not belong to the selected Region."}
            )

        if has_woreda and woreda.zone_id != zone.id:
            raise serializers.ValidationError(
                {'woreda': "The selected Woreda does not belong to the selected Zone."}
            )

        return attrs

    def create(self, validated_data):
        validated_data.pop('confirm_password')
        password = validated_data.pop('password')

        # Role is never taken from client input — always Farmer for public registration.
        user = User.objects.create_user(
            password=password,
            role=RoleChoices.FARMER,
            status=StatusChoices.PENDING_VERIFICATION,
            **validated_data
        )
        return user
    



class AdminUserCreationSerializer(serializers.ModelSerializer):
    """
    Used by Administrators to create Farmer, Officer, or Administrator
    accounts from the Admin Dashboard. Unlike public registration, role
    is explicitly selectable. Created accounts still require email
    verification before login — no exception is made here.

    Access to this serializer must be restricted to Administrators at
    the view/permission layer (Step 24/29) — this serializer alone does
    not enforce who is allowed to call it.
    """

    password = serializers.CharField(write_only=True, min_length=8)
    confirm_password = serializers.CharField(write_only=True, min_length=8)

    role = serializers.ChoiceField(choices=RoleChoices.choices)

    region = serializers.PrimaryKeyRelatedField(queryset=Region.objects.all())
    zone = serializers.PrimaryKeyRelatedField(
        queryset=Zone.objects.all(), required=False, allow_null=True
    )
    woreda = serializers.PrimaryKeyRelatedField(
        queryset=Woreda.objects.all(), required=False, allow_null=True
    )
    special_woreda = serializers.PrimaryKeyRelatedField(
        queryset=SpecialWoreda.objects.all(), required=False, allow_null=True
    )

    language_preference = serializers.ChoiceField(
        choices=LanguageChoices.choices, default=LanguageChoices.ENGLISH
    )

    class Meta:
        model = User
        fields = [
            'first_name', 'middle_name', 'last_name',
            'email', 'phone_number',
            'password', 'confirm_password',
            'role',
            'region', 'zone', 'woreda', 'special_woreda',
            'language_preference',
        ]

    def validate_email(self, value):
        value = value.lower().strip()
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("An account with this email already exists.")
        return value

    def validate_password(self, value):
        try:
            validate_password(value)
        except DjangoValidationError as exc:
            raise serializers.ValidationError(list(exc.messages))
        return value

    def validate(self, attrs):
        if attrs.get('password') != attrs.get('confirm_password'):
            raise serializers.ValidationError(
                {'confirm_password': "Passwords do not match."}
            )

        region = attrs.get('region')
        zone = attrs.get('zone')
        woreda = attrs.get('woreda')
        special_woreda = attrs.get('special_woreda')

        has_zone = zone is not None
        has_woreda = woreda is not None
        has_special = special_woreda is not None

        if has_zone != has_woreda:
            raise serializers.ValidationError(
                {'woreda': "Both Zone and Woreda must be provided together."}
            )

        if (has_zone and has_woreda) and has_special:
            raise serializers.ValidationError(
                {'special_woreda': "Select either a Zone with Woreda, or a Special Woreda — not both."}
            )

        if not (has_zone and has_woreda) and not has_special:
            raise serializers.ValidationError(
                {'non_field_errors': ["You must select either a Zone with Woreda, or a Special Woreda."]}
            )

        if has_zone and zone.region_id != region.id:
            raise serializers.ValidationError(
                {'zone': "The selected Zone does not belong to the selected Region."}
            )

        if has_special and special_woreda.region_id != region.id:
            raise serializers.ValidationError(
                {'special_woreda': "The selected Special Woreda does not belong to the selected Region."}
            )

        if has_woreda and woreda.zone_id != zone.id:
            raise serializers.ValidationError(
                {'woreda': "The selected Woreda does not belong to the selected Zone."}
            )

        return attrs

    def create(self, validated_data):
        validated_data.pop('confirm_password')
        password = validated_data.pop('password')

        # Role IS taken from input here (unlike public registration),
        # but status always starts at PENDING_VERIFICATION regardless
        # of who is creating the account — no verification bypass.
        user = User.objects.create_user(
            password=password,
            status=StatusChoices.PENDING_VERIFICATION,
            **validated_data
        )
        return user
    



from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.exceptions import AuthenticationFailed


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Login serializer. Authenticates by email + password (email is the
    USERNAME_FIELD, so the parent class already expects 'email' as the
    login field name — no override needed there).

    Adds:
    - Explicit, distinct error messages per account status
      (Pending Verification vs Suspended), rather than a generic
      "invalid credentials" message.
    - 'role' embedded directly in the access token payload.
    - Full user info + role returned in the response body, so the
      frontend never needs a second request just to know who logged in.
    """

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['role'] = user.role
        token['status'] = user.status
        return token

    def validate(self, attrs):
        # Run the parent's authentication first. Note: SimpleJWT's default
        # authenticate() call will already reject users with is_active=False
        # at the Django auth backend level, before we ever reach our own
        # status checks below — so we look up the user manually first to
        # produce a clear, specific error message instead of SimpleJWT's
        # generic "No active account found with the given credentials".
        email = attrs.get('email', '').lower().strip()
        password = attrs.get('password')

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            raise AuthenticationFailed("Invalid email or password.")

        if not user.check_password(password):
            raise AuthenticationFailed("Invalid email or password.")

        if user.status == StatusChoices.PENDING_VERIFICATION:
            raise AuthenticationFailed(
                "Your email address has not been verified yet. "
                "Please check your inbox for the verification link."
            )

        if user.status == StatusChoices.SUSPENDED:
            raise AuthenticationFailed(
                "Your account has been suspended. Please contact an administrator."
            )

        if not user.is_active:
            raise AuthenticationFailed("This account is inactive.")

        # All checks passed — safe to proceed with normal token issuance.
        data = super().validate(attrs)

        data['user'] = {
            'id': user.id,
            'email': user.email,
            'first_name': user.first_name,
            'middle_name': user.middle_name,
            'last_name': user.last_name,
            'role': user.role,
            'status': user.status,
            'language_preference': user.language_preference,
        }

        return data
    

class ProfileSerializer(serializers.ModelSerializer):
    """
    Read-only-oriented representation of the authenticated user's own
    profile. Includes resolved location names (not just IDs) for
    frontend display convenience.
    """

    region_name = serializers.CharField(source='region.name', read_only=True)
    zone_name = serializers.CharField(source='zone.name', read_only=True, default=None)
    woreda_name = serializers.CharField(source='woreda.name', read_only=True, default=None)
    special_woreda_name = serializers.CharField(
        source='special_woreda.name', read_only=True, default=None
    )
    full_name = serializers.CharField(source='get_full_name', read_only=True)

    class Meta:
        model = User
        fields = [
            'id', 'email', 'first_name', 'middle_name', 'last_name', 'full_name',
            'phone_number', 'role', 'status', 'language_preference',
            'region', 'region_name',
            'zone', 'zone_name',
            'woreda', 'woreda_name',
            'special_woreda', 'special_woreda_name',
            'date_joined',
        ]
        read_only_fields = [
            'id', 'email', 'role', 'status', 'date_joined',
        ]


class ProfileUpdateSerializer(serializers.ModelSerializer):
    """
    Handles self-service profile updates. Deliberately excludes:
    - email       (identity-critical; changing it would need a
                    re-verification flow we haven't built — out of
                    scope for now, flagged below)
    - role        (administratively controlled only)
    - status      (administratively controlled only)
    - password    (handled by a separate Change Password serializer, Step 22)

    Location CAN be updated here (e.g., a farmer relocates), and is
    validated with the same XOR rule as registration.
    """

    region = serializers.PrimaryKeyRelatedField(queryset=Region.objects.all())
    zone = serializers.PrimaryKeyRelatedField(
        queryset=Zone.objects.all(), required=False, allow_null=True
    )
    woreda = serializers.PrimaryKeyRelatedField(
        queryset=Woreda.objects.all(), required=False, allow_null=True
    )
    special_woreda = serializers.PrimaryKeyRelatedField(
        queryset=SpecialWoreda.objects.all(), required=False, allow_null=True
    )

    class Meta:
        model = User
        fields = [
            'first_name', 'middle_name', 'last_name', 'phone_number',
            'language_preference',
            'region', 'zone', 'woreda', 'special_woreda',
        ]

    def validate(self, attrs):
        # Merge incoming changes with the existing instance's current
        # values, since a PATCH-style partial update may omit some
        # location fields entirely (e.g., only changing phone_number).
        instance = self.instance

        region = attrs.get('region', instance.region)
        zone = attrs.get('zone', instance.zone) if 'zone' in attrs or instance.zone else attrs.get('zone', None)
        woreda = attrs.get('woreda', instance.woreda) if 'woreda' in attrs or instance.woreda else attrs.get('woreda', None)
        special_woreda = (
            attrs.get('special_woreda', instance.special_woreda)
            if 'special_woreda' in attrs or instance.special_woreda
            else attrs.get('special_woreda', None)
        )

        has_zone = zone is not None
        has_woreda = woreda is not None
        has_special = special_woreda is not None

        if has_zone != has_woreda:
            raise serializers.ValidationError(
                {'woreda': "Both Zone and Woreda must be provided together."}
            )

        if (has_zone and has_woreda) and has_special:
            raise serializers.ValidationError(
                {'special_woreda': "Select either a Zone with Woreda, or a Special Woreda — not both."}
            )

        if not (has_zone and has_woreda) and not has_special:
            raise serializers.ValidationError(
                {'non_field_errors': ["You must select either a Zone with Woreda, or a Special Woreda."]}
            )

        if has_zone and zone.region_id != region.id:
            raise serializers.ValidationError(
                {'zone': "The selected Zone does not belong to the selected Region."}
            )

        if has_special and special_woreda.region_id != region.id:
            raise serializers.ValidationError(
                {'special_woreda': "The selected Special Woreda does not belong to the selected Region."}
            )

        if has_woreda and woreda.zone_id != zone.id:
            raise serializers.ValidationError(
                {'woreda': "The selected Woreda does not belong to the selected Zone."}
            )

        return attrs
    



from accounts.models import PasswordResetToken


class ChangePasswordSerializer(serializers.Serializer):
    """
    Used by an authenticated user to change their own password.
    Requires the current password for confirmation, plus the new
    password twice (new + confirm).
    """

    current_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, min_length=8)
    confirm_new_password = serializers.CharField(write_only=True, min_length=8)

    def validate_current_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Current password is incorrect.")
        return value

    def validate_new_password(self, value):
        try:
            validate_password(value)
        except DjangoValidationError as exc:
            raise serializers.ValidationError(list(exc.messages))
        return value

    def validate(self, attrs):
        if attrs['new_password'] != attrs['confirm_new_password']:
            raise serializers.ValidationError(
                {'confirm_new_password': "New passwords do not match."}
            )
        if attrs['current_password'] == attrs['new_password']:
            raise serializers.ValidationError(
                {'new_password': "New password must be different from the current password."}
            )
        return attrs

    def save(self, **kwargs):
        user = self.context['request'].user
        user.set_password(self.validated_data['new_password'])
        user.save(update_fields=['password'])
        return user


class ForgotPasswordSerializer(serializers.Serializer):
    """
    Accepts an email address and, if it belongs to a registered user,
    triggers a password reset email. Always responds successfully
    regardless of whether the email exists, to avoid leaking which
    emails are registered in the system.
    """

    email = serializers.EmailField()

    def validate_email(self, value):
        # Intentionally does NOT raise an error if the email doesn't exist.
        # The view will silently no-op in that case. Normalizing here only.
        return value.lower().strip()


class ResetPasswordSerializer(serializers.Serializer):
    """
    Consumes a PasswordResetToken (by its UUID) and sets a new password,
    provided the token is valid (unused and not expired).
    """

    token = serializers.UUIDField()
    new_password = serializers.CharField(write_only=True, min_length=8)
    confirm_new_password = serializers.CharField(write_only=True, min_length=8)

    def validate_token(self, value):
        try:
            reset_token = PasswordResetToken.objects.select_related('user').get(token=value)
        except PasswordResetToken.DoesNotExist:
            raise serializers.ValidationError("Invalid or expired reset link.")

        if not reset_token.is_valid:
            raise serializers.ValidationError("Invalid or expired reset link.")

        # Stash the resolved object for use in save() without a second query.
        self._reset_token = reset_token
        return value

    def validate_new_password(self, value):
        try:
            validate_password(value)
        except DjangoValidationError as exc:
            raise serializers.ValidationError(list(exc.messages))
        return value

    def validate(self, attrs):
        if attrs['new_password'] != attrs['confirm_new_password']:
            raise serializers.ValidationError(
                {'confirm_new_password': "New passwords do not match."}
            )
        return attrs

    def save(self, **kwargs):
        reset_token = self._reset_token
        user = reset_token.user

        user.set_password(self.validated_data['new_password'])
        user.save(update_fields=['password'])

        reset_token.mark_as_used()

        return user
    


class UserStatusUpdateSerializer(serializers.Serializer):
    """
    Used exclusively by Administrators to change a user's status
    (e.g., Active -> Suspended, or Suspended -> Active).
    """
    status = serializers.ChoiceField(choices=StatusChoices.choices)

    def validate_status(self, value):
        # PENDING_VERIFICATION is a system-driven state (set at creation,
        # cleared by email verification) — an Administrator should not be
        # able to manually push a user back into it.
        if value == StatusChoices.PENDING_VERIFICATION:
            raise serializers.ValidationError(
                "Status cannot be manually set to Pending Verification."
            )
        return value