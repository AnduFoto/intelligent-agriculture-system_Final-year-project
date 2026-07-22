from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.utils import timezone

from accounts.models import EmailVerificationToken, PasswordResetToken


def send_verification_email(user):
    """
    Creates a new EmailVerificationToken for the given user and emails
    them a verification link pointing to the frontend.
    """
    token = EmailVerificationToken.objects.create(user=user)

    verification_url = f"{settings.FRONTEND_URL}/verify-email/{token.token}"
    expiry_hours = int(
        (token.expires_at - token.created_at).total_seconds() // 3600
    )

    context = {
        'first_name': user.first_name,
        'verification_url': verification_url,
        'expiry_hours': expiry_hours,
    }

    html_content = render_to_string('accounts/emails/verification_email.html', context)
    text_content = strip_tags(html_content)

    email = EmailMultiAlternatives(
        subject="Verify Your Email — Intelligent Agriculture System",
        body=text_content,
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=[user.email],
    )
    email.attach_alternative(html_content, "text/html")
    email.send(fail_silently=False)

    return token


def send_password_reset_email(user):
    """
    Invalidates any previously unused PasswordResetTokens for this user,
    creates a fresh one, and emails a reset link pointing to the frontend.
    """
    # Invalidate old unused tokens so only the newest link works.
    PasswordResetToken.objects.filter(user=user, used=False).update(
        used=True,
        used_at=timezone.now()
    )

    token = PasswordResetToken.objects.create(user=user)

    reset_url = f"{settings.FRONTEND_URL}/reset-password/{token.token}"
    expiry_minutes = int(
        (token.expires_at - token.created_at).total_seconds() // 60
    )

    context = {
        'first_name': user.first_name,
        'reset_url': reset_url,
        'expiry_minutes': expiry_minutes,
    }

    html_content = render_to_string('accounts/emails/password_reset_email.html', context)
    text_content = strip_tags(html_content)

    email = EmailMultiAlternatives(
        subject="Reset Your Password — Intelligent Agriculture System",
        body=text_content,
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=[user.email],
    )
    email.attach_alternative(html_content, "text/html")
    email.send(fail_silently=False)

    return token