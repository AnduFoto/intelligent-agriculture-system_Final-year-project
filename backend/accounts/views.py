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
        serializer = ProfileSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request, *args, **kwargs):
        serializer = ProfileUpdateSerializer(
            request.user,
            data=request.data,
            partial=True,
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()

        # Return the full, freshly-updated profile representation
        # (with resolved names), not just the raw updated fields.
        response_serializer = ProfileSerializer(request.user)
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
    Administrator-only: list all users, with filtering (role, status,
    region) and search (email, name, phone) support.
    """
    queryset = User.objects.select_related(
        'region', 'zone', 'woreda', 'special_woreda'
    ).all()
    serializer_class = ProfileSerializer
    permission_classes = [IsAdministrator]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_class = UserFilter
    ordering_fields = ['date_joined', 'first_name', 'last_name', 'email']
    ordering = ['-date_joined']


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