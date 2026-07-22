from django.contrib.auth.base_user import BaseUserManager


class UserManager(BaseUserManager):
    """
    Custom manager for the email-based User model.
    """

    use_in_migrations = True

    def _create_user(self, email, password, **extra_fields):
        if not email:
            raise ValueError("The Email field must be set.")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.full_clean(exclude=['password'])
        user.save(using=self._db)
        return user

    def create_user(self, email, password=None, **extra_fields):
        """
        Standard user creation — used for public registration (Farmer)
        and Administrator-created users (Farmer/Officer/Administrator).

        Does NOT bypass email verification: status defaults to
        PENDING_VERIFICATION and is_active mirrors that until verified.
        """
        extra_fields.setdefault('is_staff', False)
        extra_fields.setdefault('is_superuser', False)

        # A brand-new user is never active until email verification completes,
        # regardless of who created the account (public or Administrator).
        extra_fields.setdefault('is_active', False)

        return self._create_user(email, password, **extra_fields)

    def create_superuser(self, email, password=None, **extra_fields):
        """
        Used ONLY for bootstrapping the very first Administrator account
        via `python manage.py createsuperuser`.

        This is the one legitimate exception to "no user is active until
        verified" — the platform has no way to send/verify an email to
        itself, and there is no other Administrator yet to create this one.
        """
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)
        extra_fields.setdefault('role', 'ADMINISTRATOR')
        extra_fields.setdefault('status', 'ACTIVE')

        if extra_fields.get('is_staff') is not True:
            raise ValueError("Superuser must have is_staff=True.")
        if extra_fields.get('is_superuser') is not True:
            raise ValueError("Superuser must have is_superuser=True.")

        return self._create_user(email, password, **extra_fields)