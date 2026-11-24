
"""
Django settings for the Intelligent Agriculture System project.
"""

from pathlib import Path
from datetime import timedelta
from decouple import config

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# =========================================================
# SECURITY
# =========================================================
SECRET_KEY = config('SECRET_KEY')
DEBUG = config('DEBUG', default=False, cast=bool)
ALLOWED_HOSTS = [h for h in config('ALLOWED_HOSTS', default='*').split(',') if h]
if DEBUG:
    ALLOWED_HOSTS.extend(['*', 'localhost', '127.0.0.1', '192.168.43.145'])
    CORS_ALLOW_ALL_ORIGINS = True

# =========================================================
# APPLICATION DEFINITION
# =========================================================
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # Third-party apps
    'rest_framework',
    'rest_framework_simplejwt',
    'rest_framework_simplejwt.token_blacklist',
    'corsheaders',
    'django_filters',

    # Local apps
    'accounts',
    'locations',
    'predictions',
    'consultations',
    'education',
    'notifications',
    'reports',
    'administration',
    'chat',
    'community',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'config.wsgi.application'

# =========================================================
# DATABASE
# =========================================================
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': config('DB_NAME'),
        'USER': config('DB_USER'),
        'PASSWORD': config('DB_PASSWORD'),
        'HOST': config('DB_HOST'),
        'PORT': config('DB_PORT'),
    }
}

# =========================================================
# CUSTOM USER MODEL
# (Model itself created in Step 7 — declared here now so
# migrations are never generated against the default User)
# =========================================================
AUTH_USER_MODEL = 'accounts.User'

# =========================================================
# PASSWORD VALIDATION
# =========================================================
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator', 'OPTIONS': {'min_length': 8}},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
    {'NAME': 'accounts.validators.ComplexPasswordValidator'},
]
# Note: our custom complexity rule (upper+lower+digit+special char)
# will be enforced by a custom validator added in Step 9,
# in addition to these built-in Django validators.

# =========================================================
# INTERNATIONALIZATION
# =========================================================
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'Africa/Addis_Ababa'
USE_I18N = True
USE_TZ = True

# =========================================================
# STATIC FILES
# =========================================================
STATIC_URL = 'static/'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'


# =========================================================
# MEDIA FILES (uploaded/stored images — e.g. prediction images)
# =========================================================
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

# =========================================================
# DJANGO REST FRAMEWORK
# =========================================================
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
    'DEFAULT_FILTER_BACKENDS': (
        'django_filters.rest_framework.DjangoFilterBackend',
    ),
    'EXCEPTION_HANDLER': 'accounts.exceptions.custom_exception_handler',
}

# =========================================================
# SIMPLE JWT
# =========================================================
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=15),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'UPDATE_LAST_LOGIN': True,
    'AUTH_HEADER_TYPES': ('Bearer',),
    'USER_ID_FIELD': 'id',
    'USER_ID_CLAIM': 'user_id',
}

# =========================================================
# CORS
# =========================================================
CORS_ALLOWED_ORIGINS = config('CORS_ALLOWED_ORIGINS', default='').split(',')

# =========================================================
# EMAIL
# =========================================================
EMAIL_BACKEND = config('EMAIL_BACKEND')
EMAIL_HOST = config('EMAIL_HOST', default='')
EMAIL_PORT = config('EMAIL_PORT', default=587, cast=int)
EMAIL_USE_TLS = config('EMAIL_USE_TLS', default=True, cast=bool)
EMAIL_USE_SSL = config('EMAIL_USE_SSL', default=False, cast=bool)
EMAIL_HOST_USER = config('EMAIL_HOST_USER', default='')
EMAIL_HOST_PASSWORD = config('EMAIL_HOST_PASSWORD', default='')
DEFAULT_FROM_EMAIL = config('DEFAULT_FROM_EMAIL', default='')

# =========================================================
# FRONTEND URL (for building verification/reset links)
# =========================================================
FRONTEND_URL = config('FRONTEND_URL')

# =========================================================
# AI DISEASE DETECTION SERVICE (external, independent system)
# =========================================================
AI_SERVICE_URL = config('AI_SERVICE_URL')
AI_SERVICE_TIMEOUT = config('AI_SERVICE_TIMEOUT', default=30, cast=int)