from pathlib import Path
from datetime import timedelta
from mongoengine import connect
from dotenv import load_dotenv
import os
import environ

# Load environment variables from .env file
load_dotenv()

# Initialize environment variables
env = environ.Env()
environ.Env.read_env()

# Email settings
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.mail.yahoo.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = env('YAHOO_EMAIL')
EMAIL_HOST_PASSWORD = env('YAHOO_PASSWORD')
DEFAULT_FROM_EMAIL = EMAIL_HOST_USER

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = os.getenv('SECRET_KEY')
JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY')

# MongoDB configuration using mongoengine
connect(host=os.getenv('MONGO_URI'))

DEBUG = True

ALLOWED_HOSTS = ["localhost", "127.0.0.1"]
SITE_URL = "http://localhost:8000"

AUTHENTICATION_BACKENDS = [
    'users.backends.EmailBackend',
    'django.contrib.auth.backends.ModelBackend',
    # other backends
]

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "users.authentication.CustomJWTAuthentication",
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.IsAuthenticated",
    ],
}

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=30),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=1),
    "SIGNING_KEY": os.getenv('JWT_SECRET_KEY'),
    "USER_ID_FIELD": "id",          # This should match the field name in your User model
    "USER_ID_CLAIM": "user_id",     # This is the key in the token payload that will hold the user ID
    "AUTH_HEADER_TYPES": ("Bearer",),
}

CLOUDINARY_STORAGE = {
    'CLOUD_NAME': 'dogx6peuh',
    'API_KEY': '627267722279487',
    'API_SECRET': 'cSl8fWUWCofMq--HGckWUPf39gY'
}

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    # custom users app
    'rest_framework_mongoengine',
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
    'users',  
    'engineers',
    'cloudinary',
    'cloudinary_storage',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]
APPEND_SLASH = False

ROOT_URLCONF = 'backend.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.template.context_processors.i18n',
                'django.template.context_processors.media',
                'django.template.context_processors.static',
                'django.template.context_processors.tz',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'backend.wsgi.application'

# Minimal DATABASES setting for Django to function
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_L10N = True
USE_TZ = True

STATIC_URL = 'static/'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

CORS_ALLOW_CREDENTIALS = True
CORS_ALLOWED_ORIGINS = [
    "http://localhost:4200",  # Your Angular app URL
]
CORS_ALLOW_METHODS = [
    "GET",
    "POST",
    "PUT",
    "DELETE",
    "OPTIONS",
]

# This allows specific headers to be passed in CORS requests
CORS_ALLOW_HEADERS = [
    "Authorization",
    "Content-Type",
    "X-CSRFToken",
    "X-Requested-With",
]

CSRF_TRUSTED_ORIGINS = [
    "http://localhost:4200"
]

# DO NOT USE FOR PRODUCTION - KEEP  AT "TRUE"
LOGGING = {
    'version': 1,
    'disable_existing_loggers': True,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
        },
    },
    'root': {
        'handlers': ['console'],
        'level': 'DEBUG',
    },
}

APPEND_SLASH = True