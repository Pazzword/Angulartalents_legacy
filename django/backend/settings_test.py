# backend/settings_test.py

from .settings import *
from mongoengine import connect, disconnect

# Notify that test settings are being used
print("Using test settings with real MongoDB instance")

# Disconnect any existing connections to avoid conflicts
try:
    disconnect(alias='default')
except:
    pass

# Connect mongoengine to the local MongoDB instance
connect(
    db='testdb',
    host='localhost',
    port=27017,
    alias='default'
)

# Disable sending real emails
EMAIL_BACKEND = 'django.core.mail.backends.locmem.EmailBackend'

# Use in-memory SQLite for Django components
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': ':memory:',
    }
}

# Override DEBUG for testing
DEBUG = False

# Optional: Reduce logging verbosity during tests
LOGGING = {
    'version': 1,
    'disable_existing_loggers': True,
    'handlers': {
        'null': {
            'class': 'logging.NullHandler',
        },
    },
    'root': {
        'handlers': ['null'],
        'level': 'CRITICAL',
    },
}

# Any other test-specific settings
