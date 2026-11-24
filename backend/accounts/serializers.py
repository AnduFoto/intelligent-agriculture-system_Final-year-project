from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import serializers

from accounts.models import User, RoleChoices, StatusChoices, LanguageChoices
from locations.models import Region, Zone, Woreda, SpecialWoreda, Kebele


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

    kebele = serializers.PrimaryKeyRelatedField(queryset=Kebele.objects.all())

    language_preference = serializers.ChoiceField(
        choices=LanguageChoices.choices, default=LanguageChoices.ENGLISH
    )

    class Meta:
        model = User
        fields = [
            'first_name', 'middle_name', 'last_name',
            'email', 'phone_number',
            'password', 'confirm_password',
            'region', 'zone', 'woreda', 'special_woreda', 'kebele',
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
        kebele = attrs.get('kebele')

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

        # Kebele must belong to whichever Woreda or Special Woreda was
        # actually selected.
        if has_woreda and kebele.woreda_id != woreda.id:
            raise serializers.ValidationError(
                {'kebele': "The selected Kebele does not belong to the selected Woreda."}
            )

        if has_special and kebele.special_woreda_id != special_woreda.id:
            raise serializers.ValidationError(
                {'kebele': "The selected Kebele does not belong to the selected Special Woreda."}
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

    region = serializers.PrimaryKeyRelatedField(
        queryset=Region.objects.all(), required=False, allow_null=True
    )
    zone = serializers.PrimaryKeyRelatedField(
        queryset=Zone.objects.all(), required=False, allow_null=True
    )
    woreda = serializers.PrimaryKeyRelatedField(
        queryset=Woreda.objects.all(), required=False, allow_null=True
    )
    special_woreda = serializers.PrimaryKeyRelatedField(
        queryset=SpecialWoreda.objects.all(), required=False, allow_null=True
    )
    kebele = serializers.PrimaryKeyRelatedField(
        queryset=Kebele.objects.all(), required=False, allow_null=True
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
            'region', 'zone', 'woreda', 'special_woreda', 'kebele',
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

        role = attrs.get('role')

        if role == RoleChoices.OFFICER:
            # Officers have NO location chain at all. Explicitly reject
            # any location fields being submitted for an Officer, so a
            # client can't accidentally (or deliberately) attach a
            # location that will simply be ignored — better to fail
            # loudly than silently discard submitted data.
            location_fields_submitted = any([
                attrs.get('region'),
                attrs.get('zone'),
                attrs.get('woreda'),
                attrs.get('special_woreda'),
                attrs.get('kebele'),
            ])
            if location_fields_submitted:
                raise serializers.ValidationError(
                    {'non_field_errors': [
                        "Officers do not have a location assigned at creation. "
                        "Use the Kebele assignment feature after the account is created."
                    ]}
                )
            return attrs

        # Farmer or Administrator: full location chain required,
        # exactly mirroring PublicRegistrationSerializer's validation.
        region = attrs.get('region')
        zone = attrs.get('zone')
        woreda = attrs.get('woreda')
        special_woreda = attrs.get('special_woreda')
        kebele = attrs.get('kebele')

        if not region:
            raise serializers.ValidationError(
                {'region': "Region is required for this role."}
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

        if not kebele:
            raise serializers.ValidationError(
                {'kebele': "Kebele is required for this role."}
            )

        if has_woreda and kebele.woreda_id != woreda.id:
            raise serializers.ValidationError(
                {'kebele': "The selected Kebele does not belong to the selected Woreda."}
            )

        if has_special and kebele.special_woreda_id != special_woreda.id:
            raise serializers.ValidationError(
                {'kebele': "The selected Kebele does not belong to the selected Special Woreda."}
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

        is_edu_mgr = False
        try:
            from education.models import WoredaEducationalManagerAssignment, KebeleEducationalManagerAssignment
            is_edu_mgr = (
                WoredaEducationalManagerAssignment.objects.filter(officer=user).exists() or
                KebeleEducationalManagerAssignment.objects.filter(officer=user).exists()
            )
        except Exception:
            pass

        data['user'] = {
            'id': user.id,
            'email': user.email,
            'first_name': user.first_name,
            'middle_name': user.middle_name,
            'last_name': user.last_name,
            'role': user.role,
            'status': user.status,
            'language_preference': user.language_preference,
            'is_educational_manager': is_edu_mgr,
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
    kebele_name = serializers.CharField(source='kebele.name', read_only=True, default=None)
    full_name = serializers.CharField(source='get_full_name', read_only=True)
    
    assignments = serializers.SerializerMethodField()
    professional_information = serializers.SerializerMethodField()
    management_information = serializers.SerializerMethodField()
    is_educational_manager = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id', 'email', 'first_name', 'middle_name', 'last_name', 'full_name',
            'phone_number', 'role', 'status', 'language_preference', 'profile_image',
            'region', 'region_name',
            'zone', 'zone_name',
            'woreda', 'woreda_name',
            'special_woreda', 'special_woreda_name',
            'kebele', 'kebele_name',
            'date_joined',
            'assignments', 'professional_information', 'management_information',
            'is_educational_manager'
        ]
        read_only_fields = fields

    def get_is_educational_manager(self, obj):
        try:
            from education.models import WoredaEducationalManagerAssignment, KebeleEducationalManagerAssignment
            return (
                WoredaEducationalManagerAssignment.objects.filter(officer=obj).exists() or
                KebeleEducationalManagerAssignment.objects.filter(officer=obj).exists()
            )
        except Exception:
            return False

    def get_assignments(self, obj):
        if obj.role != RoleChoices.OFFICER:
            return []
        assignments = []
        for assign in obj.kebele_assignments.select_related('kebele', 'kebele__woreda', 'kebele__special_woreda', 'kebele__woreda__zone', 'kebele__special_woreda__region', 'kebele__woreda__zone__region').all():
            k = assign.kebele
            loc = {
                'kebele': {'id': k.id, 'name': k.name},
            }
            if k.woreda:
                loc['woreda'] = {'id': k.woreda.id, 'name': k.woreda.name}
                loc['zone'] = {'id': k.woreda.zone.id, 'name': k.woreda.zone.name}
                loc['region'] = {'id': k.woreda.zone.region.id, 'name': k.woreda.zone.region.name}
            elif k.special_woreda:
                loc['special_woreda'] = {'id': k.special_woreda.id, 'name': k.special_woreda.name}
                loc['region'] = {'id': k.special_woreda.region.id, 'name': k.special_woreda.region.name}
            assignments.append(loc)
        return assignments

    def get_professional_information(self, obj):
        if obj.role != RoleChoices.OFFICER:
            return None
        try:
            from consultations.models import OfficerSpecialization
            specs = OfficerSpecialization.objects.filter(officer=obj).select_related('specialization')
            return [
                {
                    'id': spec.specialization.id,
                    'name': spec.specialization.name,
                    'description': spec.specialization.description
                }
                for spec in specs
            ]
        except ImportError:
            return []

    def get_management_information(self, obj):
        info = {}
        try:
            lead_manager = getattr(obj, 'lead_officer_assignment', None)
            lead = lead_manager.first() if lead_manager else None
            if lead:
                info['lead_officer'] = {
                    'kebele': lead.kebele.name,
                    'woreda': lead.kebele.woreda.name if lead.kebele.woreda else None,
                    'zone': lead.kebele.woreda.zone.name if lead.kebele.woreda else None,
                    'special_woreda': lead.kebele.special_woreda.name if lead.kebele.special_woreda else None,
                    'region': lead.kebele.woreda.zone.region.name if lead.kebele.woreda else lead.kebele.special_woreda.region.name if lead.kebele.special_woreda else None,
                    'assigned_at': lead.assigned_at
                }
        except Exception:
            pass
            
        try:
            from education.models import WoredaEducationalManagerAssignment, KebeleEducationalManagerAssignment
            woreda_ed = WoredaEducationalManagerAssignment.objects.filter(officer=obj).select_related('woreda', 'special_woreda').first()
            if woreda_ed:
                info['woreda_education_manager'] = {
                    'woreda': woreda_ed.woreda.name if woreda_ed.woreda else None,
                    'special_woreda': woreda_ed.special_woreda.name if woreda_ed.special_woreda else None,
                }
                
            kebele_ed = KebeleEducationalManagerAssignment.objects.filter(officer=obj).select_related('kebele', 'kebele__woreda').first()
            if kebele_ed:
                info['kebele_education_manager'] = {
                    'kebele': kebele_ed.kebele.name,
                    'woreda': kebele_ed.kebele.woreda.name if kebele_ed.kebele.woreda else None,
                }
        except ImportError:
            pass
            
        return info if info else None


class ProfileUpdateSerializer(serializers.ModelSerializer):
    """
    Handles self-service profile updates. Deliberately excludes:
    - email
    - role
    - status
    - password
    - all location fields (region, zone, woreda, special_woreda, kebele)
    Location changes remain the responsibility of the appropriate administrative functionality.
    """
    class Meta:
        model = User
        fields = [
            'first_name', 'middle_name', 'last_name', 'phone_number',
            'language_preference', 'profile_image'
        ]
    



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


from locations.serializers import KebeleSerializer as LocationKebeleSerializer


class OfficerKebeleAssignSerializer(serializers.Serializer):
    """
    Accepts a list of Kebele IDs to add to an Officer's assignment set.
    Validates that every submitted ID actually exists, and that the
    target user is genuinely an Officer (enforced in the view, not
    here, since this serializer has no access to the target user —
    see PredictionHistoryDetailView-style reasoning: keep the
    serializer focused on shape/existence validation, leave identity
    /role checks to the view where the target user is already known).
    """
    kebele_ids = serializers.ListField(
        child=serializers.IntegerField(),
        allow_empty=False
    )

    def validate_kebele_ids(self, value):
        from locations.models import Kebele
        existing_ids = set(Kebele.objects.filter(id__in=value).values_list('id', flat=True))
        missing = set(value) - existing_ids
        if missing:
            raise serializers.ValidationError(
                f"The following Kebele IDs do not exist: {sorted(missing)}"
            )
        return value


class OfficerKebeleAssignmentDetailSerializer(serializers.Serializer):
    """
    One row of an Officer's assigned Kebeles, including WHEN and BY
    WHOM the assignment was made — reads from the through model
    directly, not from the Kebele itself.
    """
    id = serializers.IntegerField(source='kebele.id')
    name = serializers.CharField(source='kebele.name')
    woreda_name = serializers.SerializerMethodField()
    special_woreda_name = serializers.SerializerMethodField()
    assigned_at = serializers.DateTimeField()
    assigned_by_email = serializers.SerializerMethodField()

    def get_woreda_name(self, obj):
        return obj.kebele.woreda.name if obj.kebele.woreda else None

    def get_special_woreda_name(self, obj):
        return obj.kebele.special_woreda.name if obj.kebele.special_woreda else None

    def get_assigned_by_email(self, obj):
        return obj.assigned_by.email if obj.assigned_by else None


class OfficerKebeleListSerializer(serializers.ModelSerializer):
    """
    Read-only representation of a single Officer's currently assigned
    Kebeles, each with its own assignment timestamp and assigner.
    """
    assigned_kebeles = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name', 'assigned_kebeles']
        read_only_fields = fields

    def get_assigned_kebeles(self, obj):
        assignments = obj.kebele_assignments.select_related(
            'kebele', 'kebele__woreda', 'kebele__special_woreda', 'assigned_by'
        ).order_by('-assigned_at')
        return OfficerKebeleAssignmentDetailSerializer(assignments, many=True).data


class KebeleOfficerAssignmentSerializer(serializers.Serializer):
    """
    One row of a Kebele's assigned Officers — the inverse view of
    OfficerKebeleAssignmentDetailSerializer. Powers the "Detail" view
    showing every Officer currently covering a given Kebele.
    """
    officer_id = serializers.IntegerField(source='officer.id')
    officer_name = serializers.SerializerMethodField()
    officer_email = serializers.CharField(source='officer.email')
    assigned_at = serializers.DateTimeField()
    assigned_by_email = serializers.SerializerMethodField()

    def get_officer_name(self, obj):
        return f"{obj.officer.first_name} {obj.officer.last_name}"

    def get_assigned_by_email(self, obj):
        return obj.assigned_by.email if obj.assigned_by else None

from accounts.models import LeadOfficerAssignment

class LeadOfficerAssignSerializer(serializers.Serializer):
    officer_id = serializers.IntegerField()

    def validate_officer_id(self, value):
        from accounts.models import User, RoleChoices
        try:
            officer = User.objects.get(pk=value, role=RoleChoices.OFFICER)
        except User.DoesNotExist:
            raise serializers.ValidationError("Valid Officer account not found.")
            
        kebele = self.context.get('kebele')
        if kebele:
            if not officer.kebele_assignments.filter(kebele=kebele).exists():
                raise serializers.ValidationError("Officer must be assigned to this Kebele before becoming its Lead Officer.")

            existing_lead = LeadOfficerAssignment.objects.filter(officer=officer).exclude(kebele=kebele).select_related('kebele').first()
            if existing_lead:
                raise serializers.ValidationError(
                    f"Officer {officer.get_full_name()} is already designated as Lead Officer for {existing_lead.kebele.name}. "
                    f"An officer can only be designated as Lead Officer for one Kebele at a time."
                )
        return value

class LeadOfficerAssignmentSerializer(serializers.ModelSerializer):
    officer_full_name = serializers.CharField(source='officer.get_full_name', read_only=True)
    officer_email = serializers.CharField(source='officer.email', read_only=True)
    assigned_by_email = serializers.CharField(source='assigned_by.email', read_only=True)
    
    class Meta:
        model = LeadOfficerAssignment
        fields = ['id', 'kebele', 'officer', 'officer_full_name', 'officer_email', 'assigned_by_email', 'assigned_at']
        read_only_fields = fields