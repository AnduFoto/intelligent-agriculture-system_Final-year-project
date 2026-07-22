from django.test import TestCase

# Create your tests here.
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status

from accounts.models import User, StatusChoices, RoleChoices, EmailVerificationToken, PasswordResetToken
from locations.models import Region, Zone, Woreda, SpecialWoreda


class BaseTestSetup(APITestCase):
    """
    Shared setup: creates a Region/Zone/Woreda and a Region/SpecialWoreda
    pair, reused across most test cases below.
    """

    def setUp(self):
        self.region = Region.objects.create(name='Test Region')
        self.zone = Zone.objects.create(region=self.region, name='Test Zone')
        self.woreda = Woreda.objects.create(zone=self.zone, name='Test Woreda')
        self.special_woreda = SpecialWoreda.objects.create(
            region=self.region, name='Test Special Woreda'
        )

    def valid_registration_payload(self, **overrides):
        payload = {
            'first_name': 'Abebe',
            'last_name': 'Kebede',
            'email': 'abebe@example.com',
            'phone_number': '+251912345678',
            'password': 'StrongPass1!',
            'confirm_password': 'StrongPass1!',
            'region': self.region.id,
            'zone': self.zone.id,
            'woreda': self.woreda.id,
        }
        payload.update(overrides)
        return payload


class RegistrationTests(BaseTestSetup):

    def test_public_registration_creates_farmer(self):
        url = reverse('accounts:register')
        response = self.client.post(url, self.valid_registration_payload(), format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        user = User.objects.get(email='abebe@example.com')
        self.assertEqual(user.role, RoleChoices.FARMER)
        self.assertEqual(user.status, StatusChoices.PENDING_VERIFICATION)
        self.assertFalse(user.is_active)

    def test_registration_ignores_submitted_role(self):
        url = reverse('accounts:register')
        payload = self.valid_registration_payload()
        payload['role'] = 'ADMINISTRATOR'  # Should be silently ignored
        response = self.client.post(url, payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        user = User.objects.get(email='abebe@example.com')
        self.assertEqual(user.role, RoleChoices.FARMER)

    def test_registration_rejects_duplicate_email(self):
        url = reverse('accounts:register')
        self.client.post(url, self.valid_registration_payload(), format='json')
        response = self.client.post(url, self.valid_registration_payload(), format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('email', response.data['errors'])

    def test_registration_rejects_weak_password(self):
        url = reverse('accounts:register')
        payload = self.valid_registration_payload(password='weak', confirm_password='weak')
        response = self.client.post(url, payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('password', response.data['errors'])

    def test_registration_rejects_mismatched_passwords(self):
        url = reverse('accounts:register')
        payload = self.valid_registration_payload(confirm_password='Different1!')
        response = self.client.post(url, payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('confirm_password', response.data['errors'])

    def test_registration_rejects_zone_without_woreda(self):
        url = reverse('accounts:register')
        payload = self.valid_registration_payload(woreda=None)
        response = self.client.post(url, payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_registration_rejects_both_zone_and_special_woreda(self):
        url = reverse('accounts:register')
        payload = self.valid_registration_payload(special_woreda=self.special_woreda.id)
        response = self.client.post(url, payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_registration_accepts_special_woreda_path(self):
        url = reverse('accounts:register')
        payload = self.valid_registration_payload(
            zone=None, woreda=None, special_woreda=self.special_woreda.id
        )
        response = self.client.post(url, payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)


class EmailVerificationTests(BaseTestSetup):

    def setUp(self):
        super().setUp()
        self.user = User.objects.create_user(
            email='pending@example.com',
            password='StrongPass1!',
            first_name='Test',
            last_name='User',
            phone_number='+251911111111',
            region=self.region,
            zone=self.zone,
            woreda=self.woreda,
        )

    def test_verify_email_activates_account(self):
        token = EmailVerificationToken.objects.create(user=self.user)
        url = reverse('accounts:verify-email')
        response = self.client.post(url, {'token': str(token.token)}, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertEqual(self.user.status, StatusChoices.ACTIVE)
        self.assertTrue(self.user.is_active)

        token.refresh_from_db()
        self.assertTrue(token.used)

    def test_verify_email_rejects_invalid_token(self):
        url = reverse('accounts:verify-email')
        response = self.client.post(
            url, {'token': '00000000-0000-0000-0000-000000000000'}, format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_verify_email_rejects_already_used_token(self):
        token = EmailVerificationToken.objects.create(user=self.user)
        token.mark_as_used()

        url = reverse('accounts:verify-email')
        response = self.client.post(url, {'token': str(token.token)}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class LoginTests(BaseTestSetup):

    def setUp(self):
        super().setUp()
        self.active_user = User.objects.create_user(
            email='active@example.com',
            password='StrongPass1!',
            first_name='Active',
            last_name='User',
            phone_number='+251911111112',
            region=self.region,
            zone=self.zone,
            woreda=self.woreda,
        )
        self.active_user.status = StatusChoices.ACTIVE
        self.active_user.is_active = True
        self.active_user.save()

        self.pending_user = User.objects.create_user(
            email='pending2@example.com',
            password='StrongPass1!',
            first_name='Pending',
            last_name='User',
            phone_number='+251911111113',
            region=self.region,
            zone=self.zone,
            woreda=self.woreda,
        )

        self.suspended_user = User.objects.create_user(
            email='suspended@example.com',
            password='StrongPass1!',
            first_name='Suspended',
            last_name='User',
            phone_number='+251911111114',
            region=self.region,
            zone=self.zone,
            woreda=self.woreda,
        )
        self.suspended_user.status = StatusChoices.SUSPENDED
        self.suspended_user.save()

    def test_login_succeeds_for_active_user(self):
        url = reverse('accounts:login')
        response = self.client.post(
            url, {'email': 'active@example.com', 'password': 'StrongPass1!'}, format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
        self.assertEqual(response.data['user']['role'], RoleChoices.FARMER)

    def test_login_rejects_pending_verification_user(self):
        url = reverse('accounts:login')
        response = self.client.post(
            url, {'email': 'pending2@example.com', 'password': 'StrongPass1!'}, format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_login_rejects_suspended_user(self):
        url = reverse('accounts:login')
        response = self.client.post(
            url, {'email': 'suspended@example.com', 'password': 'StrongPass1!'}, format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_login_rejects_wrong_password(self):
        url = reverse('accounts:login')
        response = self.client.post(
            url, {'email': 'active@example.com', 'password': 'WrongPassword1!'}, format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_login_rejects_nonexistent_email(self):
        url = reverse('accounts:login')
        response = self.client.post(
            url, {'email': 'nobody@example.com', 'password': 'WrongPassword1!'}, format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class TokenRefreshLogoutTests(BaseTestSetup):

    def setUp(self):
        super().setUp()
        self.user = User.objects.create_user(
            email='refresh@example.com',
            password='StrongPass1!',
            first_name='Refresh',
            last_name='User',
            phone_number='+251911111115',
            region=self.region,
            zone=self.zone,
            woreda=self.woreda,
        )
        self.user.status = StatusChoices.ACTIVE
        self.user.is_active = True
        self.user.save()

        login_response = self.client.post(
            reverse('accounts:login'),
            {'email': 'refresh@example.com', 'password': 'StrongPass1!'},
            format='json',
        )
        self.access_token = login_response.data['access']
        self.refresh_token = login_response.data['refresh']

    def test_refresh_returns_new_access_token(self):
        url = reverse('accounts:token-refresh')
        response = self.client.post(url, {'refresh': self.refresh_token}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)

    def test_logout_blacklists_refresh_token(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.access_token}')
        url = reverse('accounts:logout')
        response = self.client.post(url, {'refresh': self.refresh_token}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # The blacklisted refresh token should now fail to refresh.
        refresh_url = reverse('accounts:token-refresh')
        second_response = self.client.post(refresh_url, {'refresh': self.refresh_token}, format='json')
        self.assertEqual(second_response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_logout_requires_authentication(self):
        self.client.credentials()  # Clear auth
        url = reverse('accounts:logout')
        response = self.client.post(url, {'refresh': self.refresh_token}, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class PasswordResetTests(BaseTestSetup):

    def setUp(self):
        super().setUp()
        self.user = User.objects.create_user(
            email='resetme@example.com',
            password='OldPass1!',
            first_name='Reset',
            last_name='User',
            phone_number='+251911111116',
            region=self.region,
            zone=self.zone,
            woreda=self.woreda,
        )
        self.user.status = StatusChoices.ACTIVE
        self.user.is_active = True
        self.user.save()

    def test_forgot_password_always_returns_generic_success(self):
        url = reverse('accounts:forgot-password')

        response_existing = self.client.post(url, {'email': 'resetme@example.com'}, format='json')
        response_nonexistent = self.client.post(url, {'email': 'nobody@example.com'}, format='json')

        self.assertEqual(response_existing.status_code, status.HTTP_200_OK)
        self.assertEqual(response_nonexistent.status_code, status.HTTP_200_OK)
        self.assertEqual(response_existing.data['detail'], response_nonexistent.data['detail'])

    def test_reset_password_with_valid_token(self):
        token = PasswordResetToken.objects.create(user=self.user)
        url = reverse('accounts:reset-password')
        response = self.client.post(url, {
            'token': str(token.token),
            'new_password': 'NewStrongPass1!',
            'confirm_new_password': 'NewStrongPass1!',
        }, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password('NewStrongPass1!'))

        token.refresh_from_db()
        self.assertTrue(token.used)

    def test_reset_password_rejects_expired_or_invalid_token(self):
        url = reverse('accounts:reset-password')
        response = self.client.post(url, {
            'token': '00000000-0000-0000-0000-000000000000',
            'new_password': 'NewStrongPass1!',
            'confirm_new_password': 'NewStrongPass1!',
        }, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_new_reset_request_invalidates_previous_token(self):
        from accounts.services import send_password_reset_email

        old_token = PasswordResetToken.objects.create(user=self.user)
        send_password_reset_email(self.user)  # Should invalidate old_token

        old_token.refresh_from_db()
        self.assertTrue(old_token.used)


class RolePermissionTests(BaseTestSetup):

    def setUp(self):
        super().setUp()
        self.farmer = User.objects.create_user(
            email='farmer@example.com',
            password='StrongPass1!',
            first_name='Farmer',
            last_name='User',
            phone_number='+251911111117',
            role=RoleChoices.FARMER,
            status=StatusChoices.ACTIVE,
            is_active=True,
            region=self.region,
            zone=self.zone,
            woreda=self.woreda,
        )
        self.admin = User.objects.create_user(
            email='admin2@example.com',
            password='StrongPass1!',
            first_name='Admin',
            last_name='User',
            phone_number='+251911111118',
            role=RoleChoices.ADMINISTRATOR,
            status=StatusChoices.ACTIVE,
            is_active=True,
            region=self.region,
            zone=self.zone,
            woreda=self.woreda,
        )

    def _login(self, email, password='StrongPass1!'):
        response = self.client.post(
            reverse('accounts:login'), {'email': email, 'password': password}, format='json'
        )
        return response.data['access']

    def test_farmer_cannot_access_admin_user_list(self):
        token = self._login('farmer@example.com')
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        response = self.client.get(reverse('accounts:admin-user-list'))
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_admin_can_access_admin_user_list(self):
        token = self._login('admin2@example.com')
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        response = self.client.get(reverse('accounts:admin-user-list'))
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_admin_cannot_change_own_status(self):
        token = self._login('admin2@example.com')
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        url = reverse('accounts:admin-user-status', kwargs={'pk': self.admin.id})
        response = self.client.patch(url, {'status': 'SUSPENDED'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_admin_can_suspend_another_user(self):
        token = self._login('admin2@example.com')
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        url = reverse('accounts:admin-user-status', kwargs={'pk': self.farmer.id})
        response = self.client.patch(url, {'status': 'SUSPENDED'}, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.farmer.refresh_from_db()
        self.assertEqual(self.farmer.status, StatusChoices.SUSPENDED)
        self.assertFalse(self.farmer.is_active)