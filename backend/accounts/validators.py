import re
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _


class ComplexPasswordValidator:
    """
    Enforces password complexity beyond Django's built-in validators:
    - Minimum 8 characters (also covered by MinimumLengthValidator, kept here for a clear combined message)
    - At least one uppercase letter
    - At least one lowercase letter
    - At least one digit
    - At least one special character
    """

    SPECIAL_CHARACTERS = r"""!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~"""

    def validate(self, password, user=None):
        errors = []

        if len(password) < 8:
            errors.append(_("Password must be at least 8 characters long."))

        if not re.search(r'[A-Z]', password):
            errors.append(_("Password must contain at least one uppercase letter."))

        if not re.search(r'[a-z]', password):
            errors.append(_("Password must contain at least one lowercase letter."))

        if not re.search(r'\d', password):
            errors.append(_("Password must contain at least one number."))

        if not any(char in self.SPECIAL_CHARACTERS for char in password):
            errors.append(_("Password must contain at least one special character."))

        if errors:
            raise ValidationError(errors)

    def get_help_text(self):
        return _(
            "Your password must be at least 8 characters long and include "
            "at least one uppercase letter, one lowercase letter, one number, "
            "and one special character."
        )