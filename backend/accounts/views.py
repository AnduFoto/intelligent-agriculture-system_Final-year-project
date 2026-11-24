from administration.services import AuditService
from administration.models import ActionTypeChoices, ActionCategoryChoices
from notifications.services import NotificationService
from rest_framework import status, generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.filters import OrderingFilter

from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.token_blacklist.models import OutstandingToken, BlacklistedToken

from django_filters.rest_framework import DjangoFilterBackend

from accounts.models import User, EmailVerificationToken, StatusChoices
from locations.models import Kebele
from accounts.serializers import OfficerKebeleListSerializer, OfficerKebeleAssignSerializer
from accounts.models import User, EmailVerificationToken, StatusChoices, RoleChoices, OfficerKebeleAssignment
from accounts.serializers import OfficerKebeleListSerializer, OfficerKebeleAssignSerializer, KebeleOfficerAssignmentSerializer
from accounts.serializers import (
    PublicRegistrationSerializer,
    AdminUserCreationSerializer,
    CustomTokenObtainPairSerializer,
    ProfileSerializer,
    ProfileUpdateSerializer,
    ChangePasswordSerializer,
    ForgotPasswordSerializer,
    ResetPasswordSerializer,
    UserStatusUpdateSerializer,
)
from accounts.services import send_verification_email, send_password_reset_email
from accounts.permissions import IsAdministrator
from accounts.filters import UserFilter
from accounts.models import User, EmailVerificationToken, StatusChoices, RoleChoices
from accounts.permissions import IsAdministrator, IsFarmer, IsOfficer, IsAdminOrLeadOfficerListingOfficers
from accounts.serializers import OfficerKebeleListSerializer, OfficerKebeleAssignSerializer, KebeleOfficerAssignmentSerializer, OfficerKebeleAssignmentDetailSerializer
class RegisterView(generics.CreateAPIView):
    """
    Public self-registration endpoint. Always creates a Farmer account
    with status=PENDING_VERIFICATION, then sends a verification email.
    """
    serializer_class = PublicRegistrationSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        AuditService.log(
            action=ActionTypeChoices.USER_CREATED,
            description=f"Created user {user.get_full_name()} ({user.email}) as {user.get_role_display()}",
            actor=request.user,
            target_type='User',
            target_id=user.id,
            target_repr=user.get_full_name(),
            request=request,
            kebele=user.kebele,
            woreda=user.woreda,
            special_woreda=user.special_woreda,
            zone=user.zone,
            region=user.region
        )

        try:
            send_verification_email(user)
            email_sent = True
        except Exception:
            # Registration should not fail just because the email
            # provider is temporarily unavailable. The account exists
            # and can request a fresh verification email via the
            # resend endpoint below.
            email_sent = False

        return Response(
            {
                'message': (
                    "Registration successful. Please check your email to verify your account."
                    if email_sent else
                    "Registration successful, but we could not send the verification email. "
                    "Please use the resend option to try again."
                ),
                'email': user.email,
                'email_sent': email_sent,
            },
            status=status.HTTP_201_CREATED,
        )


class VerifyEmailView(APIView):
    """
    Consumes an email verification token and activates the account.
    Called when the user clicks the link in their verification email.
    """
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        token_value = request.data.get('token')

        if not token_value:
            return Response(
                {'detail': "Verification token is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            verification_token = EmailVerificationToken.objects.select_related('user').get(
                token=token_value
            )
        except (EmailVerificationToken.DoesNotExist, ValueError):
            return Response(
                {'detail': "Invalid or expired verification link."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not verification_token.is_valid:
            return Response(
                {'detail': "Invalid or expired verification link."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = verification_token.user

        if user.status == StatusChoices.ACTIVE:
            return Response(
                {'detail': "This account is already verified. You may log in."},
                status=status.HTTP_200_OK,
            )

        user.status = StatusChoices.ACTIVE
        user.is_active = True
        user.save(update_fields=['status', 'is_active'])

        verification_token.mark_as_used()

        return Response(
            {'detail': "Email verified successfully. You may now log in."},
            status=status.HTTP_200_OK,
        )


class ResendVerificationEmailView(APIView):
    """
    Allows a user with a PENDING_VERIFICATION account to request a
    fresh verification email, e.g. if the original expired or was lost.

    Responds with the same generic message regardless of whether the
    email exists or is already verified, to avoid leaking account
    existence/status (same email-enumeration-prevention principle as
    Forgot Password).
    """
    permission_classes = [AllowAny]

    GENERIC_MESSAGE = (
        "If an account with that email exists and is not yet verified, "
        "a new verification email has been sent."
    )

    def post(self, request, *args, **kwargs):
        email = request.data.get('email', '').lower().strip()

        if not email:
            return Response(
                {'detail': "Email is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({'detail': self.GENERIC_MESSAGE}, status=status.HTTP_200_OK)

        if user.status == StatusChoices.PENDING_VERIFICATION:
            try:
                send_verification_email(user)
            except Exception:
                pass  # Same fail-open reasoning as RegisterView.

        return Response({'detail': self.GENERIC_MESSAGE}, status=status.HTTP_200_OK)
    





from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework.permissions import IsAuthenticated

from accounts.serializers import CustomTokenObtainPairSerializer


class LoginView(TokenObtainPairView):
    """
    Login endpoint. Delegates all logic (credential checking, status
    checks, token issuance, response shaping) to
    CustomTokenObtainPairSerializer — this view only wires that
    serializer in as the one TokenObtainPairView uses.
    """
    serializer_class = CustomTokenObtainPairSerializer
    permission_classes = [AllowAny]


class LogoutView(APIView):
    """
    Blacklists the provided refresh token, effectively ending the
    session server-side. The client is still responsible for
    discarding both tokens locally.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        refresh_token = request.data.get('refresh')

        if not refresh_token:
            return Response(
                {'detail': "Refresh token is required to log out."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            token = RefreshToken(refresh_token)
            token.blacklist()
        except TokenError:
            return Response(
                {'detail': "Invalid or already-expired refresh token."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(
            {'detail': "Logged out successfully."},
            status=status.HTTP_200_OK,
        )
    


    from accounts.serializers import (
    ChangePasswordSerializer,
    ForgotPasswordSerializer,
    ResetPasswordSerializer,
)
from accounts.services import send_password_reset_email


class ChangePasswordView(APIView):
    """
    Allows an authenticated user to change their own password,
    given their current password for confirmation.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        serializer = ChangePasswordSerializer(
            data=request.data,
            context={'request': request}
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(
            {'detail': "Password changed successfully."},
            status=status.HTTP_200_OK,
        )


class ForgotPasswordView(APIView):
    """
    Accepts an email and, if it belongs to a registered user, sends a
    password reset link. Always returns the same generic response
    regardless of whether the email exists, to prevent account
    enumeration.
    """
    permission_classes = [AllowAny]

    GENERIC_MESSAGE = (
        "If an account with that email exists, a password reset link has been sent."
    )

    def post(self, request, *args, **kwargs):
        serializer = ForgotPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email']

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({'detail': self.GENERIC_MESSAGE}, status=status.HTTP_200_OK)

        # Only send if the account is actually usable — no point sending
        # a password reset link to an unverified or suspended account.
        # We still return the same generic message either way, so this
        # distinction is never revealed to the caller.
        if user.status == StatusChoices.ACTIVE:
            try:
                send_password_reset_email(user)
            except Exception:
                pass  # Same fail-open reasoning as registration/resend.

        return Response({'detail': self.GENERIC_MESSAGE}, status=status.HTTP_200_OK)


class ResetPasswordView(APIView):
    """
    Consumes a password reset token and sets a new password.
    Called when the user submits the form reached via the reset link.
    """
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = ResetPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(
            {'detail': "Password has been reset successfully. You may now log in."},
            status=status.HTTP_200_OK,
        )
    
from accounts.serializers import ProfileSerializer, ProfileUpdateSerializer


class ProfileView(APIView):
    """
    Retrieve or update the authenticated user's own profile.

    GET  -> full profile, including resolved location names
    PATCH -> partial update of editable fields only (see
             ProfileUpdateSerializer for exactly what is excluded)
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        serializer = ProfileSerializer(request.user, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request, *args, **kwargs):
        data = request.data.copy()
        if data.get('profile_image') == '':
            data['profile_image'] = None

        serializer = ProfileUpdateSerializer(request.user, data=data, partial=True, context={'request': request})
        serializer.is_valid(raise_exception=True)
        serializer.save()

        # Return the full, freshly-updated profile representation
        # (with resolved names), not just the raw updated fields.
        response_serializer = ProfileSerializer(request.user, context={'request': request})
        return Response(response_serializer.data, status=status.HTTP_200_OK)
    





from rest_framework_simplejwt.token_blacklist.models import OutstandingToken, BlacklistedToken
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import OrderingFilter

from accounts.serializers import AdminUserCreationSerializer, UserStatusUpdateSerializer
from accounts.permissions import IsAdministrator
from accounts.filters import UserFilter


class AdminCreateUserView(generics.CreateAPIView):
    """
    Administrator-only endpoint to create a Farmer, Officer, or
    Administrator account. Created accounts still require email
    verification (no bypass) — see AdminUserCreationSerializer.
    """
    serializer_class = AdminUserCreationSerializer
    permission_classes = [IsAdministrator]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        try:
            send_verification_email(user)
            email_sent = True
        except Exception:
            email_sent = False

        return Response(
            {
                'message': (
                    "User created successfully. A verification email has been sent."
                    if email_sent else
                    "User created successfully, but the verification email could not be sent. "
                    "The user can request a new one via the resend option."
                ),
                'user': ProfileSerializer(user).data,
                'email_sent': email_sent,
            },
            status=status.HTTP_201_CREATED,
        )


class AdminUserListView(generics.ListAPIView):
    """
    Administrator: list all users, with filtering (role, status,
    region) and search (email, name, phone) support.
    Lead Officer: allowed to list users with role=OFFICER for assignment purposes.
    """
    serializer_class = ProfileSerializer
    permission_classes = [IsAdminOrLeadOfficerListingOfficers]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_class = UserFilter
    ordering_fields = ['date_joined', 'first_name', 'last_name', 'email']
    ordering = ['-date_joined']

    def get_queryset(self):
        if self.request.user.role == RoleChoices.OFFICER:
            return User.objects.filter(role=RoleChoices.OFFICER).select_related('region', 'zone', 'woreda', 'special_woreda')
        return User.objects.select_related(
            'region', 'zone', 'woreda', 'special_woreda'
        ).all()


class AdminUserDetailView(generics.RetrieveAPIView):
    """
    Administrator-only: view full details of a specific user by ID.
    """
    queryset = User.objects.select_related(
        'region', 'zone', 'woreda', 'special_woreda'
    ).all()
    serializer_class = ProfileSerializer
    permission_classes = [IsAdministrator]
    lookup_field = 'pk'


class AdminUserStatusUpdateView(APIView):
    """
    Administrator-only: change a user's status (e.g. suspend/reactivate).

    When a user is SUSPENDED, all of their currently outstanding refresh
    tokens are immediately blacklisted, forcing them out of any active
    session rather than waiting for natural token expiry (up to 15
    minutes for the access token). This resolves the "delayed
    suspension" gap noted when the JWT role/status claims were designed
    in Step 20.
    """
    permission_classes = [IsAdministrator]

    def patch(self, request, pk, *args, **kwargs):
        try:
            target_user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response(
                {'detail': "User not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        if target_user == request.user:
            return Response(
                {'detail': "You cannot change your own status."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = UserStatusUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        new_status = serializer.validated_data['status']

        target_user.status = new_status
        target_user.is_active = (new_status == StatusChoices.ACTIVE)
        target_user.save(update_fields=['status', 'is_active'])
        act = ActionTypeChoices.USER_ACTIVATED if new_status == StatusChoices.ACTIVE else (
            ActionTypeChoices.USER_SUSPENDED if new_status == StatusChoices.SUSPENDED else ActionTypeChoices.USER_DEACTIVATED
        )
        AuditService.log(
            action=act,
            description=f"Changed status of user {target_user.get_full_name()} to {new_status}",
            actor=request.user,
            target_type='User',
            target_id=target_user.id,
            target_repr=target_user.get_full_name(),
            request=request
        )
        NotificationService.notify_user(
            recipient=target_user,
            title='Account Status Update',
            message=f"Your account status has been updated to {target_user.get_status_display()}.",
            category='SYSTEM'
        )

        if new_status == StatusChoices.SUSPENDED:
            outstanding_tokens = OutstandingToken.objects.filter(user=target_user)
            for outstanding_token in outstanding_tokens:
                BlacklistedToken.objects.get_or_create(token=outstanding_token)

        return Response(
            {
                'detail': f"User status updated to {target_user.get_status_display()}.",
                'user': ProfileSerializer(target_user).data,
            },
            status=status.HTTP_200_OK,
        )



class OfficerKebeleListView(APIView):
    """
    Administrator-only: list a specific Officer's currently assigned
    Kebeles.
    """
    permission_classes = [IsAdministrator]

    def get(self, request, pk, *args, **kwargs):
        try:
            target_user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response({'detail': "User not found."}, status=status.HTTP_404_NOT_FOUND)

        if target_user.role != RoleChoices.OFFICER:
            return Response(
                {'detail': "Kebele assignments only apply to Agriculture Officer accounts."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = OfficerKebeleListSerializer(target_user)
        return Response(serializer.data, status=status.HTTP_200_OK)


class OfficerKebeleAssignView(APIView):
    """
    Administrator-only: add one or more Kebeles to an Officer's
    assignment set. Adding an already-assigned Kebele again is a
    harmless no-op (M2M .add() is naturally idempotent).
    """
    permission_classes = [IsAdministrator]

    def post(self, request, pk, *args, **kwargs):
        try:
            target_user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response({'detail': "User not found."}, status=status.HTTP_404_NOT_FOUND)

        if target_user.role != RoleChoices.OFFICER:
            return Response(
                {'detail': "Kebele assignments only apply to Agriculture Officer accounts."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = OfficerKebeleAssignSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        kebele_ids = serializer.validated_data['kebele_ids']

        kebeles = Kebele.objects.filter(id__in=kebele_ids)
        for kebele in kebeles:
            OfficerKebeleAssignment.objects.get_or_create(
                officer=target_user,
                kebele=kebele,
                defaults={'assigned_by': request.user},
            )
            AuditService.log(
                action=ActionTypeChoices.OFFICER_ASSIGNED,
                description=f"Assigned officer {target_user.get_full_name()} to kebele {kebele.name}",
                actor=request.user,
                target_type='OfficerKebeleAssignment',
                target_id=target_user.id,
                target_repr=f"{target_user.get_full_name()} -> {kebele.name}",
                request=request,
                kebele=kebele
            )
            NotificationService.notify_user(
                recipient=target_user,
                title='Kebele Assignment Update',
                message=f"You have been assigned to cover {kebele.name}.",
                category='ASSIGNMENT'
            )

        response_serializer = OfficerKebeleListSerializer(target_user)
        return Response(response_serializer.data, status=status.HTTP_200_OK)

class OfficerKebeleRemoveView(APIView):
    """
    Administrator-only: remove one specific Kebele from an Officer's
    assignment set.
    """
    permission_classes = [IsAdministrator]

    def delete(self, request, pk, kebele_id, *args, **kwargs):
        try:
            target_user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response({'detail': "User not found."}, status=status.HTTP_404_NOT_FOUND)

        if target_user.role != RoleChoices.OFFICER:
            return Response(
                {'detail': "Kebele assignments only apply to Agriculture Officer accounts."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            kebele = Kebele.objects.get(pk=kebele_id)
        except Kebele.DoesNotExist:
            return Response({'detail': "Kebele not found."}, status=status.HTTP_404_NOT_FOUND)

        target_user.assigned_kebeles.remove(kebele)

        AuditService.log(
            action=ActionTypeChoices.OFFICER_UNASSIGNED,
            category=ActionCategoryChoices.ASSIGNMENT,
            description=f"Removed officer {target_user.get_full_name()} ({target_user.email}) assignment from kebele {kebele.name}.",
            actor=request.user,
            target_type='OfficerKebeleAssignment',
            target_repr=f"Officer: {target_user.get_full_name()} | Kebele: {kebele.name}",
            request=request,
            kebele=kebele
        )

        response_serializer = OfficerKebeleListSerializer(target_user)
        return Response(response_serializer.data, status=status.HTTP_200_OK)




class KebeleOfficersView(APIView):
    """
    Administrator-only: list every Officer currently assigned to a
    specific Kebele, each with when and by whom the assignment was
    made. Powers the "Detail" view on the Kebele assignment UI, since
    a single Kebele can be covered by multiple Officers at once.
    """
    permission_classes = [IsAdministrator]

    def get(self, request, kebele_id, *args, **kwargs):
        try:
            kebele = Kebele.objects.get(pk=kebele_id)
        except Kebele.DoesNotExist:
            return Response({'detail': "Kebele not found."}, status=status.HTTP_404_NOT_FOUND)

        assignments = OfficerKebeleAssignment.objects.filter(kebele=kebele).select_related(
            'officer', 'assigned_by'
        ).order_by('-assigned_at')
        serializer = KebeleOfficerAssignmentSerializer(assignments, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class MyAssignedKebelesView(APIView):
    """
    Self-service, read-only: lets an authenticated Officer view their
    own assigned Kebeles (name, parent, when assigned, by whom) —
    without needing an Administrator to tell them their coverage area.
    """
    permission_classes = [IsOfficer]

    def get(self, request, *args, **kwargs):
        assignments = request.user.kebele_assignments.select_related(
            'kebele', 'kebele__woreda', 'kebele__special_woreda', 'assigned_by'
        ).order_by('-assigned_at')
        serializer = OfficerKebeleAssignmentDetailSerializer(assignments, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class KebeleLeadOfficerView(APIView):
    permission_classes = [IsAdministrator]
    def get(self, request, kebele_id):
        from accounts.models import LeadOfficerAssignment
        from accounts.serializers import LeadOfficerAssignmentSerializer
        try:
            assignment = LeadOfficerAssignment.objects.select_related('kebele', 'officer', 'assigned_by').get(kebele_id=kebele_id)
            serialized = LeadOfficerAssignmentSerializer(assignment).data
            lead_info = {
                'id': assignment.id,
                'kebele_id': assignment.kebele.id,
                'kebele_name': assignment.kebele.name,
                'officer_id': assignment.officer.id,
                'officer_full_name': assignment.officer.get_full_name(),
                'officer_email': assignment.officer.email,
                'assigned_at': assignment.assigned_at,
            }
            return Response({'lead_officer': lead_info, **serialized})
        except LeadOfficerAssignment.DoesNotExist:
            return Response({'lead_officer': None}, status=status.HTTP_404_NOT_FOUND)
            
    def post(self, request, kebele_id):
        from locations.models import Kebele
        from accounts.serializers import LeadOfficerAssignSerializer, LeadOfficerAssignmentSerializer
        from accounts.models import LeadOfficerAssignment
        kebele = generics.get_object_or_404(Kebele, id=kebele_id)
        serializer = LeadOfficerAssignSerializer(data=request.data, context={'kebele': kebele})
        serializer.is_valid(raise_exception=True)
        
        # Remove existing if any (one lead officer per kebele, one kebele per lead officer)
        LeadOfficerAssignment.objects.filter(kebele=kebele).delete()
        LeadOfficerAssignment.objects.filter(officer_id=serializer.validated_data['officer_id']).delete()
        assignment = LeadOfficerAssignment.objects.create(
            kebele=kebele,
            officer_id=serializer.validated_data['officer_id'],
            assigned_by=request.user
        )
        AuditService.log(
            action=ActionTypeChoices.LEAD_OFFICER_ASSIGNED,
            description=f"Assigned Lead Officer {assignment.officer.get_full_name()} to kebele {kebele.name}",
            actor=request.user,
            target_type='LeadOfficerAssignment',
            target_id=assignment.id,
            target_repr=f"{assignment.officer.get_full_name()} -> {kebele.name}",
            request=request,
            kebele=kebele
        )
        NotificationService.notify_user(
            recipient=assignment.officer,
            title='Lead Officer Appointment',
            message=f"You have been appointed as Lead Officer for {kebele.name}.",
            category='ASSIGNMENT'
        )
        serialized = LeadOfficerAssignmentSerializer(assignment).data
        lead_info = {
            'id': assignment.id,
            'kebele_id': assignment.kebele.id,
            'kebele_name': assignment.kebele.name,
            'officer_id': assignment.officer.id,
            'officer_full_name': assignment.officer.get_full_name(),
            'officer_email': assignment.officer.email,
            'assigned_at': assignment.assigned_at,
        }
        return Response({'lead_officer': lead_info, **serialized}, status=status.HTTP_201_CREATED)

    def delete(self, request, kebele_id):
        from accounts.models import LeadOfficerAssignment
        assignment = generics.get_object_or_404(LeadOfficerAssignment, kebele_id=kebele_id)
        AuditService.log(
            action=ActionTypeChoices.LEAD_OFFICER_REMOVED,
            category=ActionCategoryChoices.ASSIGNMENT,
            description=f"Removed Lead Officer assignment for {assignment.officer.get_full_name()} from kebele {assignment.kebele.name}",
            actor=request.user,
            target_type='LeadOfficerAssignment',
            target_id=assignment.id,
            target_repr=f"{assignment.officer.get_full_name()} -> {assignment.kebele.name}",
            request=request,
            kebele=assignment.kebele
        )
        assignment.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class MyLeadKebeleView(APIView):
    permission_classes = [IsOfficer]
    def get(self, request):
        from accounts.models import LeadOfficerAssignment
        from accounts.serializers import LeadOfficerAssignmentSerializer
        assignments = LeadOfficerAssignment.objects.filter(officer=request.user).select_related('kebele', 'officer', 'assigned_by').order_by('-assigned_at')
        assignment = assignments.first()
        if not assignment:
            return Response({'lead_officer': None, 'lead_kebeles': []}, status=status.HTTP_200_OK)

        serialized = LeadOfficerAssignmentSerializer(assignment).data
        lead_info = {
            'id': assignment.id,
            'kebele_id': assignment.kebele.id,
            'kebele_name': assignment.kebele.name,
            'officer_id': assignment.officer.id,
            'officer_full_name': assignment.officer.get_full_name(),
            'officer_email': assignment.officer.email,
            'assigned_at': assignment.assigned_at,
        }
        all_lead_kebeles = [
            {
                'id': a.id,
                'kebele_id': a.kebele.id,
                'kebele_name': a.kebele.name,
                'assigned_at': a.assigned_at,
            }
            for a in assignments
        ]
        return Response({'lead_officer': lead_info, 'lead_kebeles': all_lead_kebeles, **serialized})


